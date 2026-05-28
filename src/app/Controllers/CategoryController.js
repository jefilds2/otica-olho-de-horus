import * as Yup from 'yup';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendServerError } from '../../utils/http.js';

const normalizeText = (value) => value == null ? null : String(value).trim();

class CategoryController {
    async index(req, res) {
        try {
            const categories = await Category.findAll({
                order: [['created_at', 'DESC']],
                attributes: ['id', 'name', 'slug', 'path', 'createdAt', 'updatedAt'],
            });

            return res.status(200).json(categories);
        } catch (error) {
            return sendServerError(res, 'Erro ao listar categorias', error);
        }
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().trim().required().min(3).max(255),
            slug: Yup.string().required().matches(/^[a-z0-9-]+$/),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados da categoria inválidos'] });
        }

        try {
            const { slug } = req.body;

            const categoryExists = await Category.findOne({ where: { slug } });

            if (categoryExists) {
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            const path = req.file?.filename;

            const category = await Category.create({
                ...req.body,
                name: normalizeText(req.body.name),
                slug: normalizeText(req.body.slug),
                path,
            });

            return res.status(201).json(category);
        } catch (error) {
            return sendServerError(res, 'Erro ao cadastrar categoria', error);
        }
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().trim().required().min(3).max(255),
            slug: Yup.string().required().matches(/^[a-z0-9-]+$/),
        }).noUnknown(true);

        try {
            schema.validateSync(req.body, { abortEarly: false, strict: true });
        } catch (error) {
            return res.status(400).json({ error: error.errors || ['Dados da categoria inválidos'] });
        }

        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            const { slug } = req.body;
            const categoryExists = await Category.findOne({ where: { slug } });

            if (categoryExists && categoryExists.id !== category.id) {
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            await category.update({
                name: normalizeText(req.body.name),
                slug: normalizeText(req.body.slug),
                path: req.file?.filename || category.path,
            });

            return res.status(200).json(category);
        } catch (error) {
            return sendServerError(res, 'Erro ao atualizar categoria', error);
        }
    }

    async destroy(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            const linkedProducts = await Product.count({ where: { category_id: category.id } });

            if (linkedProducts > 0) {
                return res.status(400).json({ error: 'Remova ou mova os produtos desta categoria antes de excluí-la' });
            }

            await category.destroy();

            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir categoria', error);
        }
    }
}

export default new CategoryController();
