import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import * as Yup from 'yup';
import User from '../models/User.js';
import { buildPasswordResetUrl } from '../../config/appUrls.js';
import { sendMail } from '../../services/mail.js';
import { sendServerError } from '../../utils/http.js';

const forgotSchema = Yup.object({
    email: Yup.string().trim().email().required(),
}).noUnknown(true);

const resetSchema = Yup.object({
    email: Yup.string().trim().email().required(),
    token: Yup.string().trim().required(),
    new_password: Yup.string().min(6).required(),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password')], 'A confirmação da nova senha não confere.')
        .required(),
}).noUnknown(true);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function sha256(value) {
    return createHash('sha256').update(String(value || '')).digest('hex');
}

function buildPasswordResetEmailHtml({ resetUrl, userName }) {
    const escapedName = String(userName || 'cliente').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedUrl = String(resetUrl || '').replace(/"/g, '&quot;');

    return `
      <div style="margin:0;padding:24px;background:#f5f7fb;font-family:Arial,sans-serif;color:#1f2a44;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dfe5ef;border-radius:16px;overflow:hidden;">
          <div style="padding:24px 28px;border-bottom:1px solid #e8edf5;background:#ffffff;">
            <div style="font-size:20px;font-weight:700;color:#223758;">Ótica Olho de Hórus</div>
            <div style="margin-top:6px;font-size:13px;color:#5a6780;">Recuperação de senha da conta</div>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 14px;line-height:1.7;color:#334155;">
              Olá, ${escapedName}.
            </p>
            <p style="margin:0 0 16px;line-height:1.7;color:#334155;">
              Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você quem solicitou, use o botão abaixo para cadastrar uma nova senha.
            </p>
            <p style="margin:0 0 20px;line-height:1.7;color:#334155;">
              Este link expira em 1 hora e deve ser usado uma única vez.
            </p>
            <p style="margin:0 0 22px;">
              <a href="${escapedUrl}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#223758;color:#ffffff;text-decoration:none;font-weight:700;">
                Redefinir minha senha
              </a>
            </p>
            <p style="margin:0 0 10px;line-height:1.7;color:#52607a;">
              Se o botão não abrir, copie e cole este endereço no navegador:
            </p>
            <p style="margin:0 0 22px;word-break:break-all;color:#223758;font-size:13px;">
              ${escapedUrl}
            </p>
            <div style="padding:16px 18px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-size:14px;line-height:1.6;">
              Se você não solicitou esta redefinição, ignore este e-mail. Nenhuma alteração será feita sem a confirmação pelo link.
            </div>
          </div>
        </div>
      </div>
    `;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildPasswordResetPage({ email = '', token = '', error = '', success = false }) {
    const escapedEmail = escapeHtml(email);
    const escapedToken = escapeHtml(token);
    const escapedError = escapeHtml(error);

    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperação de senha | Ótica Olho de Hórus</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --card: #ffffff;
        --text: #1f2a44;
        --muted: #5f6c87;
        --border: #d9e2ef;
        --primary: #223758;
        --accent: #d9a73a;
        --danger-bg: #fff4f4;
        --danger-border: #efc2c2;
        --danger-text: #9d2f2f;
        --success-bg: #effaf1;
        --success-border: #b8e0c0;
        --success-text: #22663a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top center, rgba(217, 167, 58, 0.14), transparent 25%),
          linear-gradient(180deg, var(--bg) 0%, #fbfcfe 100%);
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(100%, 520px);
        background: var(--card);
        border: 1px solid rgba(34, 55, 88, 0.08);
        border-radius: 24px;
        box-shadow: 0 24px 64px rgba(18, 31, 53, 0.10);
        padding: 32px;
      }
      .logo {
        display: block;
        width: 210px;
        max-width: 100%;
        margin: 0 auto 18px;
      }
      .eyebrow {
        display: inline-block;
        margin-bottom: 8px;
        padding: 6px 11px;
        border-radius: 999px;
        background: rgba(34, 55, 88, 0.08);
        color: var(--primary);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 32px;
        text-align: center;
        color: var(--primary);
      }
      p.subtitle {
        margin: 0 0 24px;
        text-align: center;
        color: var(--muted);
        line-height: 1.65;
      }
      form { display: grid; gap: 16px; }
      label {
        display: grid;
        gap: 7px;
        font-size: 13px;
        font-weight: 700;
      }
      input {
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--border);
        font-size: 15px;
      }
      button {
        min-height: 50px;
        border: 0;
        border-radius: 12px;
        background: var(--accent);
        color: #18253d;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }
      .alert {
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.6;
      }
      .alert.error {
        background: var(--danger-bg);
        border: 1px solid var(--danger-border);
        color: var(--danger-text);
      }
      .alert.success {
        background: var(--success-bg);
        border: 1px solid var(--success-border);
        color: var(--success-text);
      }
      .actions {
        margin-top: 10px;
        text-align: center;
      }
      .actions a {
        color: var(--primary);
        font-weight: 700;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <section class="card">
      <img class="logo" src="/logo-completa.png" alt="Ótica Olho de Hórus" />
      <div style="text-align:center;">
        <span class="eyebrow">Recuperação de senha</span>
      </div>
      <h1>${success ? 'Senha alterada' : 'Defina sua nova senha'}</h1>
      <p class="subtitle">
        ${success
            ? 'Sua senha foi redefinida com sucesso. Agora você já pode entrar na sua conta normalmente.'
            : 'Crie uma nova senha para a sua conta. Este link é pessoal e expira em 1 hora.'}
      </p>
      ${escapedError ? `<div class="alert error">${escapedError}</div>` : ''}
      ${success ? `
        <div class="alert success">Processo concluído. Faça login com a nova senha.</div>
        <div class="actions"><a href="/login">Ir para o login</a></div>
      ` : `
        <form method="post" action="/password/reset/submit">
          <input type="hidden" name="email" value="${escapedEmail}" />
          <input type="hidden" name="token" value="${escapedToken}" />
          <label>
            E-mail
            <input type="email" value="${escapedEmail}" readonly />
          </label>
          <label>
            Nova senha
            <input type="password" name="new_password" minlength="6" required />
          </label>
          <label>
            Confirmar nova senha
            <input type="password" name="confirm_password" minlength="6" required />
          </label>
          <button type="submit">Salvar nova senha</button>
        </form>
        <div class="actions"><a href="/login">Voltar para o login</a></div>
      `}
    </section>
  </body>
</html>`;
}

class PasswordResetController {
    async showResetForm(req, res) {
        const email = normalizeEmail(req.query?.email);
        const token = String(req.query?.token || '').trim();
        const error = String(req.query?.error || '').trim();

        if (!email || !token) {
            return res.status(400).send(buildPasswordResetPage({
                email,
                token,
                error: 'Link de recuperação inválido. Solicite uma nova redefinição de senha.',
            }));
        }

        return res.status(200).send(buildPasswordResetPage({ email, token, error }));
    }

    async forgot(req, res) {
        try {
            forgotSchema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados inválidos.'] });
        }

        try {
            const email = normalizeEmail(req.body.email);
            const user = await User.findOne({ where: { email } });

            if (user && user.is_active !== false) {
                const token = randomBytes(32).toString('hex');
                const tokenHash = sha256(token);
                const expiresAt = new Date(Date.now() + (60 * 60 * 1000));

                await user.update({
                    reset_password_token_hash: tokenHash,
                    reset_password_expires_at: expiresAt,
                });

                const resetUrl = buildPasswordResetUrl({ token, email: user.email });

                await sendMail({
                    to: user.email,
                    subject: `Recuperação de senha | Ótica Olho de Hórus`,
                    html: buildPasswordResetEmailHtml({
                        resetUrl,
                        userName: user.name,
                    }),
                    text: [
                        'Recebemos uma solicitação para redefinir sua senha.',
                        `Acesse o link abaixo para cadastrar uma nova senha: ${resetUrl}`,
                        'Este link expira em 1 hora.',
                    ].join('\n'),
                });
            }

            return res.status(200).json({
                message: 'Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.',
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao iniciar recuperação de senha.', error);
        }
    }

    async reset(req, res) {
        try {
            resetSchema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados inválidos.'] });
        }

        try {
            const email = normalizeEmail(req.body.email);
            const tokenHash = sha256(req.body.token);

            const user = await User.findOne({
                where: {
                    email,
                    reset_password_token_hash: tokenHash,
                },
            });

            if (!user || !user.reset_password_expires_at || new Date(user.reset_password_expires_at) < new Date()) {
                return res.status(400).json({ error: 'O link de recuperação é inválido ou expirou.' });
            }

            const password_hash = await bcrypt.hash(req.body.new_password, 10);

            await user.update({
                password_hash,
                reset_password_token_hash: null,
                reset_password_expires_at: null,
            });

            return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
        } catch (error) {
            return sendServerError(res, 'Erro ao redefinir senha.', error);
        }
    }

    async resetFromForm(req, res) {
        const payload = {
            email: normalizeEmail(req.body?.email),
            token: String(req.body?.token || '').trim(),
            new_password: String(req.body?.new_password || ''),
            confirm_password: String(req.body?.confirm_password || ''),
        };

        try {
            resetSchema.validateSync(payload, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).send(buildPasswordResetPage({
                email: payload.email,
                token: payload.token,
                error: error.errors?.[0] || 'Dados inválidos.',
            }));
        }

        try {
            const tokenHash = sha256(payload.token);
            const user = await User.findOne({
                where: {
                    email: payload.email,
                    reset_password_token_hash: tokenHash,
                },
            });

            if (!user || !user.reset_password_expires_at || new Date(user.reset_password_expires_at) < new Date()) {
                return res.status(400).send(buildPasswordResetPage({
                    email: payload.email,
                    token: payload.token,
                    error: 'O link de recuperação é inválido ou expirou.',
                }));
            }

            const password_hash = await bcrypt.hash(payload.new_password, 10);

            await user.update({
                password_hash,
                reset_password_token_hash: null,
                reset_password_expires_at: null,
            });

            return res.status(200).send(buildPasswordResetPage({
                email: payload.email,
                token: '',
                success: true,
            }));
        } catch (error) {
            console.error('Erro ao redefinir senha via formulário HTML.', error);
            return res.status(500).send(buildPasswordResetPage({
                email: payload.email,
                token: payload.token,
                error: 'Não foi possível redefinir a senha agora. Tente novamente em instantes.',
            }));
        }
    }
}

export default new PasswordResetController();
