import Coupon from '../app/models/Coupon.js';

export function normalizeCouponCode(value) {
    return String(value || '').trim().toUpperCase();
}

export function calculateCouponDiscount(coupon, subtotalAmount) {
    const subtotal = Number(subtotalAmount || 0);
    const value = Number(coupon?.value || 0);

    if (!Number.isFinite(subtotal) || subtotal <= 0 || !Number.isFinite(value) || value <= 0) {
        return 0;
    }

    if (coupon.type === 'percentage') {
        return Number(Math.min(subtotal, subtotal * (value / 100)).toFixed(2));
    }

    return Number(Math.min(subtotal, value).toFixed(2));
}

export function validateCouponRules(coupon, subtotalAmount, now = new Date()) {
    const subtotal = Number(subtotalAmount || 0);

    if (!coupon) {
        throw new Error('Cupom não encontrado.');
    }

    if (!coupon.is_active) {
        throw new Error('Este cupom está desativado.');
    }

    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now.getTime()) {
        throw new Error('Este cupom ainda não está disponível.');
    }

    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now.getTime()) {
        throw new Error('Este cupom expirou.');
    }

    if (coupon.usage_limit != null && Number(coupon.usage_count || 0) >= Number(coupon.usage_limit)) {
        throw new Error('Este cupom já atingiu o limite de uso.');
    }

    if (coupon.min_order_amount != null && subtotal < Number(coupon.min_order_amount)) {
        throw new Error(`Este cupom exige pedido mínimo de R$ ${Number(coupon.min_order_amount).toFixed(2).replace('.', ',')}.`);
    }

    const discountAmount = calculateCouponDiscount(coupon, subtotal);

    if (discountAmount <= 0) {
        throw new Error('Este cupom não gera desconto para o carrinho atual.');
    }

    return {
        coupon,
        discountAmount,
    };
}

export async function findValidCouponByCode(code, subtotalAmount, now = new Date()) {
    const normalizedCode = normalizeCouponCode(code);

    if (!normalizedCode) {
        throw new Error('Informe um código de cupom.');
    }

    const coupon = await Coupon.findOne({
        where: { code: normalizedCode },
    });

    return validateCouponRules(coupon, subtotalAmount, now);
}
