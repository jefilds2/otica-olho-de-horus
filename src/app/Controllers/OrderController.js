import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import StoreSetting from '../models/StoreSetting.js';
import { literal } from 'sequelize';
import { getMercadoPagoPayment } from '../../config/mercadoPago.js';
import { sendServerError } from '../../utils/http.js';
import {
    checkoutMelhorEnvioShipments,
    generateMelhorEnvioLabels,
    prepareMelhorEnvioShipment,
    printMelhorEnvioLabels,
    trackMelhorEnvioShipments,
} from '../../services/melhorEnvio.js';
import {
    buildCustomerOrderTimeline,
    getCustomerOrderStage,
    getCustomerOrderStageLabel,
    notifyOrderStageChange,
} from '../../services/orderNotifications.js';
import * as Yup from 'yup';
import { createHmac, timingSafeEqual } from 'node:crypto';

const fulfillmentStatuses = ['em_preparacao', 'em_transporte', 'entregue'];
const orderStatuses = ['aguardando_pagamento', 'processando', 'pago', 'expirado', 'cancelado'];

const normalizeText = (value) => value == null ? null : String(value).trim();

function getMercadoPagoWebhookSecret() {
    return String(process.env.MERCADO_PAGO_WEBHOOK_SECRET || '').trim();
}

function parseMercadoPagoSignature(headerValue) {
    const entries = String(headerValue || '')
        .split(',')
        .map((part) => part.split('='))
        .filter((part) => part.length === 2)
        .map(([key, value]) => [key.trim(), value.trim()]);

    return Object.fromEntries(entries);
}

function isMercadoPagoWebhookSignatureValid(req) {
    const secret = getMercadoPagoWebhookSecret();

    if (!secret) {
        return true;
    }

    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    const dataId = String(req.query?.['data.id'] || req.body?.data?.id || '').trim();
    const { ts, v1 } = parseMercadoPagoSignature(xSignature);

    if (!xRequestId || !dataId || !ts || !v1) {
        return false;
    }

    const manifest = `id:${dataId};request-id:${String(xRequestId).trim()};ts:${ts};`;
    const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');
    const providedBuffer = Buffer.from(v1, 'hex');
    const expectedBuffer = Buffer.from(expectedHash, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
}

function buildMelhorEnvioTrackingUrl(code) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return null;
    return `https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(normalizedCode)}`;
}

function formatDecimalValue(value) {
    return Number(Number(value || 0).toFixed(2));
}

