import * as Yup from 'yup';
import Address from '../models/Address.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import StoreSetting from '../models/StoreSetting.js';
import { randomUUID } from 'node:crypto';
import { createCheckoutProPreference, getMercadoPagoNotificationUrl } from '../../config/mercadoPago.js';
import { buildCheckoutReturnUrl, getFrontendAppUrl } from '../../config/appUrls.js';
import { calculateShippingQuotes, getStorePickupQuote, STORE_PICKUP_SERVICE_ID } from '../../services/shipping.js';
import { findValidCouponByCode } from '../../services/coupons.js';
import { sendServerError } from '../../utils/http.js';

const checkoutSchema = Yup.object({
    items: Yup.array().of(
        Yup.object({
            id: Yup.number().integer().required(),
            quantity: Yup.number().integer().min(1).max(99).required(),
            selected_color_name: Yup.string().nullable(),
            selected_color_hex: Yup.string().nullable(),
        })
    ).min(1).required(),
    customerEmail: Yup.string().trim().email().nullable(),
    address_id: Yup.number().integer().required(),
    shipping_service_id: Yup.string().trim().required(),
    coupon_code: Yup.string().trim().nullable(),
}).noUnknown(true);

function buildSuccessUrl() {
    return buildCheckoutReturnUrl('approved');
}

function buildCancelUrl() {
    return buildCheckoutReturnUrl('rejected');
}

function buildPendingUrl() {
    return buildCheckoutReturnUrl('pending');
}

function buildPreferenceItemsFromOrder(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    const discountCents = Math.round(Number(order.discount_amount || 0) * 100);

    const distributedUnits = distributeDiscountAcrossUnits(
        items.map((item) => ({
            quantity: Number(item.quantity),
            unit_amount: Math.round(Number(item.unit_price) * 100),
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_id: item.product_id,
        })),
        discountCents
    );

    const productLineItems = distributedUnits.map((unit) => ({
        quantity: 1,
        title: unit.product_name,
        currency_id: (order.currency || 'brl').toUpperCase(),
        unit_price: Number((unit.unit_amount / 100).toFixed(2)),
        description: unit.product_slug ? `Produto ${unit.product_slug}` : undefined,
    }));

    if (Number(order.shipping_price || 0) <= 0) {
        return productLineItems;
    }

    return [
        ...productLineItems,
        {
            quantity: 1,
            title: `Frete - ${order.shipping_company_name || 'Correios'}`,
            currency_id: (order.currency || 'brl').toUpperCase(),
            unit_price: Number(Number(order.shipping_price || 0).toFixed(2)),
            description: `${order.shipping_service_name || 'Entrega'}${order.shipping_delivery_time ? ` em até ${order.shipping_delivery_time} dia(s) úteis` : ''}`,
        },
    ];
}

function getMaxInstallmentsFromProducts(products = []) {
    if (!Array.isArray(products) || products.length === 0) {
        return 1;
    }

    if (products.some((product) => product?.installments_enabled === false)) {
        return 1;
    }

    return Math.max(
        1,
        ...products.map((product) => Math.max(1, Number(product?.installments_count || 1)))
    );
}

function shouldSendPayerEmail(payerEmail) {
    const normalizedEmail = String(payerEmail || '').trim().toLowerCase();

    if (!normalizedEmail) {
        return false;
    }

    // In local/sandbox tests, sending a real customer email can make Checkout Pro
    // treat the buyer side as non-test and reject the flow.
    const runningLocally = getFrontendAppUrl().includes('localhost');
    if (runningLocally) {
        return normalizedEmail.endsWith('@testuser.com');
    }

    return true;
}

function buildPreferencePayload({ items, payerEmail, externalReference, backendPublicUrl = null, maxInstallments = 1 }) {
    const notificationUrl = getMercadoPagoNotificationUrl(backendPublicUrl);

    return {
        items,
        payer: shouldSendPayerEmail(payerEmail) ? { email: payerEmail } : undefined,
        external_reference: String(externalReference),
        back_urls: {
            success: buildSuccessUrl(),
            failure: buildCancelUrl(),
            pending: buildPendingUrl(),
        },
        auto_return: 'approved',
        notification_url: notificationUrl || undefined,
        payment_methods: {
            installments: Math.max(1, Number(maxInstallments || 1)),
        },
    };
}

