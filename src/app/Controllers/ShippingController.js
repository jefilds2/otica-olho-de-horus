import * as Yup from 'yup';
import Address from '../models/Address.js';
import Product from '../models/Product.js';
import StoreSetting from '../models/StoreSetting.js';
import { calculateShippingQuotes } from '../../services/shipping.js';
import { sendServerError } from '../../utils/http.js';
import { assertStockAvailability } from '../../utils/inventory.js';

const schema = Yup.object({
    address_id: Yup.number().integer().required(),
    items: Yup.array().of(
        Yup.object({
            id: Yup.number().integer().required(),
            quantity: Yup.number().integer().min(1).max(99).required(),
        })
    ).min(1).required(),
}).noUnknown(true);

class ShippingController {
    async quote(req, res) {
        try {
            await schema.validate(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados inválidos para cotação de frete.'] });
        }

        try {
            const address = await Address.findOne({
                where: { id: req.body.address_id, user_id: req.userId },
            });

            if (!address) {
                return res.status(404).json({ error: 'Endereço de entrega não encontrado.' });
            }

            const normalizedItems = req.body.items.map((item) => ({
                id: Number(item.id),
                quantity: Number(item.quantity),
            }));

            const productIds = [...new Set(normalizedItems.map((item) => item.id))];
            const products = await Product.findAll({ where: { id: productIds } });

            if (products.length !== productIds.length) {
                return res.status(400).json({ error: 'Um ou mais produtos do carrinho não foram encontrados.' });
            }

            const productMap = new Map(products.map((product) => [product.id, product]));
            assertStockAvailability({
                items: normalizedItems,
                productsById: productMap,
                getProductId: (item) => item.id,
                getQuantity: (item) => item.quantity,
                getProductName: (product) => product.name,
                missingProductMessage: 'Um ou mais produtos do carrinho não foram encontrados.',
                inactiveProductMessage: ({ productName }) => (
                    `Estoque insuficiente para "${productName}". Restam 0 unidade(s) em estoque.`
                ),
                insufficientStockMessage: ({ productName, availableQuantity }) => (
                    `Estoque insuficiente para "${productName}". Restam ${availableQuantity} unidade(s) em estoque.`
                ),
            });

            const cartItems = normalizedItems.map((item) => {
                const product = productMap.get(item.id);

                return {
                    id: product.id,
                    quantity: item.quantity,
                    price: Number(product.price),
                    weight: Number(product.weight),
                    width: Number(product.width),
                    height: Number(product.height),
                    length: Number(product.length),
                };
            });

            const quotes = await calculateShippingQuotes({
                toPostalCode: address.cep,
                cartItems,
                storeSettings: await StoreSetting.findByPk(1),
            });

            if (quotes.length === 0) {
                return res.status(400).json({ error: 'Nenhuma opção de frete disponível para este endereço.' });
            }

            return res.status(200).json({
                address: {
                    id: address.id,
                    label: address.label,
                    cep: address.cep,
                    city: address.city,
                    state: address.state,
                },
                quotes,
            });
        } catch (error) {
            if (error.message?.startsWith('Estoque insuficiente')) {
                return res.status(400).json({ error: error.message });
            }

            if (error.message?.includes('Nenhuma opção dos Correios está disponível')) {
                return res.status(400).json({ error: error.message });
            }

            return sendServerError(res, 'Erro ao calcular frete.', error);
        }
    }
}

export default new ShippingController();
