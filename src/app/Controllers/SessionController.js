import * as Yup from "yup";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth.js";
import { sendServerError } from "../../utils/http.js";

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

class SessionController {
    async store(req, res) {
        const Schema = Yup.object({ //Validação de dados
            email: Yup.string().email().required(),
            password: Yup.string().min(6).required(),
        });

        const errorEmailPassword = () => {
            return res.status(400).json({ error: "E-mail or password invalid." });
        }

        try {
            Schema.validateSync(req.body, { strict: true }); //Validação de dados.
        } catch (err) {
            return errorEmailPassword();
        }

        const { email, password } = req.body;

        try {
            const normalizedEmail = normalizeEmail(email);
            const userExists = await User.findOne({
                where: { email: normalizedEmail },
            });

            if (!userExists || !userExists.password_hash) {
                return errorEmailPassword();
            }

            if (!userExists.is_active) {
                return res.status(403).json({ error: 'Sua conta está inativa. Entre em contato com a loja.' });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, userExists.password_hash);

            if (!isPasswordCorrect) {
                return errorEmailPassword();
            }

            const token = jwt.sign(
                { id: userExists.id },
                authConfig.secret,
                {
                    expiresIn: authConfig.expiresIn,
                },
            );

            await userExists.update({ last_login_at: new Date() });

            return res.status(200).json({
                id: userExists.id,
                name: userExists.name,
                email: userExists.email,
                admin: userExists.admin,
                token,
            });
        } catch (error) {
            return sendServerError(res, 'Erro ao autenticar usuário.', error);
        }
    }
}

export default new SessionController();
