import nodemailer from 'nodemailer';

let transporterPromise = null;

function toBoolean(value, fallback = false) {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return fallback;
    return ['1', 'true', 'yes', 'on'].includes(normalized);
}

export function isMailConfigured() {
    return Boolean(
        String(process.env.MAIL_USER || '').trim()
        && String(process.env.MAIL_PASS || '').trim()
    );
}

function buildTransportOptions() {
    const service = String(process.env.MAIL_SERVICE || 'gmail').trim();
    const user = String(process.env.MAIL_USER || '').trim();
    const pass = String(process.env.MAIL_PASS || '').trim();
    const host = String(process.env.MAIL_HOST || '').trim();
    const port = Number(process.env.MAIL_PORT || 465);
    const secure = toBoolean(process.env.MAIL_SECURE, port === 465);

    if (host) {
        return {
            host,
            port,
            secure,
            auth: { user, pass },
        };
    }

    return {
        service,
        auth: { user, pass },
    };
}

async function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = Promise.resolve(nodemailer.createTransport(buildTransportOptions()));
    }

    return transporterPromise;
}

export function getDefaultFromAddress() {
    const fromName = String(process.env.MAIL_FROM_NAME || process.env.STORE_NAME || 'Ótica Olho de Hórus').trim();
    const fromEmail = String(
        process.env.MAIL_FROM_EMAIL
        || process.env.MAIL_USER
        || process.env.STORE_CONTACT_EMAIL
        || ''
    ).trim();

    if (!fromEmail) {
        return null;
    }

    return `"${fromName.replace(/"/g, '')}" <${fromEmail}>`;
}

export async function sendMail({ to, subject, html, text }) {
    if (!isMailConfigured()) {
        console.warn(`Envio de e-mail ignorado por falta de configuração SMTP. Destinatário: ${to}`);
        return { skipped: true };
    }

    const from = getDefaultFromAddress();

    if (!from) {
        console.warn(`Envio de e-mail ignorado por falta do remetente configurado. Destinatário: ${to}`);
        return { skipped: true };
    }

    const transporter = await getTransporter();
    const replyTo = String(process.env.MAIL_REPLY_TO || process.env.STORE_CONTACT_EMAIL || process.env.MAIL_USER || '').trim() || undefined;
    const envelopeFrom = String(process.env.MAIL_ENVELOPE_FROM || process.env.MAIL_USER || '').trim() || undefined;

    return transporter.sendMail({
        from,
        to,
        subject,
        replyTo,
        envelope: envelopeFrom ? { from: envelopeFrom, to } : undefined,
        headers: {
            'X-Auto-Response-Suppress': 'All',
            'Auto-Submitted': 'auto-generated',
            'X-Entity-Ref-ID': `otica-${Date.now()}`,
        },
        html,
        text,
    });
}