function parseJsonField(value) {
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function normalizeMercadoPagoPaymentValue(value) {
    return value == null || value === '' ? null : String(value).trim();
}

function mapMercadoPagoPaymentMethodLabel({ methodId, paymentTypeId, installments }) {
    const normalizedMethodId = String(methodId || '').trim().toLowerCase();
    const normalizedPaymentTypeId = String(paymentTypeId || '').trim().toLowerCase();
    const normalizedInstallments = Number(installments || 0);

    if (normalizedMethodId === 'pix') {
        return 'PIX';
    }

    if (normalizedPaymentTypeId === 'credit_card') {
        return normalizedInstallments > 1
            ? `Cartão de crédito em ${normalizedInstallments}x`
            : 'Cartão de crédito';
    }

    if (normalizedPaymentTypeId === 'debit_card') {
        return 'Cartão de débito';
    }

    if (normalizedPaymentTypeId === 'bank_transfer') {
        return normalizedMethodId === 'pix' ? 'PIX' : 'Transferência bancária';
    }

    if (normalizedPaymentTypeId === 'ticket') {
        return 'Boleto';
    }

    if (normalizedPaymentTypeId === 'account_money') {
        return 'Saldo Mercado Pago';
    }

    return normalizedMethodId || normalizedPaymentTypeId || null;
}

function extractMercadoPagoPaymentDetails(payment) {
    if (!payment || typeof payment !== 'object') {
        return null;
    }

    const methodId = normalizeMercadoPagoPaymentValue(payment.payment_method_id)?.toLowerCase() || null;
    const paymentTypeId = normalizeMercadoPagoPaymentValue(payment.payment_type_id)?.toLowerCase() || null;
    const installments = Number(payment.installments || 0);
    const normalizedInstallments = Number.isInteger(installments) && installments > 0 ? installments : null;
    const installmentAmount = payment?.transaction_details?.installment_amount == null
        ? null
        : formatDecimalValue(payment.transaction_details.installment_amount);
    const totalPaidAmount = payment?.transaction_details?.total_paid_amount == null
        ? null
        : formatDecimalValue(payment.transaction_details.total_paid_amount);
    const lastFourDigits = normalizeMercadoPagoPaymentValue(payment?.card?.last_four_digits) || null;
    const issuerName = normalizeMercadoPagoPaymentValue(payment?.issuer?.name) || null;

    return {
        payment_id: payment?.id ? String(payment.id) : null,
        payment_method_id: methodId,
        payment_type_id: paymentTypeId,
        method_label: mapMercadoPagoPaymentMethodLabel({
            methodId,
            paymentTypeId,
            installments: normalizedInstallments,
        }),
        installments: normalizedInstallments,
        installment_amount: installmentAmount,
        total_paid_amount: totalPaidAmount,
        currency_id: normalizeMercadoPagoPaymentValue(payment.currency_id)?.toLowerCase() || 'brl',
        status: normalizeMercadoPagoPaymentValue(payment.status)?.toLowerCase() || null,
        status_detail: normalizeMercadoPagoPaymentValue(payment.status_detail)?.toLowerCase() || null,
        issuer_name: issuerName,
        card_last_four_digits: lastFourDigits,
    };
}

function mergeMelhorEnvioPayload(order, patch) {
    return {
        ...(parseJsonField(order.melhor_envio_payload_json) || {}),
        ...patch,
    };
}

function mapFulfillmentStatus(melhorEnvioStatus, currentStatus = null) {
    const normalized = String(melhorEnvioStatus || '').trim().toLowerCase();

    if (!normalized) return currentStatus;
    if (normalized === 'delivered') return 'entregue';
    if (['posted', 'shipped', 'in_transit', 'transporting'].includes(normalized)) return 'em_transporte';
    if (['paid', 'released', 'generated', 'pending'].includes(normalized)) return currentStatus || 'em_preparacao';
    return currentStatus;
}

function extractTrackingPayload(payload) {
    if (Array.isArray(payload)) {
        return payload[0] || null;
    }

    if (Array.isArray(payload?.purchase?.orders)) {
        return payload.purchase.orders[0] || null;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data[0] || null;
    }

    if (payload?.data && typeof payload.data === 'object') {
        return payload.data;
    }

    if (payload && typeof payload === 'object') {
        const values = Object.values(payload).filter((value) => value && typeof value === 'object');
        const keyedTrackingPayload = values.find((value) => (
            value.protocol
            || value.tracking
            || value.melhorenvio_tracking
            || value.status
        ));

        if (keyedTrackingPayload) {
            return keyedTrackingPayload;
        }
    }

    return payload || null;
}

function getMelhorEnvioPayload(order) {
    return parseJsonField(order?.melhor_envio_payload_json) || {};
}

function getMelhorEnvioOrderScopedResponse(response, orderId) {
    if (!response || typeof response !== 'object') return null;

    if (orderId && response[orderId] && typeof response[orderId] === 'object') {
        return response[orderId];
    }

    return response;
}

function isMelhorEnvioCheckoutPaid(order) {
    const payload = getMelhorEnvioPayload(order);
    const purchaseStatus = String(payload.checkout?.response?.purchase?.status || '').trim().toLowerCase();
    const status = getNormalizedMelhorEnvioStatus(order);

    return purchaseStatus === 'paid'
        || ['paid', 'released', 'generated', 'posted', 'shipped', 'in_transit', 'transporting', 'delivered'].includes(status);
}

function isMelhorEnvioGenerateSuccessful(order) {
    const payload = getMelhorEnvioPayload(order);
    const response = getMelhorEnvioOrderScopedResponse(payload.generate?.response, order?.melhor_envio_order_id);
    const responseStatus = response?.status;
    const status = getNormalizedMelhorEnvioStatus(order);

    if (responseStatus === true) {
        return true;
    }

    return ['generated', 'posted', 'shipped', 'in_transit', 'transporting', 'delivered'].includes(status);
}

function getNormalizedMelhorEnvioStatus(order) {
    return String(order?.melhor_envio_status || '').trim().toLowerCase();
}

function hasMelhorEnvioCheckout(order) {
    return isMelhorEnvioCheckoutPaid(order);
}

function hasMelhorEnvioGenerate(order) {
    return isMelhorEnvioGenerateSuccessful(order);
}

async function loadAdminOrder(id) {
    return Order.findByPk(id, {
        include: [
            {
                model: OrderItem,
                as: 'items',
            },
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'cpf', 'phone'],
            },
        ],
    });
}

