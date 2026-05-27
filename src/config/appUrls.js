function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

function isPublicHttpUrl(value) {
    try {
        const url = new URL(String(value || '').trim());
        return ['http:', 'https:'].includes(url.protocol) && !['localhost', '127.0.0.1'].includes(url.hostname);
    } catch {
        return false;
    }
}

export function getFrontendAppUrl() {
    return normalizeBaseUrl(process.env.FRONTEND_URL || 'http://localhost:5173');
}

export function getFrontendPublicUrl() {
    const publicUrl = normalizeBaseUrl(process.env.FRONTEND_PUBLIC_URL || '');
    return isPublicHttpUrl(publicUrl) ? publicUrl : '';
}

export function getBackendPublicUrl() {
    const publicUrl = normalizeBaseUrl(process.env.BACKEND_PUBLIC_URL || '');
    return isPublicHttpUrl(publicUrl) ? publicUrl : '';
}

export function getCheckoutReturnBaseUrl() {
    return getFrontendPublicUrl() || getBackendPublicUrl() || getFrontendAppUrl();
}

export function buildCheckoutReturnUrl(status) {
    const baseUrl = getCheckoutReturnBaseUrl();

    if (baseUrl === getBackendPublicUrl()) {
        return `${baseUrl}/checkout/return?checkout=${status}`;
    }

    return `${baseUrl}/carrinho?checkout=${status}`;
}

export function getAllowedCorsOrigins() {
    const configuredOrigins = String(process.env.CORS_ALLOWED_ORIGINS || '')
        .split(',')
        .map((value) => normalizeBaseUrl(value))
        .filter(Boolean);

    return [...new Set([
        'http://127.0.0.1:3001',
        'http://localhost:3001',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        getFrontendAppUrl(),
        getFrontendPublicUrl(),
        ...configuredOrigins,
    ].filter(Boolean))];
}
