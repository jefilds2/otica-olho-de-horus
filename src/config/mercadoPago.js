const REQUEST_TIMEOUT_MS = 15000;

function getMercadoPagoAccessToken() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente.');
    }

    return accessToken;
}

async function mercadoPagoRequest(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;

    try {
        response = await fetch(`https://api.mercadopago.com${path}`, {
            method: options.method || 'GET',
            headers: {
                Authorization: `Bearer ${getMercadoPagoAccessToken()}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
        });
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('Tempo limite excedido ao comunicar com o Mercado Pago.');
        }

        throw new Error(`Falha de rede ao comunicar com o Mercado Pago: ${error.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = Array.isArray(data?.cause)
            ? data.cause.map((cause) => cause.description || cause.code).filter(Boolean).join(', ')
            : data?.message || data?.error || 'Falha na comunicação com o Mercado Pago.';

        throw new Error(message);
    }

    return data;
}

export function getMercadoPagoNotificationUrl(baseUrl = null) {
    const backendPublicUrl = String(baseUrl || process.env.BACKEND_PUBLIC_URL || '').trim();

    if (!backendPublicUrl) {
        return null;
    }

    return `${backendPublicUrl.replace(/\/$/, '')}/mercado-pago/webhook`;
}

export async function createCheckoutProPreference(preference) {
    return mercadoPagoRequest('/checkout/preferences', {
        method: 'POST',
        body: preference,
    });
}

export async function getMercadoPagoPayment(paymentId) {
    return mercadoPagoRequest(`/v1/payments/${paymentId}`);
}