async function loadOrderProductsForUpdate(order, transaction) {
    const items = Array.isArray(order?.items) ? order.items : [];
    const productIds = [...new Set(items.map((item) => Number(item.product_id)).filter(Boolean))];

    if (productIds.length === 0) {
        return new Map();
    }

    const products = await Product.findAll({
        where: { id: productIds },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    return new Map(products.map((product) => [product.id, product]));
}

async function decrementOrderInventory(order, transaction) {
    if (order.inventory_deducted_at) {
        return order.inventory_deducted_at;
    }

    const productsById = await loadOrderProductsForUpdate(order, transaction);

    for (const item of order.items || []) {
        const product = productsById.get(Number(item.product_id));

        if (!product) {
            throw new Error(`Produto do pedido não encontrado para baixa de estoque: ${item.product_name}.`);
        }

        if (Number(product.stock_quantity) < Number(item.quantity)) {
            throw new Error(`Estoque insuficiente para "${item.product_name}" ao confirmar o pagamento.`);
        }
    }

    for (const item of order.items || []) {
        const product = productsById.get(Number(item.product_id));
        await product.decrement('stock_quantity', {
            by: Number(item.quantity),
            transaction,
        });
    }

    const deductedAt = new Date();
    await order.update({ inventory_deducted_at: deductedAt }, { transaction });
    order.inventory_deducted_at = deductedAt;
    return deductedAt;
}

async function restoreOrderInventory(order, transaction) {
    if (!order.inventory_deducted_at) {
        return null;
    }

    const productsById = await loadOrderProductsForUpdate(order, transaction);

    for (const item of order.items || []) {
        const product = productsById.get(Number(item.product_id));

        if (!product) {
            throw new Error(`Produto do pedido não encontrado para devolução de estoque: ${item.product_name}.`);
        }

        await product.increment('stock_quantity', {
            by: Number(item.quantity),
            transaction,
        });
    }

    await order.update({ inventory_deducted_at: null }, { transaction });
    order.inventory_deducted_at = null;
    return true;
}

async function applyMelhorEnvioTrackingUpdate(order, trackingPayload) {
    const nextStatus = String(trackingPayload?.status || trackingPayload?.tracking?.status || '').trim() || null;
    const trackingCode = trackingPayload?.tracking || trackingPayload?.code || trackingPayload?.self_tracking || order.tracking_code || null;
    const trackingUrl = trackingPayload?.tracking_url || (trackingCode ? buildMelhorEnvioTrackingUrl(trackingCode) : order.tracking_url || null);
    const fulfillmentStatus = mapFulfillmentStatus(nextStatus, order.fulfillment_status);

    const updatePayload = {
        melhor_envio_status: nextStatus,
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        fulfillment_status: fulfillmentStatus,
        melhor_envio_payload_json: JSON.stringify(mergeMelhorEnvioPayload(order, {
            tracking_sync: trackingPayload,
            tracking_synced_at: new Date().toISOString(),
        })),
    };

    if (fulfillmentStatus === 'em_transporte' && !order.shipped_at) {
        updatePayload.shipped_at = new Date();
    }

    if (fulfillmentStatus === 'entregue' && !order.delivered_at) {
        updatePayload.shipped_at = order.shipped_at || new Date();
        updatePayload.delivered_at = new Date();
    }

    await order.update(updatePayload);
    return order;
}

function formatOrder(order) {
    const customer_stage = getCustomerOrderStage(order);

    return {
        id: order.id,
        user_id: order.user_id,
        payment_reference: order.payment_reference,
        payment_transaction_id: order.payment_transaction_id,
        payment_details: parseJsonField(order.payment_details_json),
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        currency: order.currency,
        subtotal_amount: Number(order.subtotal_amount),
        coupon_code: order.coupon_code,
        coupon_description: order.coupon_description,
        discount_amount: Number(order.discount_amount || 0),
        shipping_service_id: order.shipping_service_id,
        shipping_service_name: order.shipping_service_name,
        shipping_company_name: order.shipping_company_name,
        tracking_code: order.tracking_code,
        tracking_url: order.tracking_url,
        melhor_envio_order_id: order.melhor_envio_order_id,
        melhor_envio_protocol: order.melhor_envio_protocol,
        melhor_envio_status: order.melhor_envio_status,
        melhor_envio_prepared_at: order.melhor_envio_prepared_at,
        shipping_price: Number(order.shipping_price || 0),
        shipping_delivery_time: order.shipping_delivery_time,
        total_amount: Number(order.total_amount),
        paid_at: order.paid_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        last_notified_stage: order.last_notified_stage,
        customer_stage,
        customer_stage_label: getCustomerOrderStageLabel(order),
        customer_timeline: buildCustomerOrderTimeline(order),
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        shipping_address: parseJsonField(order.shipping_address_json),
        shipping_quote: parseJsonField(order.shipping_quote_json),
        melhor_envio_payload: parseJsonField(order.melhor_envio_payload_json),
        user: order.user ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            cpf: order.user.cpf,
            phone: order.user.phone,
        } : null,
        items: Array.isArray(order.items) ? order.items.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_image: item.product_image,
            selected_color_name: item.selected_color_name,
            selected_color_hex: item.selected_color_hex,
            unit_price: Number(item.unit_price),
            quantity: item.quantity,
            total_price: Number(item.total_price),
        })) : [],
    };
}

