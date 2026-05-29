// Métodos de Criação do controle:
// store -> para criação de dados no BD 
// index -> lista todos os dados
// show -> mostra um dado
// update -> atualiza um dado
// destroy -> deleta um dado
// delete -> deleta todos os dados

import User from '../models/User.js';
import bcrypt from "bcrypt";
import * as Yup from "yup";
import { sendServerError } from "../../utils/http.js";

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');
const normalizeText = (value) => value == null ? null : String(value).trim();

const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    birth_date: user.birth_date,
    phone: user.phone,
    whatsapp: user.whatsapp,
    cep: user.cep,
    street: user.street,
    number: user.number,
    complement: user.complement,
    neighborhood: user.neighborhood,
    city: user.city,
    state: user.state,
    address_reference: user.address_reference,
    google_id: user.google_id,
    avatar_path: user.avatar_path,
    admin: user.admin,
    is_active: user.is_active,
    email_verified_at: user.email_verified_at,
    last_login_at: user.last_login_at,
    created_at: user.createdAt ?? user.created_at,
    updated_at: user.updatedAt ?? user.updated_at,
});

class UserController {
    async store(req, res) {
        let Schema = Yup.object({
            name: Yup.string().trim().required().min(3).max(120),
            email: Yup.string().trim().email().required(),
            password: Yup.string().min(6).required(),
            cpf: Yup.string().required(),
            birth_date: Yup.string().nullable(),
            phone: Yup.string().nullable(),
            whatsapp: Yup.string().nullable(),
            cep: Yup.string().nullable(),
            street: Yup.string().nullable(),
            number: Yup.string().nullable(),
            complement: Yup.string().nullable(),
            neighborhood: Yup.string().nullable(),
            city: Yup.string().nullable(),
            state: Yup.string().nullable().max(2),
            address_reference: Yup.string().nullable(),
        });

        try {
            Schema.validateSync(req.body, { abortEarly: false, strict: true }); //Validação de dados. AbortEarly: false, para retornar todos os erros.
        } catch (err) {
            return res.status(400).json({ error: err.errors });
        }


        try {
            const {
                name,
                email,
                password,
                cpf,
                birth_date,
                phone,
                whatsapp,
                cep,
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                address_reference,
                google_id,
                avatar_path,
            } = req.body;

            const normalizedEmail = normalizeEmail(email);
            const normalizedCpf = normalizeDigits(cpf);

            const userExists = await User.findOne({
                where: { email: normalizedEmail },
            });

            if (userExists) {
                return res.status(409).json({ error: 'E-mail já cadastrado.' });
            }

            const cpfExists = await User.findOne({
                where: { cpf: normalizedCpf },
            });

            if (cpfExists) {
                return res.status(409).json({ error: 'CPF já cadastrado.' });
            }

            const password_hash = await bcrypt.hash(password, 10);


            const user = await User.create({
                name: normalizeText(name),
                email: normalizedEmail,
                password_hash,
                cpf: normalizedCpf,
                birth_date: birth_date || null,
                phone: normalizeText(phone),
                whatsapp: normalizeText(whatsapp),
                cep: normalizeDigits(cep),
                street: normalizeText(street),
                number: normalizeText(number),
                complement: normalizeText(complement),
                neighborhood: normalizeText(neighborhood),
                city: normalizeText(city),
                state: normalizeText(state)?.toUpperCase() || null,
                address_reference: normalizeText(address_reference),
                google_id,
                avatar_path,
                admin: false,
            });

            return res.status(201).json(formatUser(user));
        } catch (error) {
            return sendServerError(res, 'Erro ao cadastrar usuário.', error);
        }
    }

