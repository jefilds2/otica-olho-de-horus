import * as Yup from 'yup';
import Coupon from '../models/Coupon.js';
import { literal } from 'sequelize';
import Product from '../models/Product.js';
import { findValidCouponByCode, normalizeCouponCode } from '../../services/coupons.js';
import { sendServerError } from '../../utils/http.js';

function normalizeOptionalString(value) {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized ? normalized : null;
}

function parseOptionalDate(value) {
    if (value == null || value === '') return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date('');
    }

    return parsed;
}

function buildGeneratedCouponCode() {
    return `CUPOM${Date.now().toString(36).toUpperCase()}`;
}

async function resolveCouponCode(rawCode, currentCouponId = null) {
    const baseCode = normalizeOptionalString(rawCode) || buildGeneratedCouponCode();
    let candidate = normalizeCouponCode(baseCode);
    let suffix = 1;

    while (true) {
        const existing = await Coupon.findOne({ where: { code: candidate } });
        if (!existing || existing.id === currentCouponId) {
            return candidate;
        }

        candidate = normalizeCouponCode(`${baseCode}-${suffix}`);
        suffix += 1;
    }
}

const couponSchema = Yup.object({
    code: Yup.string()
        .transform((_value, originalValue) => normalizeOptionalString(originalValue) || '')
        .max(40),
    description: Yup.string()
        .transform((_value, originalValue) => normalizeOptionalString(originalValue))
        .nullable(),
    type: Yup.string()
        .transform((_value, originalValue) => normalizeOptionalString(originalValue) || 'percentage')
        .oneOf(['percentage', 'fixed'])
        .default('percentage'),
    value: Yup.number()
        .transform((value, originalValue) => (originalValue == null || originalValue === '' ? 0 : value))
        .min(0)
        .default(0),
    min_order_amount: Yup.number()
        .transform((value, originalValue) => (originalValue == null || originalValue === '' ? null : value))
        .nullable()
        .min(0),
    usage_limit: Yup.number()
        .transform((value, originalValue) => (originalValue == null || originalValue === '' ? null : value))
        .integer()
        .nullable()
        .min(1),
    starts_at: Yup.date()
        .transform((_value, originalValue) => parseOptionalDate(originalValue))
        .nullable(),
    expires_at: Yup.date()
        .transform((_value, originalValue) => parseOptionalDate(originalValue))
        .nullable(),
    is_active: Yup.boolean()
        .transform((value, originalValue) => (originalValue == null || originalValue === '' ? true : value))
        .default(true),
}).noUnknown(true);

const validateSchema = Yup.object({
    code: Yup.string().trim().required(),
    items: Yup.array().of(
        Yup.object({
            id: Yup.number().integer().required(),
            quantity: Yup.number().integer().min(1).max(99).required(),
        })
    ).min(1).required(),
}).noUnknown(true);

function formatCoupon(coupon, discountPreview = null) {
    return {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        min_order_amount: coupon.min_order_amount == null ? null : Number(coupon.min_order_amount),
        usage_limit: coupon.usage_limit == null ? null : Number(coupon.usage_limit),
        usage_count: Number(coupon.usage_count || 0),
        starts_at: coupon.starts_at,
        expires_at: coupon.expires_at,
        is_active: Boolean(coupon.is_active),
        discount_preview: discountPreview == null ? null : Number(discountPreview),
    };
}

async function calculateCartSubtotal(items) {
    const normalizedItems = items.map((item) => ({
        id: Number(item.id),
        quantity: Number(item.quantity),
    }));

    const ids = [...new Set(normalizedItems.map((item) => item.id))];
    const products = await Product.findAll({ where: { id: ids } });

    if (products.length !== ids.length) {
        throw new Error('Um ou mais produtos do carrinho não foram encontrados.');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));

    return normalizedItems.reduce((total, item) => {
        const product = productsById.get(item.id);
        return total + (Number(product.price) * item.quantity);
    }, 0);
}

class CouponController {
    async indexAdmin(_req, res) {
        try {
            const coupons = await Coupon.findAll({
                order: literal('`Coupon`.`created_at` DESC'),
            });

            return res.status(200).json(coupons.map((coupon) => formatCoupon(coupon)));
        } catch (error) {
            return sendServerError(res, 'Erro ao listar cupons.', error);
        }
    }

    async storeAdmin(req, res) {
        let payload;

        try {
            payload = await couponSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados do cupom inválidos.'] });
        }

        try {
            const code = await resolveCouponCode(payload.code);

            if (payload.type === 'percentage' && Number(payload.value) > 100) {
                return res.status(400).json({ error: 'Cupom percentual deve ter valor entre 0 e 100.' });
            }

            if (payload.starts_at && payload.expires_at && payload.expires_at < payload.starts_at) {
                return res.status(400).json({ error: 'A data final do cupom não pode ser menor que a data inicial.' });
            }

            const coupon = await Coupon.create({
                code,
                description: payload.description,
                type: payload.type,
                value: Number(payload.value),
                min_order_amount: payload.min_order_amount == null ? null : Number(payload.min_order_amount),
                usage_limit: payload.usage_limit == null ? null : Number(payload.usage_limit),
                starts_at: payload.starts_at,
                expires_at: payload.expires_at,
                is_active: Boolean(payload.is_active),
            });

            return res.status(201).json(formatCoupon(coupon));
        } catch (error) {
            return sendServerError(res, 'Erro ao cadastrar cupom.', error);
        }
    }

    async updateAdmin(req, res) {
        let payload;

        try {
            payload = await couponSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados do cupom inválidos.'] });
        }

        try {
            const coupon = await Coupon.findByPk(req.params.id);

            if (!coupon) {
                return res.status(404).json({ error: 'Cupom não encontrado.' });
            }

            const code = await resolveCouponCode(payload.code || coupon.code, coupon.id);

            if (payload.type === 'percentage' && Number(payload.value) > 100) {
                return res.status(400).json({ error: 'Cupom percentual deve ter valor entre 0 e 100.' });
            }

            if (payload.starts_at && payload.expires_at && payload.expires_at < payload.starts_at) {
                return res.status(400).json({ error: 'A data final do cupom não pode ser menor que a data inicial.' });
            }

            await coupon.update({
                code,
                description: payload.description,
                type: payload.type,
                value: Number(payload.value),
                min_order_amount: payload.min_order_amount == null ? null : Number(payload.min_order_amount),
                usage_limit: payload.usage_limit == null ? null : Number(payload.usage_limit),
                starts_at: payload.starts_at,
                expires_at: payload.expires_at,
                is_active: Boolean(payload.is_active),
            });

            return res.status(200).json(formatCoupon(coupon));
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar cupom.', error);
        }
    }

    async destroyAdmin(req, res) {
        try {
            const coupon = await Coupon.findByPk(req.params.id);

            if (!coupon) {
                return res.status(404).json({ error: 'Cupom não encontrado.' });
            }

            await coupon.destroy();
            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir cupom.', error);
        }
    }

    async validate(req, res) {
        try {
            await validateSchema.validate(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados de cupom inválidos.'] });
        }

        try {
            const subtotal = await calculateCartSubtotal(req.body.items);
            const { coupon, discountAmount } = await findValidCouponByCode(req.body.code, subtotal);

            return res.status(200).json({
                coupon: formatCoupon(coupon, discountAmount),
                subtotal_amount: Number(subtotal.toFixed(2)),
                discount_amount: discountAmount,
                total_amount: Number((subtotal - discountAmount).toFixed(2)),
            });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Não foi possível validar o cupom.' });
        }
    }
}

export default new CouponController();