async function hydrateMissingMercadoPagoPaymentDetails(orders = []) {
    const candidates = orders.filter((order) => (
        order?.payment_transaction_id
        && !order?.payment_details_json
    ));

    if (candidates.length === 0) {
        return orders;
    }

    await Promise.all(candidates.map(async (order) => {
        try {
            const payment = await getMercadoPagoPayment(order.payment_transaction_id);
            const paymentDetails = extractMercadoPagoPaymentDetails(payment);

            if (!paymentDetails) {
                return;
            }

            order.payment_details_json = JSON.stringify(paymentDetails);
            await order.update({
                payment_details_json: order.payment_details_json,
            });
        } catch (error) {
            console.error(`Falha ao sincronizar detalhes de pagamento do pedido ${order.id}`, error);
        }
    }));

    return orders;
}

async function syncOrderTrackingFromMelhorEnvio(order, storeSettings) {
    if (!order?.melhor_envio_order_id) {
        return order;
    }

    const trackingResult = await trackMelhorEnvioShipments([order.melhor_envio_order_id], storeSettings);
    const trackingPayload = extractTrackingPayload(trackingResult);

    if (trackingPayload) {
        await applyMelhorEnvioTrackingUpdate(order, trackingPayload);
    }

    return order;
}

function mapMercadoPagoOrderStatus(payment) {
    const status = String(payment?.status || '').trim().toLowerCase();
    const statusDetail = String(payment?.status_detail || '').trim().toLowerCase();

    if (status === 'approved') {
        return 'pago';
    }

    if (['in_process', 'in_mediation', 'authorized'].includes(status)) {
        return 'processando';
    }

    if (status === 'pending') {
        return 'aguardando_pagamento';
    }

    if (status === 'cancelled' && statusDetail.includes('expired')) {
        return 'expirado';
    }

    if (['cancelled', 'rejected', 'refunded', 'charged_back'].includes(status)) {
        return 'cancelado';
    }

    return null;
}

