import * as Yup from 'yup';
import { Op } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { sendServerError } from '../../utils/http.js';

const normalizeText = (value) => value == null ? null : String(value).trim();
const normalizeDecimal = (value) => value == null || value === '' ? null : Number(value);
const normalizeInteger = (value) => value == null || value === '' ? null : Number.parseInt(value, 10);
const normalizeImagePaths = (files = []) => files.map((file) => file.filename).filter(Boolean).slice(0, 3);
const parseStoredImagePaths = (product) => {
    if (!product) return [];

    try {
        const parsed = product.image_paths ? JSON.parse(product.image_paths) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(Boolean).slice(0, 3);
        }
    } catch {
        // Mantém compatibilidade com registros antigos.
    }

    return product.path ? [product.path] : [];
};

const normalizeExistingImagePaths = (value, product) => {
    if (value == null || value === '') {
        return parseStoredImagePaths(product);
    }

    const parsed = typeof value === 'string' ? JSON.parse(value) : value;

    if (!Array.isArray(parsed)) {
        throw new Error('Imagens existentes inválidas.');
    }

    return parsed
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .slice(0, 3);
};

const normalizeAvailableColors = (value) => {
    if (!value) return null;

    const parsed = typeof value === 'string' ? JSON.parse(value) : value;

    if (!Array.isArray(parsed)) {
        throw new Error('Cores disponíveis inválidas.');
    }

    return parsed
        .map((item) => ({
            name: normalizeText(item?.name),
            hex: normalizeText(item?.hex),
        }))
        .filter((item) => item.name && item.hex);
};

const normalizeInstallments = (body) => {
    const installmentsEnabled = body.installments_enabled !== undefined
        ? String(body.installments_enabled) === 'true'
        : true;

    const installmentsCount = installmentsEnabled
        ? Number(body.installments_count || 1)
        : 1;

    if (installmentsEnabled && (!Number.isInteger(installmentsCount) || installmentsCount < 1 || installmentsCount > 24)) {
        throw new Error('Número de parcelas inválido. Use entre 1 e 24.');
    }

    return {
        installments_enabled: installmentsEnabled,
        installments_count: installmentsCount,
    };
};

const nullableNumberField = () => Yup.number()
    .transform((currentValue, originalValue) => {
        if (originalValue === '' || originalValue == null) return null;
        return currentValue;
    })
    .nullable();

class ProductController {

