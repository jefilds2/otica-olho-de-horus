import express from 'express';
import routes from './routes.js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import errorHandler from './app/middlewares/errorHandler.js';
import { getAllowedCorsOrigins } from './config/appUrls.js';
import { UPLOADS_ROOT_DIR } from './utils/uploadStorage.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use((req, res, next) => {
    const allowedOrigins = getAllowedCorsOrigins();
    const requestOrigin = req.headers.origin;
    const isHttps = req.secure || String(req.headers['x-forwarded-proto'] || '').includes('https');

    if (allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
        res.header('Vary', 'Origin');
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'no-referrer');
    res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.header('Cross-Origin-Resource-Policy', 'same-site');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Origin-Agent-Cluster', '?1');
    res.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' https://sdk.mercadopago.com; connect-src 'self' https:; frame-src https://www.mercadopago.com.br https://www.mercadopago.com; font-src 'self' data: https:; base-uri 'self'; form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com; frame-ancestors 'none';");

    if (isHttps) {
        res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    return next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', (_req, res, next) => {
    // Imagens de produtos e categorias são públicas e precisam carregar no frontend.
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(UPLOADS_ROOT_DIR));

const frontendDistDir = resolve('frontend', 'dist');
const frontendIndexFile = resolve(frontendDistDir, 'index.html');
const hasFrontendBuild = existsSync(frontendIndexFile);

if (hasFrontendBuild) {
    app.use((req, res, next) => {
        const acceptHeader = String(req.headers.accept || '');
        const isSpaAdminRoute = req.method === 'GET'
            && req.path === '/admin'
            && acceptHeader.includes('text/html');

        if (!isSpaAdminRoute) {
            return next();
        }

        return res.sendFile(frontendIndexFile);
    });
}

app.use(routes);

if (hasFrontendBuild) {
    app.use(express.static(frontendDistDir));

    app.use((req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const acceptHeader = String(req.headers.accept || '');
        if (!acceptHeader.includes('text/html')) {
            return next();
        }

        return res.sendFile(frontendIndexFile);
    });
}

app.use(errorHandler);


export default app;