async function syncOrderWithMercadoPagoPayment({ order, payment, transaction }) {
    const nextStatus = mapMercadoPagoOrderStatus(payment) || order.status;
    const amount = payment?.transaction_amount;
    const payer = payment?.payer || {};
    const phoneNumber = payer?.phone?.number || payer?.phone?.area_code
        ? [payer?.phone?.area_code, payer?.phone?.number].filter(Boolean).join('')
        : null;
    const wasPaid = order.status === 'pago';
    const willBePaid = nextStatus === 'pago';
    const updatedFields = {
        payment_transaction_id: payment?.id ? String(payment.id) : order.payment_transaction_id,
        payment_details_json: JSON.stringify(extractMercadoPagoPaymentDetails(payment)),
        customer_email: payer.email || order.customer_email,
        customer_name: order.customer_name,
        customer_phone: phoneNumber || order.customer_phone,
        currency: String(payment?.currency_id || order.currency || 'brl').toLowerCase(),
        subtotal_amount: order.subtotal_amount,
        total_amount: amount == null ? Number(order.total_amount) : formatDecimalValue(amount),
        status: nextStatus,
    };

    if (willBePaid) {
        await decrementOrderInventory(order, transaction);

        if (!order.paid_at && order.coupon_code) {
            const coupon = await Coupon.findOne({
                where: { code: order.coupon_code },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (coupon) {
                await coupon.increment('usage_count', {
                    by: 1,
                    transaction,
                });
            }
        }

        updatedFields.paid_at = order.paid_at || new Date(payment?.date_approved || Date.now());
        updatedFields.fulfillment_status = order.fulfillment_status || 'em_preparacao';
    } else if (nextStatus === 'processando') {
        updatedFields.fulfillment_status = order.fulfillment_status || 'em_preparacao';
    } else if (nextStatus === 'cancelado' && wasPaid) {
        updatedFields.fulfillment_status = null;
    }

    if (nextStatus === 'expirado') {
        updatedFields.fulfillment_status = null;
    }

    await order.update(updatedFields, { transaction });
}

async function notifyOrderStageAfterReload(orderId) {
    const order = await loadAdminOrder(orderId);

    if (!order) {
        return null;
    }

    await notifyOrderStageSafely(order);
    return order;
}

async function notifyOrderStageSafely(order) {
    try {
        await notifyOrderStageChange(order);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de atualização do pedido ${order?.id}`, error);
    }
}

class OrderController {
    async indexMine(req, res) {
        try {
            const orders = await Order.findAll({
                where: { user_id: req.userId },
                order: literal('`Order`.`created_at` DESC'),
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                    },
                ],
            });

            await hydrateMissingMercadoPagoPaymentDetails(orders);
            return res.status(200).json(orders.map(formatOrder));
        } catch (error) {
            return sendServerError(res, 'Erro ao listar seus pedidos.', error);
        }
    }

    async indexAdmin(_req, res) {
        try {
            const orders = await Order.findAll({
                order: literal('`Order`.`created_at` DESC'),
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'cpf', 'phone'],
                    },
                ],
            });

            await hydrateMissingMercadoPagoPaymentDetails(orders);
            return res.status(200).json(orders.map(formatOrder));
        } catch (error) {
            return sendServerError(res, 'Erro ao listar pedidos.', error);
        }
    }

    async confirmCheckout(req, res) {
        const paymentId = String(req.body?.paymentId || '').trim();
        const externalReference = String(req.body?.externalReference || '').trim();

        if (!paymentId && !externalReference) {
            return res.status(400).json({ error: 'paymentId ou externalReference é obrigatório.' });
        }

        try {
            const transaction = await Order.sequelize.transaction();

            try {
                const orderWhere = /^\d+$/.test(externalReference)
                    ? { id: Number(externalReference) }
                    : paymentId
                    ? { payment_transaction_id: paymentId }
                    : null;

                if (!orderWhere) {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'Não foi possível localizar o pedido do Mercado Pago.' });
                }

                const order = await Order.findOne({
                    where: orderWhere,
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                        },
                    ],
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (!order) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Pedido não encontrado para esta referência de pagamento.' });
                }

                if (!paymentId) {
                    await transaction.commit();
                    await order.reload({
                        include: [
                            {
                                model: OrderItem,
                                as: 'items',
                            },
                            {
                                model: User,
                                as: 'user',
                                attributes: ['id', 'name', 'email', 'cpf', 'phone'],
                            },
                        ],
                    });

                    return res.status(200).json(formatOrder(order));
                }

                const payment = await getMercadoPagoPayment(paymentId);
                await syncOrderWithMercadoPagoPayment({ order, payment, transaction });
                await transaction.commit();

                await order.reload({
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'cpf', 'phone'],
                        },
                    ],
                });

                await notifyOrderStageSafely(order);

                return res.status(200).json(formatOrder(order));
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            return sendServerError(res, 'Erro ao confirmar pagamento do pedido.', error);
        }
    }

    async handleMercadoPagoWebhook(req, res) {
        const notificationType = String(req.query?.type || req.body?.type || '').trim().toLowerCase();
        const paymentId = String(req.query?.['data.id'] || req.body?.data?.id || '').trim();

        if (notificationType !== 'payment' || !paymentId) {
            return res.status(200).json({ received: true });
        }

        if (!isMercadoPagoWebhookSignatureValid(req)) {
            return res.status(401).json({ error: 'Assinatura do webhook do Mercado Pago inválida.' });
        }

        try {
            const payment = await getMercadoPagoPayment(paymentId);
            const externalReference = String(payment?.external_reference || '').trim();

            if (!externalReference || !/^\d+$/.test(externalReference)) {
                return res.status(200).json({ received: true });
            }

            const transaction = await Order.sequelize.transaction();

            try {
                const order = await Order.findByPk(Number(externalReference), {
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                        },
                    ],
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (!order) {
                    await transaction.rollback();
                    return res.status(200).json({ received: true });
                }

                await syncOrderWithMercadoPagoPayment({ order, payment, transaction });
                await transaction.commit();
                await notifyOrderStageAfterReload(order.id);
            } catch (error) {
                await transaction.rollback();
                throw error;
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Erro ao processar webhook do Mercado Pago', error);
            return res.status(500).json({ error: 'Falha ao processar notificação do Mercado Pago.' });
        }
    }

    async updateAdmin(req, res) {
        const schema = Yup.object({
            status: Yup.string().oneOf(orderStatuses).nullable(),
            shipping_service_id: Yup.string().nullable(),
            shipping_service_name: Yup.string().nullable(),
            shipping_company_name: Yup.string().nullable(),
            tracking_code: Yup.string().nullable(),
            tracking_url: Yup.string().trim().url().nullable(),
            fulfillment_status: Yup.string().oneOf(fulfillmentStatuses).nullable(),
            recipient_name: Yup.string().trim().nullable(),
            recipient_phone: Yup.string().nullable(),
            cep: Yup.string().nullable(),
            street: Yup.string().trim().nullable(),
            number: Yup.string().trim().nullable(),
            complement: Yup.string().nullable(),
            neighborhood: Yup.string().trim().nullable(),
            city: Yup.string().trim().nullable(),
            state: Yup.string().trim().max(2).nullable(),
            reference: Yup.string().nullable(),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados do pedido inválidos.'] });
        }

        try {
            const transaction = await Order.sequelize.transaction();

            try {
                const order = await Order.findByPk(req.params.id, {
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'cpf', 'phone'],
                        },
                    ],
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (!order) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Pedido não encontrado.' });
                }

                const nextFulfillmentStatus = req.body.fulfillment_status == null || req.body.fulfillment_status === ''
                    ? null
                    : req.body.fulfillment_status;
                const nextOrderStatus = req.body.status == null || req.body.status === ''
                    ? order.status
                    : req.body.status;
                const nextShippingServiceId = normalizeText(req.body.shipping_service_id) || order.shipping_service_id || null;
                const isLocalPickup = nextShippingServiceId === 'retirada_loja';
                const wasPaid = order.status === 'pago';
                const willBePaid = nextOrderStatus === 'pago';
                const willBeCancelled = nextOrderStatus === 'cancelado';
                const coupon = order.coupon_code
                    ? await Coupon.findOne({
                        where: { code: order.coupon_code },
                        transaction,
                        lock: transaction.LOCK.UPDATE,
                    })
                    : null;

                if (nextFulfillmentStatus && ['aguardando_pagamento', 'expirado', 'cancelado'].includes(nextOrderStatus)) {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'Atualize o andamento de envio somente após a confirmação do pagamento.' });
                }

                const trackingCode = normalizeText(req.body.tracking_code)?.toUpperCase() || null;
                const shippingCompanyName = isLocalPickup
                    ? 'Ótica Olho de Hórus'
                    : normalizeText(req.body.shipping_company_name) || null;
                const normalizedTrackingUrl = normalizeText(req.body.tracking_url) || null;
                const shippingAddress = {
                    ...(parseJsonField(order.shipping_address_json) || {}),
                    recipient_name: normalizeText(req.body.recipient_name),
                    phone: normalizeText(req.body.recipient_phone),
                    cep: normalizeText(req.body.cep),
                    street: normalizeText(req.body.street),
                    number: normalizeText(req.body.number),
                    complement: normalizeText(req.body.complement),
                    neighborhood: normalizeText(req.body.neighborhood),
                    city: normalizeText(req.body.city),
                    state: normalizeText(req.body.state)?.toUpperCase() || null,
                    reference: normalizeText(req.body.reference),
                };

                const updatePayload = {
                    status: nextOrderStatus,
                    shipping_service_id: nextShippingServiceId,
                    shipping_service_name: isLocalPickup
                        ? 'Retirar na loja'
                        : normalizeText(req.body.shipping_service_name) || order.shipping_service_name || null,
                    shipping_company_name: shippingCompanyName,
                    tracking_code: isLocalPickup ? null : trackingCode,
                    tracking_url: isLocalPickup
                        ? null
                        : trackingCode
                        ? buildMelhorEnvioTrackingUrl(trackingCode)
                        : normalizedTrackingUrl,
                    fulfillment_status: isLocalPickup ? null : nextFulfillmentStatus,
                    shipping_address_json: JSON.stringify(shippingAddress),
                };

                if (willBeCancelled) {
                    updatePayload.fulfillment_status = null;
                    updatePayload.tracking_code = null;
                    updatePayload.tracking_url = null;
                    updatePayload.shipped_at = null;
                    updatePayload.delivered_at = null;
                }

                if (!willBeCancelled && nextFulfillmentStatus === 'em_transporte' && !order.shipped_at) {
                    updatePayload.shipped_at = new Date();
                }

                if (!willBeCancelled && nextFulfillmentStatus === 'entregue') {
                    updatePayload.shipped_at = order.shipped_at || new Date();
                    updatePayload.delivered_at = order.delivered_at || new Date();
                } else if (!willBeCancelled) {
                    updatePayload.delivered_at = null;
                }

                if (isLocalPickup) {
                    updatePayload.fulfillment_status = null;
                    updatePayload.tracking_code = null;
                    updatePayload.tracking_url = null;
                    updatePayload.melhor_envio_order_id = null;
                    updatePayload.melhor_envio_protocol = null;
                    updatePayload.melhor_envio_status = null;
                    updatePayload.melhor_envio_payload_json = null;
                    updatePayload.melhor_envio_prepared_at = null;
                    updatePayload.shipped_at = null;
                    updatePayload.delivered_at = null;
                }

                if (willBeCancelled) {
                    await restoreOrderInventory(order, transaction);

                    if (wasPaid && coupon && Number(coupon.usage_count) > 0) {
                        await coupon.update({
                            usage_count: Math.max(0, Number(coupon.usage_count) - 1),
                        }, { transaction });
                    }
                } else if (willBePaid && !order.inventory_deducted_at) {
                    await decrementOrderInventory(order, transaction);
                    updatePayload.paid_at = order.paid_at || new Date();
                    updatePayload.fulfillment_status = isLocalPickup ? null : (nextFulfillmentStatus || order.fulfillment_status || 'em_preparacao');

                    if (!wasPaid && coupon) {
                        await coupon.increment('usage_count', {
                            by: 1,
                            transaction,
                        });
                    }
                }

                await order.update(updatePayload, { transaction });
                await transaction.commit();
                await order.reload({
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'cpf', 'phone'],
                        },
                    ],
                });

                await notifyOrderStageSafely(order);

                return res.status(200).json(formatOrder(order));
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar pedido.', error);
        }
    }

    async prepareMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!['pago', 'processando'].includes(order.status)) {
                return res.status(400).json({ error: 'A etiqueta só pode ser preparada após a confirmação do pagamento.' });
            }

            if (order.status === 'cancelado') {
                return res.status(400).json({ error: 'Não é possível preparar etiqueta para pedido cancelado.' });
            }

            if (String(order.shipping_service_id || '') === 'retirada_loja') {
                return res.status(400).json({ error: 'Pedidos com retirada na loja não geram etiqueta de envio.' });
            }

            if (order.melhor_envio_order_id) {
                return res.status(400).json({ error: 'Este pedido já possui uma etiqueta preparada no Melhor Envio.' });
            }

            const storeSettings = await StoreSetting.findByPk(1);
            const preparedShipment = await prepareMelhorEnvioShipment(order, storeSettings);

            await order.update({
                melhor_envio_order_id: preparedShipment.orderId,
                melhor_envio_protocol: preparedShipment.protocol,
                melhor_envio_status: preparedShipment.status,
                tracking_url: preparedShipment.result?.tracking_url || order.tracking_url,
                melhor_envio_payload_json: JSON.stringify(mergeMelhorEnvioPayload(order, {
                    prepare: {
                        payload: preparedShipment.payload,
                        response: preparedShipment.result,
                        prepared_at: new Date().toISOString(),
                    },
                })),
                melhor_envio_prepared_at: new Date(),
            });

            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json(formatOrder(refreshedOrder));
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao preparar etiqueta no Melhor Envio.' });
        }
    }

    async checkoutMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!order.melhor_envio_order_id) {
                return res.status(400).json({ error: 'Prepare a etiqueta antes de realizar o checkout no Melhor Envio.' });
            }

            const storeSettings = await StoreSetting.findByPk(1);
            const result = await checkoutMelhorEnvioShipments([order.melhor_envio_order_id], storeSettings);
            const payload = extractTrackingPayload(result);

            const purchaseStatus = String(result?.purchase?.status || '').trim().toLowerCase();

            await order.update({
                melhor_envio_status: String(payload?.status || purchaseStatus || order.melhor_envio_status || 'pending'),
                melhor_envio_payload_json: JSON.stringify(mergeMelhorEnvioPayload(order, {
                    checkout: {
                        response: result,
                        ...(purchaseStatus === 'paid' ? { checked_out_at: new Date().toISOString() } : {}),
                    },
                })),
            });

            if (purchaseStatus === 'paid') {
                await syncOrderTrackingFromMelhorEnvio(order, storeSettings);
            }

            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json(formatOrder(refreshedOrder));
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao comprar etiqueta no Melhor Envio.' });
        }
    }

    async generateMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!order.melhor_envio_order_id) {
                return res.status(400).json({ error: 'Prepare a etiqueta antes de gerar a etiqueta do Melhor Envio.' });
            }

            if (!hasMelhorEnvioCheckout(order)) {
                return res.status(400).json({ error: 'Compre a etiqueta antes de gerar a etiqueta do Melhor Envio.' });
            }

            const storeSettings = await StoreSetting.findByPk(1);
            const result = await generateMelhorEnvioLabels([order.melhor_envio_order_id], storeSettings);
            const scopedPayload = getMelhorEnvioOrderScopedResponse(result, order.melhor_envio_order_id);

            if (scopedPayload?.status !== true) {
                throw new Error(scopedPayload?.message || 'O Melhor Envio não confirmou a geração da etiqueta.');
            }

            const generatedStatus = normalizeText(scopedPayload?.label)
                || normalizeText(scopedPayload?.message)
                || order.melhor_envio_status
                || 'generated';

            await order.update({
                melhor_envio_status: generatedStatus,
                melhor_envio_payload_json: JSON.stringify(mergeMelhorEnvioPayload(order, {
                    generate: {
                        response: result,
                        generated_at: new Date().toISOString(),
                    },
                })),
            });

            await syncOrderTrackingFromMelhorEnvio(order, storeSettings);

            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json(formatOrder(refreshedOrder));
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao gerar etiqueta no Melhor Envio.' });
        }
    }

    async printMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!order.melhor_envio_order_id) {
                return res.status(400).json({ error: 'Prepare a etiqueta antes de imprimir a etiqueta do Melhor Envio.' });
            }

            if (!hasMelhorEnvioGenerate(order)) {
                return res.status(400).json({ error: 'Gere a etiqueta antes de imprimir a etiqueta do Melhor Envio.' });
            }

            const storeSettings = await StoreSetting.findByPk(1);
            const result = await printMelhorEnvioLabels([order.melhor_envio_order_id], { mode: 'public' }, storeSettings);
            const payload = extractTrackingPayload(result);
            const printUrl = payload?.url || payload?.link || payload?.pdf || result?.url || result?.link || null;

            await order.update({
                melhor_envio_payload_json: JSON.stringify(mergeMelhorEnvioPayload(order, {
                    print: {
                        response: result,
                        print_url: printUrl,
                        printed_at: new Date().toISOString(),
                    },
                })),
            });

            await syncOrderTrackingFromMelhorEnvio(order, storeSettings);

            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json({
                order: formatOrder(refreshedOrder),
                print_url: printUrl,
            });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao gerar link de impressão da etiqueta.' });
        }
    }

    async syncMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            if (!order.melhor_envio_order_id) {
                return res.status(400).json({ error: 'Este pedido ainda não possui identificador do Melhor Envio para sincronização.' });
            }

            if (!hasMelhorEnvioGenerate(order)) {
                return res.status(400).json({ error: 'Gere a etiqueta antes de sincronizar o rastreio no Melhor Envio.' });
            }

            const storeSettings = await StoreSetting.findByPk(1);
            const result = await trackMelhorEnvioShipments([order.melhor_envio_order_id], storeSettings);
            const payload = extractTrackingPayload(result);

            await applyMelhorEnvioTrackingUpdate(order, payload || {});
            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json(formatOrder(refreshedOrder));
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao sincronizar status da etiqueta no Melhor Envio.' });
        }
    }

    async resetMelhorEnvioAdmin(req, res) {
        try {
            const order = await loadAdminOrder(req.params.id);

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            await order.update({
                melhor_envio_order_id: null,
                melhor_envio_protocol: null,
                melhor_envio_status: null,
                melhor_envio_payload_json: null,
                melhor_envio_prepared_at: null,
                tracking_code: null,
                tracking_url: null,
                shipped_at: null,
                delivered_at: null,
                fulfillment_status: ['aguardando_pagamento', 'expirado'].includes(order.status) ? null : 'em_preparacao',
            });

            const refreshedOrder = await loadAdminOrder(order.id);
            await notifyOrderStageSafely(refreshedOrder);
            return res.status(200).json(formatOrder(refreshedOrder));
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Erro ao resetar o processo do Melhor Envio.' });
        }
    }
}

export default new OrderController();
