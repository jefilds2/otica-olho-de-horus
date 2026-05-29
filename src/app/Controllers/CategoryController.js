import * as Yup from 'yup';
import { literal } from 'sequelize';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendServerError } from '../../utils/http.js';
import { collectRequestUploadPaths, deleteStoredUploads, buildStoredUploadPathFromFile, normalizeStoredUploadPath } from '../../utils/uploadStorage.js';

const normalizeText = (value) => value == null ? null : String(value).trim();
const parseStoredProductImagePaths = (product) => {
    if (!product) return [];

    try {
        const parsed = product.image_paths ? JSON.parse(product.image_paths) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => normalizeStoredUploadPath(item)).filter(Boolean);
        }
    } catch {
        // Mantém compatibilidade com registros antigos.
    }

    return product.path ? [normalizeStoredUploadPath(product.path)] : [];
};

class CategoryController {
    async index(req, res) {
        try {
            const categories = await Category.findAll({
                order: literal('`Category`.`created_at` DESC'),
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
            await deleteStoredUploads(collectRequestUploadPaths(req));
            return res.status(400).json({ error: error.errors || ['Dados da categoria inválidos'] });
        }

        try {
            const { slug } = req.body;

            const categoryExists = await Category.findOne({ where: { slug } });

            if (categoryExists) {
                await deleteStoredUploads(collectRequestUploadPaths(req));
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            const path = buildStoredUploadPathFromFile(req.file);

            const category = await Category.create({
                ...req.body,
                name: normalizeText(req.body.name),
                slug: normalizeText(req.body.slug),
                path,
            });

            return res.status(201).json(category);
        } catch (error) {
            await deleteStoredUploads(collectRequestUploadPaths(req));
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
            await deleteStoredUploads(collectRequestUploadPaths(req));
            return res.status(400).json({ error: error.errors || ['Dados da categoria inválidos'] });
        }

        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                await deleteStoredUploads(collectRequestUploadPaths(req));
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            const { slug } = req.body;
            const categoryExists = await Category.findOne({ where: { slug } });

            if (categoryExists && categoryExists.id !== category.id) {
                await deleteStoredUploads(collectRequestUploadPaths(req));
                return res.status(400).json({ error: 'Slug já está em uso' });
            }

            const nextPath = buildStoredUploadPathFromFile(req.file) || normalizeStoredUploadPath(category.path);
            const oldPath = normalizeStoredUploadPath(category.path);
            await category.update({
                name: normalizeText(req.body.name),
                slug: normalizeText(req.body.slug),
                path: nextPath,
            });

            if (nextPath && oldPath && nextPath !== oldPath) {
                await deleteStoredUploads([oldPath]);
            }
            return res.status(200).json(category);
        } catch (error) {
            await deleteStoredUploads(collectRequestUploadPaths(req));
            return sendServerError(res, 'Erro ao atualizar categoria', error);
        }
    }

    async destroy(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            const linkedProducts = await Product.findAll({ where: { category_id: category.id } });
            const imagePathsToDelete = [
                normalizeStoredUploadPath(category.path),
                ...linkedProducts.flatMap((product) => parseStoredProductImagePaths(product)),
            ].filter(Boolean);

            if (linkedProducts.length > 0) {
                await Product.destroy({ where: { category_id: category.id } });
            }

            await category.destroy();
            await deleteStoredUploads(imagePathsToDelete);

            return res.status(204).send();
        } catch (error) {
            return sendServerError(res, 'Erro ao excluir categoria', error);
        }
    }
}

export default new CategoryController();