function distributeDiscountAcrossUnits(items, discountCents) {
    const totalSubtotalCents = items.reduce((acc, item) => acc + (Number(item.unit_amount) * Number(item.quantity)), 0);

    if (!discountCents || discountCents <= 0 || totalSubtotalCents <= 0) {
        return items.flatMap((item) => Array.from({ length: Number(item.quantity) }, () => ({
            unit_amount: Number(item.unit_amount),
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_id: item.product_id,
        })));
    }

    const expandedUnits = items.flatMap((item) => Array.from({ length: Number(item.quantity) }, (_, index) => {
        const rawShare = (discountCents * Number(item.unit_amount)) / totalSubtotalCents;
        const baseDiscount = Math.floor(rawShare);
        const remainder = rawShare - baseDiscount + (index * 0.000001);

        return {
            unit_amount: Number(item.unit_amount),
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_id: item.product_id,
            discount: baseDiscount,
            remainder,
        };
    }));

    let allocated = expandedUnits.reduce((acc, unit) => acc + unit.discount, 0);
    let remaining = Math.max(0, discountCents - allocated);

    expandedUnits
        .sort((a, b) => b.remainder - a.remainder)
        .forEach((unit) => {
            if (remaining > 0) {
                unit.discount += 1;
                remaining -= 1;
            }
        });

    return expandedUnits.map((unit) => ({
        unit_amount: Math.max(1, unit.unit_amount - unit.discount),
        product_name: unit.product_name,
        product_slug: unit.product_slug,
        product_id: unit.product_id,
    }));
}

class CheckoutController {
    async handleCheckoutReturn(req, res) {
        try {
            const frontendUrl = getFrontendAppUrl();
            const targetUrl = new URL('/carrinho', frontendUrl);

            Object.entries(req.query || {}).forEach(([key, value]) => {
                if (value == null) return;

                if (Array.isArray(value)) {
                    value.forEach((entry) => targetUrl.searchParams.append(key, String(entry)));
                    return;
                }

                targetUrl.searchParams.set(key, String(value));
            });

            return res.redirect(targetUrl.toString());
        } catch (error) {
            return sendServerError(res, 'Erro ao processar retorno do checkout.', error);
        }
    }

    async createSession(req, res) {
        try {
            await checkoutSchema.validate(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados de checkout inválidos.'] });
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
                selected_color_name: item.selected_color_name ? String(item.selected_color_name).trim() : null,
                selected_color_hex: item.selected_color_hex ? String(item.selected_color_hex).trim() : null,
            }));

            const productIds = [...new Set(normalizedItems.map((item) => item.id))];
            const products = await Product.findAll({ where: { id: productIds } });

            if (products.length !== productIds.length) {
                return res.status(400).json({ error: 'Um ou mais produtos do carrinho não foram encontrados.' });
            }

            const productsById = new Map(products.map((product) => [product.id, product]));
            const maxInstallments = getMaxInstallmentsFromProducts(products);

