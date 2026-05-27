import * as Yup from 'yup';
import StoreSetting from '../models/StoreSetting.js';
import {
    buildMelhorEnvioAuthorizationUrl,
    exchangeMelhorEnvioAuthorizationCode,
} from '../../services/melhorEnvio.js';
import { getBackendPublicUrl, getFrontendAppUrl } from '../../config/appUrls.js';
import { sendServerError } from '../../utils/http.js';

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');
const normalizeText = (value) => value == null ? null : String(value).trim();

function formatStoreSetting(setting) {
    return {
        id: setting.id,
        store_name: setting.store_name,
        cnpj: setting.cnpj,
        contact_email: setting.contact_email,
        contact_phone: setting.contact_phone,
        shipping_origin_postal_code: setting.shipping_origin_postal_code,
        shipping_origin_address: setting.shipping_origin_address,
        shipping_origin_number: setting.shipping_origin_number,
        shipping_origin_district: setting.shipping_origin_district,
        shipping_origin_city: setting.shipping_origin_city,
        shipping_origin_state: setting.shipping_origin_state,
        default_package_weight: setting.default_package_weight == null ? null : Number(setting.default_package_weight),
        default_package_width: setting.default_package_width == null ? null : Number(setting.default_package_width),
        default_package_height: setting.default_package_height == null ? null : Number(setting.default_package_height),
        default_package_length: setting.default_package_length == null ? null : Number(setting.default_package_length),
        free_shipping_enabled: Boolean(setting.free_shipping_enabled),
        free_shipping_min_amount: setting.free_shipping_min_amount == null ? null : Number(setting.free_shipping_min_amount),
        warranty_months: setting.warranty_months == null ? null : Number(setting.warranty_months),
        return_days: setting.return_days == null ? null : Number(setting.return_days),
        melhor_envio_enabled: Boolean(setting.melhor_envio_enabled),
        melhor_envio_sandbox: Boolean(setting.melhor_envio_sandbox),
        melhor_envio_token: '',
        melhor_envio_token_configured: Boolean(setting.melhor_envio_token),
        melhor_envio_app_name: setting.melhor_envio_app_name || '',
        melhor_envio_technical_email: setting.melhor_envio_technical_email || '',
        melhor_envio_agency: setting.melhor_envio_agency == null ? null : Number(setting.melhor_envio_agency),
        melhor_envio_client_id: setting.melhor_envio_client_id || '',
        melhor_envio_client_secret: '',
        melhor_envio_client_secret_configured: Boolean(setting.melhor_envio_client_secret),
        melhor_envio_refresh_token: '',
        melhor_envio_refresh_token_configured: Boolean(setting.melhor_envio_refresh_token),
        melhor_envio_token_expires_at: setting.melhor_envio_token_expires_at,
        melhor_envio_public_url: setting.melhor_envio_public_url || '',
    };
}

function buildFrontendAdminUrl(query = '') {
    const frontendUrl = getFrontendAppUrl();
    return `${frontendUrl}/admin${query ? `?${query}` : ''}`;
}

function buildBackendCallbackUrl(req) {
    return `${req.protocol}://${req.get('host')}/melhor-envio/callback`;
}

function buildPublicMelhorEnvioCallbackUrl(req, setting) {
    const baseUrl = normalizeText(process.env.MELHOR_ENVIO_PUBLIC_URL || setting?.melhor_envio_public_url || getBackendPublicUrl());
    if (baseUrl) {
        return `${baseUrl.replace(/\/+$/, '')}/melhor-envio/callback`;
    }
    return buildBackendCallbackUrl(req);
}

