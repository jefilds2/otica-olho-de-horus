const PRODUCTION_BASE_URL = 'https://melhorenvio.com.br';
const SANDBOX_BASE_URL = 'https://sandbox.melhorenvio.com.br';
const PRODUCTION_APP_BASE_URL = 'https://www.melhorenvio.com.br';
const SANDBOX_APP_BASE_URL = 'https://sandbox.melhorenvio.com.br';
const REQUEST_TIMEOUT_MS = 15000;

function normalizeText(value) {
    const normalized = String(value || '').trim();
    return normalized || null;
}

function normalizeDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function toPositiveNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

export function getMelhorEnvioConfig(storeSettings = null) {
    const sandbox = storeSettings?.melhor_envio_sandbox ?? String(process.env.MELHOR_ENVIO_SANDBOX || '').toLowerCase() === 'true';
    const token = normalizeText(storeSettings?.melhor_envio_token || process.env.MELHOR_ENVIO_TOKEN);
    const refreshToken = normalizeText(storeSettings?.melhor_envio_refresh_token || process.env.MELHOR_ENVIO_REFRESH_TOKEN);
    const clientId = normalizeText(storeSettings?.melhor_envio_client_id || process.env.MELHOR_ENVIO_CLIENT_ID);
    const clientSecret = normalizeText(storeSettings?.melhor_envio_client_secret || process.env.MELHOR_ENVIO_CLIENT_SECRET);
    const appName = normalizeText(storeSettings?.melhor_envio_app_name || process.env.MELHOR_ENVIO_APP_NAME) || 'Otica Olho de Horus';
    const technicalEmail = normalizeText(storeSettings?.melhor_envio_technical_email || process.env.MELHOR_ENVIO_TECHNICAL_EMAIL) || 'contato@oticaolhodehorus.com.br';
    const agency = storeSettings?.melhor_envio_agency == null || storeSettings?.melhor_envio_agency === ''
        ? (process.env.MELHOR_ENVIO_AGENCY ? Number(process.env.MELHOR_ENVIO_AGENCY) : null)
        : Number(storeSettings.melhor_envio_agency);

    return {
        enabled: Boolean(storeSettings?.melhor_envio_enabled || token),
        sandbox,
        token,
        refreshToken,
        clientId,
        clientSecret,
        baseUrl: sandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL,
        appBaseUrl: sandbox ? SANDBOX_APP_BASE_URL : PRODUCTION_APP_BASE_URL,
        userAgent: `${appName} (${technicalEmail})`,
        appName,
        technicalEmail,
        agency: Number.isFinite(agency) && agency > 0 ? agency : null,
    };
}

export function ensureMelhorEnvioConfigured(storeSettings = null) {
    const config = getMelhorEnvioConfig(storeSettings);

    if (!config.enabled) {
        throw new Error('A integração com o Melhor Envio está desativada nas configurações da loja.');
    }

    if (!config.token) {
        throw new Error('Informe o token do Melhor Envio para preparar etiquetas.');
    }

    return config;
}

export function ensureMelhorEnvioOAuthConfigured(storeSettings = null) {
    const config = getMelhorEnvioConfig(storeSettings);

    if (!config.clientId || !config.clientSecret) {
        throw new Error('Informe Client ID e Client Secret do aplicativo Melhor Envio para concluir a autorização OAuth.');
    }

    return config;
}

export async function melhorEnvioRequest(config, path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;

    try {
        response = await fetch(`${config.baseUrl}${path}`, {
            ...options,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.token}`,
                'User-Agent': config.userAgent,
                ...(options.headers || {}),
            },
            signal: controller.signal,
        });
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('Tempo limite excedido ao comunicar com o Melhor Envio.');
        }

        throw new Error(`Falha de rede ao comunicar com o Melhor Envio: ${error.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || data?.error || 'Falha ao comunicar com o Melhor Envio.';
        throw new Error(message);
    }

    return data;
}

export async function melhorEnvioGetBalance(storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    return melhorEnvioRequest(config, '/api/v2/me/balance', {
        method: 'GET',
    });
}

export function buildMelhorEnvioAuthorizationUrl(storeSettings = null, { redirectUri, state, scope } = {}) {
    const config = ensureMelhorEnvioOAuthConfigured(storeSettings);
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: redirectUri,
        state,
        scope: scope || [
            'cart-read',
            'cart-write',
            'shipping-calculate',
            'shipping-checkout',
            'shipping-generate',
            'shipping-print',
            'shipping-tracking',
        ].join(' '),
    });

    return `${config.appBaseUrl}/oauth/authorize?${params.toString()}`;
}