            const cartItems = normalizedItems.map((item) => {
                const product = productsById.get(item.id);

                if (!product) {
                    throw new Error('Produto não encontrado durante a montagem do checkout.');
                }

                if (Number(product.stock_quantity) < item.quantity) {
                    throw new Error(`Estoque insuficiente para "${product.name}".`);
                }

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

            const storeSettings = await StoreSetting.findByPk(1);
            const selectedShipping = String(req.body.shipping_service_id) === STORE_PICKUP_SERVICE_ID
                ? getStorePickupQuote()
                : (await calculateShippingQuotes({
                    toPostalCode: address.cep,
                    cartItems,
                    storeSettings,
                })).find(
                    (quote) => quote.service_id === String(req.body.shipping_service_id)
                );

            if (!selectedShipping) {
                return res.status(400).json({ error: 'A opção de frete selecionada não está mais disponível.' });
            }

            const subtotalAmount = cartItems.reduce(
                (total, item) => total + (Number(item.price) * item.quantity),
                0
            );
            let couponData = null;
            let discountAmount = 0;

            if (req.body.coupon_code) {
                const validatedCoupon = await findValidCouponByCode(req.body.coupon_code, subtotalAmount);
                couponData = validatedCoupon.coupon;
                discountAmount = validatedCoupon.discountAmount;
            }

            const shippingAmount = Number(selectedShipping.price);
            const totalAmount = subtotalAmount + shippingAmount - discountAmount;
            const preferenceItems = distributeDiscountAcrossUnits(
                normalizedItems.map((item) => {
                    const product = productsById.get(item.id);
                    return {
                        quantity: item.quantity,
                        unit_amount: Math.round(Number(product.price) * 100),
                        product_name: product.name,
                        product_slug: product.slug,
                        product_id: product.id,
                    };
                }),
                Math.round(discountAmount * 100)
            ).map((unit) => ({
                title: unit.product_name,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: Number((unit.unit_amount / 100).toFixed(2)),
            }));

            if (shippingAmount > 0) {
                preferenceItems.push({
                    title: `Frete - ${selectedShipping.company_name}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: Number(shippingAmount.toFixed(2)),
                    description: `${selectedShipping.service_name} em até ${selectedShipping.delivery_time} dia(s) úteis`,
                });
            }

            const transaction = await Order.sequelize.transaction();

            try {
                const temporaryReference = `mp_pref_pending_${randomUUID()}`;
                const order = await Order.create({
                    user_id: req.userId,
                    payment_reference: temporaryReference,
                    payment_transaction_id: null,
                    customer_email: req.body.customerEmail || null,
                    customer_name: address.recipient_name,
                    customer_phone: address.phone,
                    shipping_service_id: selectedShipping.service_id,
                    shipping_service_name: selectedShipping.service_name,
                    shipping_company_name: selectedShipping.company_name,
                    shipping_price: shippingAmount,
                    shipping_delivery_time: selectedShipping.service_id === STORE_PICKUP_SERVICE_ID ? 0 : selectedShipping.delivery_time,
                    shipping_address_json: JSON.stringify({
                        label: address.label,
                        recipient_name: address.recipient_name,
                        phone: address.phone,
                        cep: address.cep,
                        street: address.street,
                        number: address.number,
                        complement: address.complement,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                        reference: address.reference,
                    }),
                    shipping_quote_json: JSON.stringify(selectedShipping.raw),
                    status: 'aguardando_pagamento',
                    currency: 'brl',
                    subtotal_amount: subtotalAmount,
                    coupon_code: couponData?.code || null,
                    coupon_description: couponData?.description || null,
                    discount_amount: discountAmount,
                    total_amount: totalAmount,
                }, { transaction });

                const preference = await createCheckoutProPreference(buildPreferencePayload({
                    items: preferenceItems,
                    payerEmail: req.body.customerEmail || null,
                    externalReference: order.id,
                    backendPublicUrl: null,
                    maxInstallments,
                }));

                await order.update({
                    payment_reference: preference.id,
                    payment_transaction_id: null,
                }, { transaction });

                await OrderItem.bulkCreate(
                    normalizedItems.map((item) => {
                        const product = productsById.get(item.id);
                        const unitPrice = Number(product.price);

                        return {
                            order_id: order.id,
                            product_id: product.id,
                            product_name: product.name,
                            product_slug: product.slug,
                            product_image: product.path,
                            selected_color_name: item.selected_color_name || null,
                            selected_color_hex: item.selected_color_hex || null,
                            unit_price: unitPrice,
                            quantity: item.quantity,
                            total_price: unitPrice * item.quantity,
                        };
                    }),
                    { transaction }
                );

                await transaction.commit();

                return res.status(201).json({
                    id: preference.id,
                    url: preference.sandbox_init_point || preference.init_point,
                    orderId: order.id,
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            if (
                error.message?.startsWith('Estoque insuficiente')
                || error.message?.includes('Cupom')
                || error.message?.includes('desconto')
                || error.message?.includes('pedido mínimo')
            ) {
                return res.status(400).json({ error: error.message });
            }

            return sendServerError(res, 'Erro ao criar sessão de pagamento', error);
        }
    }

    async retryPayment(req, res) {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({ error: 'Pedido inválido.' });
        }

        try {
            const order = await Order.findOne({
                where: { id: orderId, user_id: req.userId },
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                    },
                ],
            });

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!['aguardando_pagamento', 'expirado'].includes(order.status)) {
                return res.status(400).json({ error: 'Este pedido não está disponível para novo pagamento.' });
            }

            if (!Array.isArray(order.items) || order.items.length === 0) {
                return res.status(400).json({ error: 'Este pedido não possui itens para pagamento.' });
            }

            const retryProductIds = [...new Set(order.items.map((item) => Number(item.product_id)).filter(Boolean))];
            const retryProducts = retryProductIds.length > 0
                ? await Product.findAll({ where: { id: retryProductIds } })
                : [];
            const maxInstallments = retryProducts.length === retryProductIds.length
                ? getMaxInstallmentsFromProducts(retryProducts)
                : 1;

            const preference = await createCheckoutProPreference(buildPreferencePayload({
                items: buildPreferenceItemsFromOrder(order),
                payerEmail: order.customer_email || null,
                externalReference: order.id,
                backendPublicUrl: null,
                maxInstallments,
            }));

            await order.update({
                payment_reference: preference.id,
                payment_transaction_id: null,
                status: 'aguardando_pagamento',
            });

            return res.status(200).json({
                id: preference.id,
                url: preference.sandbox_init_point || preference.init_point,
                orderId: order.id,
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao gerar novo pagamento para o pedido.', error);
        }
    }
}

export default new CheckoutController();
