import StoreSetting from '../app/models/StoreSetting.js';
import Order from '../app/models/Order.js';
import { getFrontendAppUrl, getFrontendPublicUrl } from '../config/appUrls.js';
import { sendMail } from './mail.js';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const stageMeta = {
    pedido_realizado: {
        subject: 'Pedido recebido com sucesso',
        title: 'Recebemos o seu pedido',
        description: 'Seu pedido foi registrado com sucesso e está aguardando a confirmação do pagamento.',
        badge: 'Pedido realizado',
    },
    pagamento_confirmado: {
        subject: 'Pagamento confirmado',
        title: 'Pagamento aprovado',
        description: 'Seu pagamento foi confirmado. Em breve seu pedido seguirá para separação e preparação.',
        badge: 'Pagamento confirmado',
    },
    em_preparacao: {
        subject: 'Pedido em preparação',
        title: 'Seu pedido está em preparação',
        description: 'Nossa equipe já iniciou a separação e conferência dos itens para envio.',
        badge: 'Em preparação',
    },
    em_transporte: {
        subject: 'Pedido em transporte',
        title: 'Seu pedido está a caminho',
        description: 'Seu pedido foi despachado e já está em rota de entrega.',
        badge: 'Em transporte',
    },
    entregue: {
        subject: 'Pedido entregue',
        title: 'Pedido entregue',
        description: 'O pedido foi marcado como entregue. Esperamos que sua experiência tenha sido excelente.',
        badge: 'Entregue',
    },
    cancelado: {
        subject: 'Pedido cancelado',
        title: 'Pedido cancelado',
        description: 'Seu pedido foi cancelado. Se precisar, nossa equipe está disponível para atendimento.',
        badge: 'Cancelado',
    },
};

const orderedCustomerStages = [
    'pedido_realizado',
    'pagamento_confirmado',
    'em_preparacao',
    'em_transporte',
    'entregue',
];

function isMercadoPagoTestUserEmail(email) {
    return String(email || '').trim().toLowerCase().endsWith('@testuser.com');
}

function parseJsonField(value) {
    if (!value) return null;

    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return null;
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}

function formatDateTime(value) {
    if (!value) return 'Não informado';

    try {
        return new Date(value).toLocaleString('pt-BR');
    } catch {
        return 'Não informado';
    }
}

function formatCnpj(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 14);

    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
}

function buildStoreAddress(store) {
    const parts = [
        [store.address, store.number].filter(Boolean).join(', '),
        store.district,
        [store.city, store.state].filter(Boolean).join('/'),
        store.postalCode ? `CEP ${store.postalCode}` : '',
    ].filter(Boolean);

    return parts.join(' • ');
}

async function loadStoreProfile() {
    const setting = await StoreSetting.findByPk(1).catch(() => null);
    const siteUrl = getFrontendPublicUrl() || getFrontendAppUrl();

    return {
        name: setting?.store_name || process.env.STORE_NAME || 'Ótica Olho de Hórus',
        email: setting?.contact_email || process.env.STORE_CONTACT_EMAIL || process.env.MAIL_USER || '',
        phone: setting?.contact_phone || process.env.STORE_CONTACT_PHONE || '',
        cnpj: setting?.cnpj || process.env.STORE_CNPJ || '',
        address: setting?.shipping_origin_address || process.env.STORE_ORIGIN_ADDRESS || '',
        number: setting?.shipping_origin_number || process.env.STORE_ORIGIN_NUMBER || '',
        district: setting?.shipping_origin_district || process.env.STORE_ORIGIN_DISTRICT || '',
        city: setting?.shipping_origin_city || process.env.STORE_ORIGIN_CITY || '',
        state: setting?.shipping_origin_state || process.env.STORE_ORIGIN_STATE || '',
        postalCode: setting?.shipping_origin_postal_code || process.env.STORE_ORIGIN_POSTAL_CODE || '',
        siteUrl,
        logoUrl: `${siteUrl}/logo-completa.png`,
    };
}

export function getCustomerOrderStage(order) {
    if (order?.status === 'cancelado') return 'cancelado';
    if (order?.fulfillment_status === 'entregue') return 'entregue';
    if (order?.fulfillment_status === 'em_transporte') return 'em_transporte';
    if (order?.fulfillment_status === 'em_preparacao' && ['pago', 'processando'].includes(order?.status)) return 'em_preparacao';
    if (order?.status === 'pago') return 'pagamento_confirmado';
    return 'pedido_realizado';
}

export function getCustomerOrderStageLabel(order) {
    const stage = getCustomerOrderStage(order);
    return stageMeta[stage]?.badge || 'Pedido realizado';
}

export function buildCustomerOrderTimeline(order) {
    const currentStage = getCustomerOrderStage(order);
    const currentIndex = orderedCustomerStages.indexOf(currentStage);

    return orderedCustomerStages.map((stage, index) => ({
        code: stage,
        label: stageMeta[stage].badge,
        current: stage === currentStage,
        completed: currentIndex >= index,
    }));
}