    async show(req, res) {
        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.status(200).json(formatUser(user));
        } catch (error) {
            return sendServerError(res, 'Erro ao buscar usuário autenticado.', error);
        }
    }

    async update(req, res) {
        const Schema = Yup.object({
            name: Yup.string().trim().min(3).max(120),
            email: Yup.string().trim().email(),
            birth_date: Yup.string().nullable(),
            phone: Yup.string().nullable(),
            whatsapp: Yup.string().nullable(),
            cep: Yup.string().nullable(),
            street: Yup.string().nullable(),
            number: Yup.string().nullable(),
            complement: Yup.string().nullable(),
            neighborhood: Yup.string().nullable(),
            city: Yup.string().nullable(),
            state: Yup.string().nullable().max(2),
            address_reference: Yup.string().nullable(),
        }).noUnknown(true);

        try {
            Schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (err) {
            return res.status(400).json({ error: err.errors });
        }

        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const updatePayload = {
                ...req.body,
                name: req.body.name == null ? undefined : normalizeText(req.body.name),
                email: req.body.email == null ? undefined : normalizeEmail(req.body.email),
                phone: req.body.phone == null ? undefined : normalizeText(req.body.phone),
                whatsapp: req.body.whatsapp == null ? undefined : normalizeText(req.body.whatsapp),
                cep: req.body.cep == null ? undefined : normalizeDigits(req.body.cep),
                street: req.body.street == null ? undefined : normalizeText(req.body.street),
                number: req.body.number == null ? undefined : normalizeText(req.body.number),
                complement: req.body.complement == null ? undefined : normalizeText(req.body.complement),
                neighborhood: req.body.neighborhood == null ? undefined : normalizeText(req.body.neighborhood),
                city: req.body.city == null ? undefined : normalizeText(req.body.city),
                state: req.body.state == null ? undefined : normalizeText(req.body.state)?.toUpperCase() || null,
                address_reference: req.body.address_reference == null ? undefined : normalizeText(req.body.address_reference),
                birth_date: req.body.birth_date || null,
            };

            if (updatePayload.email && updatePayload.email !== user.email) {
                const emailExists = await User.findOne({ where: { email: updatePayload.email } });

                if (emailExists) {
                    return res.status(409).json({ error: 'E-mail já cadastrado.' });
                }
            }

            await user.update(updatePayload);

            return res.status(200).json(formatUser(user));
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar usuário.', error);
        }
    }

    async changePassword(req, res) {
        const Schema = Yup.object({
            current_password: Yup.string().required(),
            new_password: Yup.string().min(6).required(),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('new_password')], 'A confirmação da nova senha não confere.')
                .required(),
        }).noUnknown(true);

        try {
            Schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (err) {
            return res.status(400).json({ error: err.errors });
        }

        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const senhaAtualCorreta = await bcrypt.compare(req.body.current_password, user.password_hash || '');

            if (!senhaAtualCorreta) {
                return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
            }

            const novaSenhaIgualAtual = await bcrypt.compare(req.body.new_password, user.password_hash || '');

            if (novaSenhaIgualAtual) {
                return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual.' });
            }

            const password_hash = await bcrypt.hash(req.body.new_password, 10);

            await user.update({ password_hash });

            return res.status(200).json({ message: 'Senha atualizada com sucesso.' });
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar senha do usuário.', error);
        }
    }

    async indexAdmin(req, res) {
        try {
            const users = await User.findAll({
                order: [['created_at', 'DESC']],
            });

            return res.status(200).json(users.map(formatUser));
        } catch (error) {
            return sendServerError(res, 'Erro ao listar usuários.', error);
        }
    }

    async updateAdmin(req, res) {
        const Schema = Yup.object({
            name: Yup.string().trim().min(3).max(120),
            email: Yup.string().trim().email(),
            phone: Yup.string().nullable(),
            whatsapp: Yup.string().nullable(),
            city: Yup.string().nullable(),
            state: Yup.string().nullable().max(2),
            admin: Yup.boolean(),
            is_active: Yup.boolean(),
        }).noUnknown(true);

        try {
            Schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (err) {
            return res.status(400).json({ error: err.errors });
        }

        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const updatePayload = {
                ...req.body,
                name: req.body.name == null ? undefined : normalizeText(req.body.name),
                email: req.body.email == null ? undefined : normalizeEmail(req.body.email),
                phone: req.body.phone == null ? undefined : normalizeText(req.body.phone),
                whatsapp: req.body.whatsapp == null ? undefined : normalizeText(req.body.whatsapp),
                city: req.body.city == null ? undefined : normalizeText(req.body.city),
                state: req.body.state == null ? undefined : normalizeText(req.body.state)?.toUpperCase() || null,
            };

            if (updatePayload.email && updatePayload.email !== user.email) {
                const emailExists = await User.findOne({ where: { email: updatePayload.email } });

                if (emailExists && emailExists.id !== user.id) {
                    return res.status(409).json({ error: 'E-mail já cadastrado.' });
                }
            }

            await user.update(updatePayload);

            return res.status(200).json(formatUser(user));
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar usuário.', error);
        }
    }

    async destroyAdmin(req, res) {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (Number(req.userId) === Number(user.id)) {
                return res.status(400).json({ error: 'Você não pode excluir sua própria conta administrativa.' });
            }

            await user.destroy();

            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir usuário.', error);
        }
    }
}

export default new UserController();