function readJwtPayload(token) {
    try {
        const payloadPart = String(token || '').split('.')[1];
        if (!payloadPart) {
            return null;
        }

        return JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

async function getSingletonSetting() {
    const [setting] = await StoreSetting.findOrCreate({
        where: { id: 1 },
        defaults: { id: 1 },
    });

    return setting;
}

class StoreSettingController {
    async showPublic(_req, res) {
        try {
            const setting = await getSingletonSetting();
            return res.status(200).json({
                free_shipping_enabled: Boolean(setting.free_shipping_enabled),
                free_shipping_min_amount: setting.free_shipping_min_amount == null ? null : Number(setting.free_shipping_min_amount),
                warranty_months: setting.warranty_months == null ? null : Number(setting.warranty_months),
                return_days: setting.return_days == null ? null : Number(setting.return_days),
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao carregar informações públicas da loja.', error);
        }
    }

    async show(_req, res) {
        try {
            const setting = await getSingletonSetting();
            return res.status(200).json(formatStoreSetting(setting));
        } catch (error) {
            return sendServerError(res, 'Erro ao carregar configurações da loja.', error);
        }
    }

    async testMelhorEnvio(_req, res) {
        try {
            const setting = await getSingletonSetting();
            if (!setting.melhor_envio_enabled) {
                return res.status(400).json({ error: 'Ative a integração com o Melhor Envio antes de testar a conexão.' });
            }

            if (!setting.melhor_envio_token) {
                return res.status(400).json({ error: 'Conecte a conta via OAuth antes de testar a conexão.' });
            }

            const payload = readJwtPayload(setting.melhor_envio_token);
            const tokenExpiresAt = setting.melhor_envio_token_expires_at ? new Date(setting.melhor_envio_token_expires_at) : null;
            const isExpired = Boolean(tokenExpiresAt && tokenExpiresAt.getTime() <= Date.now());

            if (!payload) {
                return res.status(400).json({ error: 'O token salvo do Melhor Envio está inválido. Reconecte a conta via OAuth.' });
            }

            if (isExpired) {
                return res.status(400).json({ error: 'O token do Melhor Envio expirou. Reconecte a conta via OAuth.' });
            }

            return res.status(200).json({
                sandbox: Boolean(setting.melhor_envio_sandbox),
                connected: true,
                token_expires_at: tokenExpiresAt,
                token_audience: payload.aud || null,
                token_subject: payload.sub || null,
                scopes: Array.isArray(payload.scopes) ? payload.scopes : [],
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao testar conexão com o Melhor Envio.', error);
        }
    }

    async getMelhorEnvioAuthorizationUrl(req, res) {
        try {
            const setting = await getSingletonSetting();
            const state = `me_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

            await setting.update({
                melhor_envio_oauth_state: state,
            });

            const redirectUri = buildPublicMelhorEnvioCallbackUrl(req, setting);
            const authorizationUrl = buildMelhorEnvioAuthorizationUrl(setting, {
                redirectUri,
                state,
            });

            return res.status(200).json({
                authorization_url: authorizationUrl,
                redirect_uri: redirectUri,
                sandbox: Boolean(setting.melhor_envio_sandbox),
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao preparar autorização do Melhor Envio.', error);
        }
    }

    async handleMelhorEnvioCallback(req, res) {
        try {
            const setting = await getSingletonSetting();
            const redirectUri = buildPublicMelhorEnvioCallbackUrl(req, setting);
            const receivedState = String(req.query.state || '').trim();
            const receivedCode = String(req.query.code || '').trim();
            const receivedError = String(req.query.error || '').trim();

            if (receivedError) {
                return res.redirect(buildFrontendAdminUrl(`aba=configuracoes&melhor_envio=erro&motivo=${encodeURIComponent(receivedError)}`));
            }

            if (!receivedCode) {
                return res.redirect(buildFrontendAdminUrl('aba=configuracoes&melhor_envio=erro&motivo=missing_code'));
            }

            if (!setting.melhor_envio_oauth_state || receivedState !== setting.melhor_envio_oauth_state) {
                return res.redirect(buildFrontendAdminUrl('aba=configuracoes&melhor_envio=erro&motivo=invalid_state'));
            }

            const tokenResponse = await exchangeMelhorEnvioAuthorizationCode(setting, {
                code: receivedCode,
                redirectUri,
            });

            const expiresIn = Number(tokenResponse?.expires_in || 0);
            const tokenExpiresAt = Number.isFinite(expiresIn) && expiresIn > 0
                ? new Date(Date.now() + (expiresIn * 1000))
                : null;

            await setting.update({
                melhor_envio_enabled: true,
                melhor_envio_token: tokenResponse?.access_token || null,
                melhor_envio_refresh_token: tokenResponse?.refresh_token || null,
                melhor_envio_token_expires_at: tokenExpiresAt,
                melhor_envio_oauth_state: null,
            });

            return res.redirect(buildFrontendAdminUrl('aba=configuracoes&melhor_envio=conectado'));
        } catch (error) {
            return res.redirect(buildFrontendAdminUrl(`aba=configuracoes&melhor_envio=erro&motivo=${encodeURIComponent(error.message || 'callback_error')}`));
        }
    }

    async update(req, res) {
        const schema = Yup.object({
            store_name: Yup.string().trim().min(3).max(255).required(),
            cnpj: Yup.string().nullable(),
            contact_email: Yup.string().trim().email().nullable(),
            contact_phone: Yup.string().nullable(),
            shipping_origin_postal_code: Yup.string().nullable(),
            shipping_origin_address: Yup.string().nullable(),
            shipping_origin_number: Yup.string().nullable(),
            shipping_origin_district: Yup.string().nullable(),
            shipping_origin_city: Yup.string().nullable(),
            shipping_origin_state: Yup.string().nullable().max(2),
            default_package_weight: Yup.number().nullable().min(0),
            default_package_width: Yup.number().nullable().min(0),
            default_package_height: Yup.number().nullable().min(0),
            default_package_length: Yup.number().nullable().min(0),
            free_shipping_enabled: Yup.boolean().required(),
            free_shipping_min_amount: Yup.number().nullable().min(0),
            warranty_months: Yup.number().integer().nullable().min(0),
            return_days: Yup.number().integer().nullable().min(0),
            melhor_envio_enabled: Yup.boolean().required(),
            melhor_envio_sandbox: Yup.boolean().required(),
            melhor_envio_token: Yup.string().nullable(),
            melhor_envio_app_name: Yup.string().nullable(),
            melhor_envio_technical_email: Yup.string().trim().email().nullable(),
            melhor_envio_agency: Yup.number().integer().nullable().min(1),
            melhor_envio_client_id: Yup.string().nullable(),
            melhor_envio_client_secret: Yup.string().nullable(),
            melhor_envio_public_url: Yup.string().trim().url().nullable(),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados de configuração inválidos.'] });
        }

        try {
            const setting = await getSingletonSetting();

            const freeShippingEnabled = Boolean(req.body.free_shipping_enabled);
            const freeShippingMinAmount = req.body.free_shipping_min_amount == null || req.body.free_shipping_min_amount === ''
                ? null
                : Number(req.body.free_shipping_min_amount);
            const nextMelhorEnvioToken = req.body.melhor_envio_token == null || req.body.melhor_envio_token === ''
                ? setting.melhor_envio_token
                : normalizeText(req.body.melhor_envio_token);
            const nextMelhorEnvioClientSecret = req.body.melhor_envio_client_secret == null || req.body.melhor_envio_client_secret === ''
                ? setting.melhor_envio_client_secret
                : normalizeText(req.body.melhor_envio_client_secret);

            if (freeShippingEnabled && (!Number.isFinite(freeShippingMinAmount) || freeShippingMinAmount <= 0)) {
                return res.status(400).json({ error: 'Informe um valor mínimo válido para ativar o frete grátis.' });
            }

            await setting.update({
                store_name: normalizeText(req.body.store_name),
                cnpj: normalizeDigits(req.body.cnpj),
                contact_email: normalizeText(req.body.contact_email)?.toLowerCase() || null,
                contact_phone: normalizeText(req.body.contact_phone),
                shipping_origin_postal_code: normalizeDigits(req.body.shipping_origin_postal_code),
                shipping_origin_address: normalizeText(req.body.shipping_origin_address),
                shipping_origin_number: normalizeText(req.body.shipping_origin_number),
                shipping_origin_district: normalizeText(req.body.shipping_origin_district),
                shipping_origin_city: normalizeText(req.body.shipping_origin_city),
                shipping_origin_state: normalizeText(req.body.shipping_origin_state)?.toUpperCase() || null,
                default_package_weight: req.body.default_package_weight == null || req.body.default_package_weight === '' ? null : Number(req.body.default_package_weight),
                default_package_width: req.body.default_package_width == null || req.body.default_package_width === '' ? null : Number(req.body.default_package_width),
                default_package_height: req.body.default_package_height == null || req.body.default_package_height === '' ? null : Number(req.body.default_package_height),
                default_package_length: req.body.default_package_length == null || req.body.default_package_length === '' ? null : Number(req.body.default_package_length),
                free_shipping_enabled: freeShippingEnabled,
                free_shipping_min_amount: freeShippingEnabled ? freeShippingMinAmount : null,
                warranty_months: req.body.warranty_months == null || req.body.warranty_months === '' ? null : Number(req.body.warranty_months),
                return_days: req.body.return_days == null || req.body.return_days === '' ? null : Number(req.body.return_days),
                melhor_envio_enabled: Boolean(req.body.melhor_envio_enabled),
                melhor_envio_sandbox: Boolean(req.body.melhor_envio_sandbox),
                melhor_envio_token: nextMelhorEnvioToken,
                melhor_envio_app_name: normalizeText(req.body.melhor_envio_app_name),
                melhor_envio_technical_email: normalizeText(req.body.melhor_envio_technical_email)?.toLowerCase() || null,
                melhor_envio_agency: req.body.melhor_envio_agency == null || req.body.melhor_envio_agency === '' ? null : Number(req.body.melhor_envio_agency),
                melhor_envio_client_id: normalizeText(req.body.melhor_envio_client_id),
                melhor_envio_client_secret: nextMelhorEnvioClientSecret,
                melhor_envio_public_url: normalizeText(req.body.melhor_envio_public_url),
            });

            return res.status(200).json(formatStoreSetting(setting));
        } catch (error) {
            return sendServerError(res, 'Erro ao salvar configurações da loja.', error);
        }
    }

    async disconnectMelhorEnvio(_req, res) {
        try {
            const setting = await getSingletonSetting();

            await setting.update({
                melhor_envio_token: null,
                melhor_envio_refresh_token: null,
                melhor_envio_token_expires_at: null,
                melhor_envio_oauth_state: null,
            });

            return res.status(200).json({
                disconnected: true,
                message: 'Conta do Melhor Envio desconectada com sucesso.',
                setting: formatStoreSetting(setting),
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao desconectar conta do Melhor Envio.', error);
        }
    }
}

export default new StoreSettingController();