function resolveStagesToNotify({ currentStage, lastNotifiedStage, force }) {
    if (!currentStage || !stageMeta[currentStage]) {
        return [];
    }

    if (currentStage === 'cancelado') {
        if (!force && lastNotifiedStage === 'cancelado') {
            return [];
        }

        return ['cancelado'];
    }

    const currentIndex = orderedCustomerStages.indexOf(currentStage);
    if (currentIndex === -1) {
        return [];
    }

    const lastIndex = orderedCustomerStages.indexOf(lastNotifiedStage);

    if (!force && lastIndex === currentIndex) {
        return [];
    }

    const startIndex = force
        ? Math.max(0, lastIndex + 1)
        : Math.max(0, lastIndex + 1);

    return orderedCustomerStages.slice(startIndex, currentIndex + 1);
}

function buildItemsRows(order) {
    return (order?.items || []).map((item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e7ecf3;">
            <div style="font-weight:600;color:#1f2a44;">${escapeHtml(item.product_name)}</div>
            <div style="font-size:12px;color:#6b7280;">
              ${item.selected_color_name ? `Cor: ${escapeHtml(item.selected_color_name)} • ` : ''}${Number(item.quantity || 0)} unidade(s)
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e7ecf3;text-align:right;font-weight:600;color:#1f2a44;">
            ${escapeHtml(formatCurrency(item.total_price))}
          </td>
        </tr>
    `).join('');
}

function buildTimelineHtml(order) {
    return buildCustomerOrderTimeline(order).map((step) => `
        <div style="display:inline-block;margin:0 8px 8px 0;padding:10px 14px;border-radius:999px;background:${step.current ? '#223758' : step.completed ? '#dfe8f6' : '#f4f6f9'};color:${step.current ? '#ffffff' : '#223758'};font-size:13px;font-weight:600;">
          ${escapeHtml(step.label)}
        </div>
    `).join('');
}

function buildOrderEmailHtml({ order, stage, store }) {
    const stageInfo = stageMeta[stage] || stageMeta.pedido_realizado;
    const shippingAddress = parseJsonField(order.shipping_address_json) || order.shipping_address || {};
    const paymentDetails = parseJsonField(order.payment_details_json) || order.payment_details || {};
    const storeAddress = buildStoreAddress(store);

    return `
      <div style="margin:0;padding:32px 16px;background:#eef2f7;font-family:Arial,sans-serif;color:#223758;">
        <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(34,55,88,0.12);">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#223758 0%,#304d7e 100%);color:#ffffff;">
            <img src="${escapeHtml(store.logoUrl)}" alt="${escapeHtml(store.name)}" style="max-width:220px;display:block;margin-bottom:20px;">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.16);font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
              ${escapeHtml(stageInfo.badge)}
            </div>
            <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.15;">${escapeHtml(stageInfo.title)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.9);">${escapeHtml(stageInfo.description)}</p>
          </div>

          <div style="padding:28px 32px;">
            <div style="margin-bottom:24px;">
              ${buildTimelineHtml(order)}
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:28px;">
              <div style="padding:18px;border:1px solid #e7ecf3;border-radius:18px;background:#fafbfd;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">Pedido</div>
                <div style="margin-top:8px;font-size:24px;font-weight:700;color:#1f2a44;">#${escapeHtml(order.id)}</div>
                <div style="margin-top:8px;font-size:14px;color:#52607a;">Realizado em ${escapeHtml(formatDateTime(order.createdAt || order.created_at))}</div>
              </div>
              <div style="padding:18px;border:1px solid #e7ecf3;border-radius:18px;background:#fafbfd;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">Pagamento</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;color:#1f2a44;">${escapeHtml(paymentDetails.method_label || 'Não informado')}</div>
                <div style="margin-top:8px;font-size:14px;color:#52607a;">Status interno: ${escapeHtml(order.status || 'não informado')}</div>
              </div>
              <div style="padding:18px;border:1px solid #e7ecf3;border-radius:18px;background:#fafbfd;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">Total</div>
                <div style="margin-top:8px;font-size:24px;font-weight:700;color:#1f2a44;">${escapeHtml(formatCurrency(order.total_amount))}</div>
                <div style="margin-top:8px;font-size:14px;color:#52607a;">Frete: ${escapeHtml(formatCurrency(order.shipping_price))}</div>
              </div>
            </div>

            <div style="margin-bottom:28px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#1f2a44;">Itens do pedido</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tbody>${buildItemsRows(order)}</tbody>
              </table>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-bottom:28px;">
              <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #e7ecf3;">
                <h3 style="margin:0 0 10px;font-size:16px;color:#1f2a44;">Entrega</h3>
                <p style="margin:0 0 8px;line-height:1.6;color:#52607a;">
                  ${escapeHtml([shippingAddress.street, shippingAddress.number].filter(Boolean).join(', ') || 'Endereço não informado')}
                </p>
                <p style="margin:0 0 8px;line-height:1.6;color:#52607a;">
                  ${escapeHtml([shippingAddress.neighborhood, [shippingAddress.city, shippingAddress.state].filter(Boolean).join('/')].filter(Boolean).join(' • '))}
                </p>
                <p style="margin:0 0 8px;line-height:1.6;color:#52607a;">${shippingAddress.cep ? `CEP ${escapeHtml(shippingAddress.cep)}` : 'CEP não informado'}</p>
                <p style="margin:0;line-height:1.6;color:#52607a;">${escapeHtml(order.shipping_company_name || 'Transportadora não informada')}</p>
                ${order.tracking_code ? `<p style="margin:12px 0 0;font-weight:700;color:#1f2a44;">Código de rastreio: ${escapeHtml(order.tracking_code)}</p>` : ''}
                ${order.tracking_url ? `<p style="margin:8px 0 0;"><a href="${escapeHtml(order.tracking_url)}" style="color:#223758;font-weight:700;text-decoration:none;">Acompanhar entrega</a></p>` : ''}
              </div>

              <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #e7ecf3;">
                <h3 style="margin:0 0 10px;font-size:16px;color:#1f2a44;">Atendimento</h3>
                <p style="margin:0 0 8px;line-height:1.6;color:#52607a;">${escapeHtml(store.name)}</p>
                ${store.cnpj ? `<p style="margin:0 0 8px;line-height:1.6;color:#52607a;">CNPJ: ${escapeHtml(formatCnpj(store.cnpj))}</p>` : ''}
                ${store.email ? `<p style="margin:0 0 8px;line-height:1.6;color:#52607a;">E-mail: ${escapeHtml(store.email)}</p>` : ''}
                ${store.phone ? `<p style="margin:0 0 8px;line-height:1.6;color:#52607a;">Telefone: ${escapeHtml(store.phone)}</p>` : ''}
                ${storeAddress ? `<p style="margin:0;line-height:1.6;color:#52607a;">${escapeHtml(storeAddress)}</p>` : ''}
              </div>
            </div>

            <div style="padding:18px 20px;border-radius:18px;background:#faf6e8;border:1px solid #eadab0;color:#5d4c1c;">
              Em caso de dúvidas, responda este e-mail ou entre em contato com nossa equipe. Guarde esta mensagem como comprovante do andamento do pedido.
            </div>
          </div>
        </div>
      </div>
    `;
}

function buildOrderEmailText({ order, stage, store }) {
    const stageInfo = stageMeta[stage] || stageMeta.pedido_realizado;

    return [
        `${store.name}`,
        '',
        `${stageInfo.title}`,
        stageInfo.description,
        '',
        `Pedido #${order.id}`,
        `Status atual: ${stageInfo.badge}`,
        `Total: ${formatCurrency(order.total_amount)}`,
        `Forma de pagamento: ${parseJsonField(order.payment_details_json)?.method_label || 'Não informado'}`,
        order.tracking_code ? `Código de rastreio: ${order.tracking_code}` : null,
        order.tracking_url ? `Rastreio: ${order.tracking_url}` : null,
        '',
        `Atendimento: ${store.email || 'não informado'} ${store.phone ? `| ${store.phone}` : ''}`.trim(),
    ].filter(Boolean).join('\n');
}