async function melhorEnvioTokenRequest(config, bodyParams) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;

    try {
        response = await fetch(`${config.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': config.userAgent,
            },
            body: new URLSearchParams(bodyParams).toString(),
            signal: controller.signal,
        });
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('Tempo limite excedido ao autenticar com o Melhor Envio.');
        }

        throw new Error(`Falha de rede ao autenticar com o Melhor Envio: ${error.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || data?.error_description || data?.error || 'Falha ao autenticar com o Melhor Envio.';
        throw new Error(message);
    }

    return data;
}

export async function exchangeMelhorEnvioAuthorizationCode(storeSettings = null, { code, redirectUri } = {}) {
    const config = ensureMelhorEnvioOAuthConfigured(storeSettings);

    return melhorEnvioTokenRequest(config, {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        code,
    });
}

export async function refreshMelhorEnvioAuthorizationToken(storeSettings = null) {
    const config = ensureMelhorEnvioOAuthConfigured(storeSettings);

    if (!config.refreshToken) {
        throw new Error('Nenhum refresh token do Melhor Envio foi encontrado.');
    }

    return melhorEnvioTokenRequest(config, {
        grant_type: 'refresh_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
    });
}

export function buildMelhorEnvioPackage(order, storeSettings = null) {
    const items = Array.isArray(order.items) ? order.items : [];
    const fallbackWeight = toPositiveNumber(storeSettings?.default_package_weight, toPositiveNumber(process.env.DEFAULT_PACKAGE_WEIGHT, 0.4));
    const fallbackWidth = toPositiveNumber(storeSettings?.default_package_width, toPositiveNumber(process.env.DEFAULT_PACKAGE_WIDTH, 16));
    const fallbackHeight = toPositiveNumber(storeSettings?.default_package_height, toPositiveNumber(process.env.DEFAULT_PACKAGE_HEIGHT, 6));
    const fallbackLength = toPositiveNumber(storeSettings?.default_package_length, toPositiveNumber(process.env.DEFAULT_PACKAGE_LENGTH, 18));

    const weight = items.reduce((total, item) => {
        const itemWeight = toPositiveNumber(item.product?.weight, toPositiveNumber(item.weight, fallbackWeight));
        return total + (itemWeight * Number(item.quantity || 1));
    }, 0);

    const width = items.reduce((maxValue, item) => Math.max(maxValue, toPositiveNumber(item.product?.width, toPositiveNumber(item.width, fallbackWidth))), fallbackWidth);
    const length = items.reduce((maxValue, item) => Math.max(maxValue, toPositiveNumber(item.product?.length, toPositiveNumber(item.length, fallbackLength))), fallbackLength);
    const height = items.reduce((total, item) => total + (toPositiveNumber(item.product?.height, toPositiveNumber(item.height, fallbackHeight)) * Number(item.quantity || 1)), 0);

    return {
        height: Number(height.toFixed(2)),
        width: Number(width.toFixed(2)),
        length: Number(length.toFixed(2)),
        weight: Number(Math.max(weight, fallbackWeight).toFixed(3)),
    };
}

function buildOrigin(storeSettings = null) {
    return {
        name: normalizeText(storeSettings?.store_name || process.env.STORE_NAME) || 'Ótica Olho de Hórus',
        phone: normalizeDigits(storeSettings?.contact_phone || process.env.STORE_CONTACT_PHONE),
        email: normalizeText(storeSettings?.contact_email || process.env.STORE_CONTACT_EMAIL),
        company_document: normalizeDigits(storeSettings?.cnpj || process.env.STORE_CNPJ),
        state_register: normalizeText(process.env.STORE_STATE_REGISTER) || 'ISENTO',
        address: normalizeText(storeSettings?.shipping_origin_address || process.env.STORE_ORIGIN_ADDRESS),
        number: normalizeText(storeSettings?.shipping_origin_number || process.env.STORE_ORIGIN_NUMBER),
        district: normalizeText(storeSettings?.shipping_origin_district || process.env.STORE_ORIGIN_DISTRICT),
        city: normalizeText(storeSettings?.shipping_origin_city || process.env.STORE_ORIGIN_CITY),
        postal_code: normalizeDigits(storeSettings?.shipping_origin_postal_code || process.env.STORE_ORIGIN_POSTAL_CODE),
        state_abbr: normalizeText(storeSettings?.shipping_origin_state || process.env.STORE_ORIGIN_STATE)?.toUpperCase(),
        country_id: 'BR',
    };
}

function validatePartyAddress(label, addressData) {
    const missingFields = [];

    if (!normalizeText(addressData?.name)) missingFields.push('nome');
    if (!normalizeDigits(addressData?.phone)) missingFields.push('telefone');
    if (!normalizeText(addressData?.email)) missingFields.push('e-mail');
    if (!normalizeText(addressData?.address)) missingFields.push('endereço');
    if (!normalizeText(addressData?.number)) missingFields.push('número');
    if (!normalizeText(addressData?.district)) missingFields.push('bairro');
    if (!normalizeText(addressData?.city)) missingFields.push('cidade');

    const postalCode = normalizeDigits(addressData?.postal_code);
    if (postalCode.length !== 8) {
        missingFields.push('CEP com 8 dígitos');
    }

    const stateAbbr = normalizeText(addressData?.state_abbr);
    if (!stateAbbr || stateAbbr.length !== 2) {
        missingFields.push('UF com 2 letras');
    }

    if (missingFields.length > 0) {
        throw new Error(`Revise ${label}: ${missingFields.join(', ')}.`);
    }
}

function buildDestination(order) {
    const shippingAddress = typeof order.shipping_address_json === 'string'
        ? JSON.parse(order.shipping_address_json)
        : order.shipping_address_json;

    return {
        name: normalizeText(shippingAddress?.recipient_name || order.customer_name),
        phone: normalizeDigits(shippingAddress?.phone || order.customer_phone),
        email: normalizeText(order.customer_email),
        document: normalizeDigits(order.user?.cpf),
        address: normalizeText(shippingAddress?.street),
        complement: normalizeText(shippingAddress?.complement),
        number: normalizeText(shippingAddress?.number),
        district: normalizeText(shippingAddress?.neighborhood),
        city: normalizeText(shippingAddress?.city),
        postal_code: normalizeDigits(shippingAddress?.cep),
        state_abbr: normalizeText(shippingAddress?.state)?.toUpperCase(),
        country_id: 'BR',
        note: normalizeText(shippingAddress?.reference),
    };
}

function buildProducts(order) {
    const items = Array.isArray(order.items) ? order.items : [];

    return items.map((item) => ({
        name: item.product_name,
        quantity: String(Number(item.quantity || 1)),
        unitary_value: Number(item.unit_price || 0).toFixed(2),
    }));
}

export async function prepareMelhorEnvioShipment(order, storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    const origin = buildOrigin(storeSettings);
    const destination = buildDestination(order);
    const products = buildProducts(order);
    const volumes = [buildMelhorEnvioPackage(order, storeSettings)];

    validatePartyAddress('o endereço de origem da loja', origin);
    validatePartyAddress('o endereço do destinatário', destination);

    if (!Number.isFinite(Number(order.shipping_service_id))) {
        throw new Error('O serviço de frete do pedido não é compatível com a geração de etiqueta no Melhor Envio.');
    }

    if (products.length === 0) {
        throw new Error('O pedido não possui itens válidos para gerar a etiqueta.');
    }

    const payload = {
        service: Number(order.shipping_service_id),
        from: origin,
        to: destination,
        products,
        volumes,
        options: {
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: !normalizeDigits(storeSettings?.cnpj),
            insurance_value: Number(order.subtotal_amount || 0),
        },
    };

    if (config.agency) {
        payload.agency = config.agency;
    }

    const result = await melhorEnvioRequest(config, '/api/v2/me/cart', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return {
        payload,
        result,
        orderId: result?.id == null ? null : String(result.id),
        protocol: result?.protocol == null ? null : String(result.protocol),
        status: normalizeText(result?.status) || 'pending',
    };
}

function normalizeOrderIds(orderIds = []) {
    const normalized = orderIds
        .map((id) => String(id || '').trim())
        .filter(Boolean);

    if (normalized.length === 0) {
        throw new Error('Nenhum identificador do Melhor Envio foi informado.');
    }

    return normalized;
}

export async function checkoutMelhorEnvioShipments(orderIds, storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    return melhorEnvioRequest(config, '/api/v2/me/shipment/checkout', {
        method: 'POST',
        body: JSON.stringify({
            orders: normalizeOrderIds(orderIds),
        }),
    });
}

export async function generateMelhorEnvioLabels(orderIds, storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    return melhorEnvioRequest(config, '/api/v2/me/shipment/generate', {
        method: 'POST',
        body: JSON.stringify({
            orders: normalizeOrderIds(orderIds),
        }),
    });
}

export async function printMelhorEnvioLabels(orderIds, { mode = 'public' } = {}, storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    return melhorEnvioRequest(config, '/api/v2/me/shipment/print', {
        method: 'POST',
        body: JSON.stringify({
            mode,
            orders: normalizeOrderIds(orderIds),
        }),
    });
}

export async function trackMelhorEnvioShipments(orderIds, storeSettings = null) {
    const config = ensureMelhorEnvioConfigured(storeSettings);
    return melhorEnvioRequest(config, '/api/v2/me/shipment/tracking', {
        method: 'POST',
        body: JSON.stringify({
            orders: normalizeOrderIds(orderIds),
        }),
    });
}
