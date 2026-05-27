import { ensureMelhorEnvioConfigured, melhorEnvioRequest } from './melhorEnvio.js';
export const STORE_PICKUP_SERVICE_ID = 'retirada_loja';

function normalizeDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function toNumber(value, fallback) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function isCorreiosQuote(quote) {
    const companyName = String(quote.company?.name || '').toLowerCase();
    return companyName.includes('correios');
}

export function buildOriginAddress(storeSettings = null) {
    const postalCode = normalizeDigits(storeSettings?.shipping_origin_postal_code || process.env.STORE_ORIGIN_POSTAL_CODE);

    if (!postalCode) {
        throw new Error('STORE_ORIGIN_POSTAL_CODE não configurado.');
    }

    return {
        postal_code: postalCode,
        address: storeSettings?.shipping_origin_address || process.env.STORE_ORIGIN_ADDRESS || '',
        number: storeSettings?.shipping_origin_number || process.env.STORE_ORIGIN_NUMBER || '',
        district: storeSettings?.shipping_origin_district || process.env.STORE_ORIGIN_DISTRICT || '',
        city: storeSettings?.shipping_origin_city || process.env.STORE_ORIGIN_CITY || '',
        state_abbr: storeSettings?.shipping_origin_state || process.env.STORE_ORIGIN_STATE || '',
    };
}

function buildStorePickupQuote() {
    return {
        service_id: STORE_PICKUP_SERVICE_ID,
        service_name: 'Retirar na loja',
        company_name: 'Ótica Olho de Hórus',
        company_picture: null,
        price: 0,
        delivery_time: 0,
        error: null,
        raw: {
            type: 'store_pickup',
        },
    };
}

export function getStorePickupQuote() {
    return buildStorePickupQuote();
}

export function buildShippingProducts(cartItems) {
    const defaultWeight = toNumber(process.env.DEFAULT_PACKAGE_WEIGHT, 0.4);
    const defaultWidth = toNumber(process.env.DEFAULT_PACKAGE_WIDTH, 16);
    const defaultHeight = toNumber(process.env.DEFAULT_PACKAGE_HEIGHT, 6);
    const defaultLength = toNumber(process.env.DEFAULT_PACKAGE_LENGTH, 18);

    return cartItems.map((item) => ({
        id: String(item.id),
        width: toNumber(item.width, defaultWidth),
        height: toNumber(item.height, defaultHeight),
        length: toNumber(item.length, defaultLength),
        weight: toNumber(item.weight, defaultWeight),
        insurance_value: Number(item.price),
        quantity: Number(item.quantity),
    }));
}

export async function calculateShippingQuotes({ toPostalCode, cartItems, storeSettings = null }) {
    let melhorEnvioConfig = null;

    try {
        melhorEnvioConfig = ensureMelhorEnvioConfigured(storeSettings);
    } catch {
        return [buildStorePickupQuote()];
    }

    const origin = buildOriginAddress(storeSettings);
    const destinationPostalCode = normalizeDigits(toPostalCode);
    const defaultWeight = toNumber(process.env.DEFAULT_PACKAGE_WEIGHT, 0.4);
    const defaultWidth = toNumber(process.env.DEFAULT_PACKAGE_WIDTH, 16);
    const defaultHeight = toNumber(process.env.DEFAULT_PACKAGE_HEIGHT, 6);
    const defaultLength = toNumber(process.env.DEFAULT_PACKAGE_LENGTH, 18);
    const fallbackWeight = toNumber(storeSettings?.default_package_weight, defaultWeight);
    const fallbackWidth = toNumber(storeSettings?.default_package_width, defaultWidth);
    const fallbackHeight = toNumber(storeSettings?.default_package_height, defaultHeight);
    const fallbackLength = toNumber(storeSettings?.default_package_length, defaultLength);

    if (!destinationPostalCode) {
        throw new Error('CEP de destino inválido para cálculo do frete.');
    }

    const data = await melhorEnvioRequest(melhorEnvioConfig, '/api/v2/me/shipment/calculate', {
        method: 'POST',
        body: JSON.stringify({
            from: origin,
            to: {
                postal_code: destinationPostalCode,
            },
            products: cartItems.map((item) => ({
                id: String(item.id),
                width: toNumber(item.width, fallbackWidth),
                height: toNumber(item.height, fallbackHeight),
                length: toNumber(item.length, fallbackLength),
                weight: toNumber(item.weight, fallbackWeight),
                insurance_value: Number(item.price),
                quantity: Number(item.quantity),
            })),
            options: {
                receipt: false,
                own_hand: false,
                collect: false,
            },
        }),
    });

    if (!Array.isArray(data)) {
        throw new Error('Resposta inesperada do Melhor Envio.');
    }

    const subtotalAmount = cartItems.reduce(
        (total, item) => total + (Number(item.price || 0) * Number(item.quantity || 0)),
        0
    );
    const freeShippingEnabled = Boolean(storeSettings?.free_shipping_enabled);
    const freeShippingMinAmount = Number(storeSettings?.free_shipping_min_amount || 0);
    const qualifiesForFreeShipping = freeShippingEnabled && freeShippingMinAmount > 0 && subtotalAmount >= freeShippingMinAmount;

    const validQuotes = data
        .filter((quote) => !quote.error)
        .map((quote) => ({
            service_id: String(quote.id),
            service_name: quote.name,
            company_name: quote.company?.name || 'Transportadora',
            company_picture: quote.company?.picture || null,
            price: qualifiesForFreeShipping ? 0 : Number(quote.custom_price ?? quote.price ?? 0),
            delivery_time: Number(quote.custom_delivery_time ?? quote.delivery_time ?? 0),
            error: quote.error || null,
            raw: {
                ...quote,
                free_shipping_applied: qualifiesForFreeShipping,
            },
        }));

    const filteredQuotes = validQuotes
        .filter((quote) => isCorreiosQuote(quote.raw))
        .map((quote) => ({
            ...quote,
            raw: {
                ...quote.raw,
                non_correios_available: validQuotes.some((item) => !isCorreiosQuote(item.raw)),
            },
        }))
        .sort((a, b) => a.price - b.price);

    if (filteredQuotes.length === 0) {
        return [{
            ...buildStorePickupQuote(),
            raw: {
                type: 'store_pickup',
                warning: 'Nenhuma opção dos Correios está disponível para este endereço no momento. A retirada na loja continua disponível.',
            },
        }];
    }

    return [buildStorePickupQuote(), ...filteredQuotes];
}