export async function notifyOrderStageChange(order, { force = false } = {}) {
    const customerEmail = String(order?.customer_email || '').trim().toLowerCase();
    const userEmail = String(order?.user?.email || '').trim().toLowerCase();
    const destinationEmail = isMercadoPagoTestUserEmail(customerEmail) && userEmail
        ? userEmail
        : (customerEmail || userEmail);

    if (!destinationEmail) {
        return null;
    }

    const store = await loadStoreProfile();
    let lastDeliveredStage = null;
    const transaction = await Order.sequelize.transaction();

    try {
        const lockedOrder = await Order.findByPk(order.id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!lockedOrder) {
            await transaction.rollback();
            return null;
        }

        const currentStage = getCustomerOrderStage(order);
        const stagesToNotify = resolveStagesToNotify({
            currentStage,
            lastNotifiedStage: lockedOrder.last_notified_stage,
            force,
        });

        if (stagesToNotify.length === 0) {
            await transaction.commit();
            return null;
        }

        for (const stage of stagesToNotify) {
            const stageInfo = stageMeta[stage] || stageMeta.pedido_realizado;
            const delivery = await sendMail({
                to: destinationEmail,
                subject: `${stageInfo.subject} | ${store.name} | Pedido #${order.id}`,
                html: buildOrderEmailHtml({ order, stage, store }),
                text: buildOrderEmailText({ order, stage, store }),
            });

            if (delivery?.skipped) {
                break;
            }

            lastDeliveredStage = stage;
            order.last_notified_stage = stage;
            lockedOrder.last_notified_stage = stage;
            await lockedOrder.update({ last_notified_stage: stage }, { transaction });
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    return lastDeliveredStage;
}
