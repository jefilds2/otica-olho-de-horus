import * as Yup from 'yup';
import { Op, literal } from 'sequelize';
import Address from '../models/Address.js';
import User from '../models/User.js';
import { sendServerError } from '../../utils/http.js';

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');
const normalizeText = (value) => value == null ? null : String(value).trim();

function formatAddress(address) {
    return {
        id: address.id,
        user_id: address.user_id,
        label: address.label,
        recipient_name: address.recipient_name,
        phone: address.phone,
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        reference: address.reference,
        is_default: address.is_default,
        created_at: address.createdAt,
        updated_at: address.updatedAt,
    };
}

async function unsetDefaultAddresses(userId, excludeId = null) {
    const where = excludeId
        ? { user_id: userId, is_default: true, id: { [Op.ne]: excludeId } }
        : { user_id: userId, is_default: true };

    await Address.update({ is_default: false }, { where });
}

async function ensureLegacyAddress(userId) {
    const addressesCount = await Address.count({ where: { user_id: userId } });

    if (addressesCount > 0) {
        return;
    }

    const user = await User.findByPk(userId);

    if (!user || !user.cep || !user.street || !user.number || !user.neighborhood || !user.city || !user.state) {
        return;
    }

    await Address.create({
        user_id: user.id,
        label: 'Endereço principal',
        recipient_name: user.name,
        phone: user.phone || user.whatsapp || null,
        cep: user.cep,
        street: user.street,
        number: user.number,
        complement: user.complement,
        neighborhood: user.neighborhood,
        city: user.city,
        state: user.state,
        reference: user.address_reference,
        is_default: true,
    });
}

class AddressController {
    async index(req, res) {
        try {
            await ensureLegacyAddress(req.userId);

            const addresses = await Address.findAll({
                where: { user_id: req.userId },
                order: [literal('`Address`.`is_default` DESC'), literal('`Address`.`created_at` DESC')],
            });

            return res.status(200).json(addresses.map(formatAddress));
        } catch (error) {
            return sendServerError(res, 'Erro ao listar endereços.', error);
        }
    }

    async store(req, res) {
        const schema = Yup.object({
            label: Yup.string().trim().required().min(2).max(80),
            recipient_name: Yup.string().trim().required().min(3).max(120),
            phone: Yup.string().nullable(),
            cep: Yup.string().required(),
            street: Yup.string().trim().required().min(3),
            number: Yup.string().trim().required().max(20),
            complement: Yup.string().nullable(),
            neighborhood: Yup.string().trim().required().min(2),
            city: Yup.string().trim().required().min(2),
            state: Yup.string().trim().required().length(2),
            reference: Yup.string().nullable(),
            is_default: Yup.boolean().default(false),
        }).noUnknown(true);

        try {
            await schema.validate(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados de endereço inválidos.'] });
        }

        try {
            const shouldBeDefault = Boolean(req.body.is_default) || (await Address.count({ where: { user_id: req.userId } })) === 0;

            if (shouldBeDefault) {
                await unsetDefaultAddresses(req.userId);
            }

            const address = await Address.create({
                user_id: req.userId,
                label: normalizeText(req.body.label),
                recipient_name: normalizeText(req.body.recipient_name),
                phone: normalizeText(req.body.phone),
                cep: normalizeDigits(req.body.cep),
                street: normalizeText(req.body.street),
                number: normalizeText(req.body.number),
                complement: normalizeText(req.body.complement),
                neighborhood: normalizeText(req.body.neighborhood),
                city: normalizeText(req.body.city),
                state: normalizeText(req.body.state)?.toUpperCase(),
                reference: normalizeText(req.body.reference),
                is_default: shouldBeDefault,
            });

            return res.status(201).json(formatAddress(address));
        } catch (error) {
            return sendServerError(res, 'Erro ao cadastrar endereço.', error);
        }
    }

    async update(req, res) {
        const schema = Yup.object({
            label: Yup.string().trim().required().min(2).max(80),
            recipient_name: Yup.string().trim().required().min(3).max(120),
            phone: Yup.string().nullable(),
            cep: Yup.string().required(),
            street: Yup.string().trim().required().min(3),
            number: Yup.string().trim().required().max(20),
            complement: Yup.string().nullable(),
            neighborhood: Yup.string().trim().required().min(2),
            city: Yup.string().trim().required().min(2),
            state: Yup.string().trim().required().length(2),
            reference: Yup.string().nullable(),
            is_default: Yup.boolean().default(false),
        }).noUnknown(true);

        try {
            await schema.validate(req.body, { abortEarly: false });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados de endereço inválidos.'] });
        }

        try {
            const address = await Address.findOne({
                where: { id: req.params.id, user_id: req.userId },
            });

            if (!address) {
                return res.status(404).json({ error: 'Endereço não encontrado.' });
            }

            const shouldBeDefault = Boolean(req.body.is_default);

            if (shouldBeDefault) {
                await unsetDefaultAddresses(req.userId, address.id);
            }

            await address.update({
                label: normalizeText(req.body.label),
                recipient_name: normalizeText(req.body.recipient_name),
                phone: normalizeText(req.body.phone),
                cep: normalizeDigits(req.body.cep),
                street: normalizeText(req.body.street),
                number: normalizeText(req.body.number),
                complement: normalizeText(req.body.complement),
                neighborhood: normalizeText(req.body.neighborhood),
                city: normalizeText(req.body.city),
                state: normalizeText(req.body.state)?.toUpperCase(),
                reference: normalizeText(req.body.reference),
                is_default: shouldBeDefault || address.is_default,
            });

            return res.status(200).json(formatAddress(address));
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar endereço.', error);
        }
    }

    async destroy(req, res) {
        try {
            const address = await Address.findOne({
                where: { id: req.params.id, user_id: req.userId },
            });

            if (!address) {
                return res.status(404).json({ error: 'Endereço não encontrado.' });
            }

            const wasDefault = address.is_default;
            await address.destroy();

            if (wasDefault) {
                const nextAddress = await Address.findOne({
                    where: { user_id: req.userId },
                    order: literal('`Address`.`created_at` DESC'),
                });

                if (nextAddress) {
                    await nextAddress.update({ is_default: true });
                }
            }

            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir endereço.', error);
        }
    }
}

export default new AddressController();