    async index(req, res) {
        try {
            const products = await Product.findAll({
                where: {
                    stock_quantity: {
                        [Op.gt]: 0,
                    },
                },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'slug', 'path'],
                    },
                ],
            });

            return res.status(200).json(products);
        } catch (error) {
            return sendServerError(res, 'Erro ao listar produtos', error);
        }
    }

    async indexAdmin(req, res) {
        try {
            const products = await Product.findAll({
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'slug', 'path'],
                    },
                ],
            });

            return res.status(200).json(products);
        } catch (error) {
            return sendServerError(res, 'Erro ao listar produtos no admin', error);
        }
    }

    async store(req, res) {
        const schema = Yup.object().shape({ //Validação de dados do produto
            name: Yup.string().trim().required().min(3).max(255),
            description: Yup.string().trim().required().min(10),
            brand: Yup.string().trim().required(),
            color: Yup.string().trim().required(),
            price: Yup.number().required().positive(),
            old_price: nullableNumberField().moreThan(Yup.ref('price')),
            discount_percentage: nullableNumberField().integer().min(0).max(100),
            stock_quantity: Yup.number().required().integer().min(0),
            installments_enabled: Yup.boolean().default(true),
            installments_count: Yup.number().integer().min(1).max(24).nullable(),
            weight: Yup.number().required().positive(),
            width: Yup.number().required().positive(),
            height: Yup.number().required().positive(),
            length: Yup.number().required().positive(),
            available_colors: Yup.mixed().nullable(),
            frame_material: Yup.string().trim().nullable(),
            size_label: Yup.string().trim().nullable(),
            lens_width_mm: Yup.number().integer().positive().nullable(),
            bridge_mm: Yup.number().integer().positive().nullable(),
            temple_length_mm: Yup.number().integer().positive().nullable(),
            gender: Yup.string().trim().nullable(),
            existing_image_paths: Yup.mixed().nullable(),
            slug: Yup.string().required().matches(/^[a-z0-9-]+$/),
            category_id: Yup.number().required().integer(),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados do produto inválidos'] });
        }

        try {
            const { slug, category_id, price, old_price } = req.body; //

            const productExists = await Product.findOne({ where: { slug } });

            if (productExists) { //Confere se o slug ja esta em uso
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            const categoryExists = await Category.findByPk(category_id);

            if (!categoryExists) { //Confere se a categoria existe
                return res.status(400).json({ error: 'Categoria não encontrada' });
            }

            if (old_price && Number(old_price) <= Number(price)) { //Confere se o preco antigo e maior que o preco atual
                return res.status(400).json({
                    error: 'O preço antigo deve ser maior que o preço atual',
                });
            }

            const imagePaths = normalizeImagePaths(req.files);
            const path = imagePaths[0];

            if (!path) { //Caso nao tenha sido enviada, retorna erro
                return res.status(400).json({ error: 'Envie entre 1 e 3 imagens do produto.' });
            }

            const installments = normalizeInstallments(req.body);
            const availableColors = normalizeAvailableColors(req.body.available_colors);
            const normalizedPrice = normalizeDecimal(req.body.price);
            const normalizedOldPrice = normalizeDecimal(req.body.old_price);
            const normalizedDiscountPercentage = normalizeInteger(req.body.discount_percentage);

            const product = await Product.create({ //Cria o produto no BD
                ...req.body,
                name: normalizeText(req.body.name),
                description: normalizeText(req.body.description),
                brand: normalizeText(req.body.brand),
                color: normalizeText(req.body.color),
                slug: normalizeText(req.body.slug),
                price: normalizedPrice,
                old_price: normalizedOldPrice,
                discount_percentage: normalizedOldPrice ? normalizedDiscountPercentage : null,
                weight: normalizeDecimal(req.body.weight),
                width: normalizeDecimal(req.body.width),
                height: normalizeDecimal(req.body.height),
                length: normalizeDecimal(req.body.length),
                available_colors: availableColors ? JSON.stringify(availableColors) : null,
                frame_material: normalizeText(req.body.frame_material),
                size_label: normalizeText(req.body.size_label),
                lens_width_mm: normalizeInteger(req.body.lens_width_mm),
                bridge_mm: normalizeInteger(req.body.bridge_mm),
                temple_length_mm: normalizeInteger(req.body.temple_length_mm),
                gender: normalizeText(req.body.gender),
                path,
                image_paths: JSON.stringify(imagePaths),
                ...installments,
            });

            return res.status(201).json(product); //Retorna o produto criado

        } catch (error) {
            if (error.message === 'Número de parcelas inválido. Use entre 1 e 24.' || error.message === 'Cores disponíveis inválidas.') {
                return res.status(400).json({ error: error.message });
            }
            return sendServerError(res, 'Erro ao cadastrar produto', error);
        }
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().trim().required().min(3).max(255),
            description: Yup.string().trim().required().min(10),
            brand: Yup.string().trim().required(),
            color: Yup.string().trim().required(),
            price: Yup.number().required().positive(),
            old_price: nullableNumberField().moreThan(Yup.ref('price')),
            discount_percentage: nullableNumberField().integer().min(0).max(100),
            stock_quantity: Yup.number().required().integer().min(0),
            installments_enabled: Yup.boolean().default(true),
            installments_count: Yup.number().integer().min(1).max(24).nullable(),
            weight: Yup.number().required().positive(),
            width: Yup.number().required().positive(),
            height: Yup.number().required().positive(),
            length: Yup.number().required().positive(),
            available_colors: Yup.mixed().nullable(),
            frame_material: Yup.string().trim().nullable(),
            size_label: Yup.string().trim().nullable(),
            lens_width_mm: Yup.number().integer().positive().nullable(),
            bridge_mm: Yup.number().integer().positive().nullable(),
            temple_length_mm: Yup.number().integer().positive().nullable(),
            gender: Yup.string().trim().nullable(),
            slug: Yup.string().required().matches(/^[a-z0-9-]+$/),
            category_id: Yup.number().required().integer(),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados do produto inválidos'] });
        }

        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            const { slug, category_id, price, old_price } = req.body;
            const productExists = await Product.findOne({ where: { slug } });

            if (productExists && productExists.id !== product.id) {
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            const categoryExists = await Category.findByPk(category_id);

            if (!categoryExists) {
                return res.status(400).json({ error: 'Categoria não encontrada' });
            }

            if (old_price && Number(old_price) <= Number(price)) {
                return res.status(400).json({
                    error: 'O preço antigo deve ser maior que o preço atual',
                });
            }

            const installments = normalizeInstallments(req.body);
            const availableColors = normalizeAvailableColors(req.body.available_colors);
            const imagePaths = normalizeImagePaths(req.files);
            const existingImagePaths = normalizeExistingImagePaths(req.body.existing_image_paths, product);
            const combinedImagePaths = [...existingImagePaths, ...imagePaths].slice(0, 3);
            const normalizedPrice = normalizeDecimal(req.body.price);
            const normalizedOldPrice = normalizeDecimal(req.body.old_price);
            const normalizedDiscountPercentage = normalizeInteger(req.body.discount_percentage);

            if (combinedImagePaths.length === 0) {
                return res.status(400).json({ error: 'Mantenha pelo menos uma imagem do produto.' });
            }

            await product.update({
                ...req.body,
                name: normalizeText(req.body.name),
                description: normalizeText(req.body.description),
                brand: normalizeText(req.body.brand),
                color: normalizeText(req.body.color),
                slug: normalizeText(req.body.slug),
                price: normalizedPrice,
                old_price: normalizedOldPrice,
                discount_percentage: normalizedOldPrice ? normalizedDiscountPercentage : null,
                weight: normalizeDecimal(req.body.weight),
                width: normalizeDecimal(req.body.width),
                height: normalizeDecimal(req.body.height),
                length: normalizeDecimal(req.body.length),
                available_colors: availableColors ? JSON.stringify(availableColors) : null,
                frame_material: normalizeText(req.body.frame_material),
                size_label: normalizeText(req.body.size_label),
                lens_width_mm: normalizeInteger(req.body.lens_width_mm),
                bridge_mm: normalizeInteger(req.body.bridge_mm),
                temple_length_mm: normalizeInteger(req.body.temple_length_mm),
                gender: normalizeText(req.body.gender),
                path: combinedImagePaths[0],
                image_paths: JSON.stringify(combinedImagePaths),
                ...installments,
            });

            return res.status(200).json(product);
        } catch (error) {
            if (
                error.message === 'Número de parcelas inválido. Use entre 1 e 24.'
                || error.message === 'Cores disponíveis inválidas.'
                || error.message === 'Imagens existentes inválidas.'
            ) {
                return res.status(400).json({ error: error.message });
            }
            return sendServerError(res, 'Erro ao atualizar produto', error);
        }
    }

    async destroy(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            await product.destroy();

            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir produto', error);
        }
    }
}

export default new ProductController();
