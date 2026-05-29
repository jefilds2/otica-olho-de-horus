import { mkdir, unlink } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

export const UPLOADS_ROOT_DIR = resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
export const PRODUCT_UPLOADS_SUBDIR = 'products';
export const CATEGORY_UPLOADS_SUBDIR = 'categories';

const normalizeSlashes = (value) => String(value || '').replace(/\\/g, '/');

export function normalizeStoredUploadPath(value) {
    const normalized = normalizeSlashes(String(value || '').trim()).replace(/^\/+/, '');
    if (!normalized) {
        return '';
    }

    if (normalized.startsWith('uploads/')) {
        return normalized.slice('uploads/'.length);
    }

    return normalized;
}

export function buildStoredUploadPath(subdir, filename) {
    const safeSubdir = normalizeStoredUploadPath(subdir).replace(/\/+$/, '');
    const safeFilename = String(filename || '').trim().replace(/^\/+/, '');

    return [safeSubdir, safeFilename].filter(Boolean).join('/');
}

export function buildStoredUploadPathFromFile(file) {
    if (!file?.filename) {
        return '';
    }

    const relativeDir = normalizeSlashes(relative(UPLOADS_ROOT_DIR, file.destination || ''));
    const normalizedDir = relativeDir === '' || relativeDir === '.'
        ? ''
        : relativeDir;

    return buildStoredUploadPath(normalizedDir, file.filename);
}

export function resolveStoredUploadAbsolutePath(storedPath) {
    const normalized = normalizeStoredUploadPath(storedPath);
    return normalized ? resolve(UPLOADS_ROOT_DIR, normalized) : '';
}

export async function ensureUploadsStructure() {
    await Promise.all([
        mkdir(resolve(UPLOADS_ROOT_DIR, PRODUCT_UPLOADS_SUBDIR), { recursive: true }),
        mkdir(resolve(UPLOADS_ROOT_DIR, CATEGORY_UPLOADS_SUBDIR), { recursive: true }),
    ]);
}

export async function deleteStoredUploads(paths = []) {
    const uniquePaths = [...new Set(
        (Array.isArray(paths) ? paths : [paths])
            .map((item) => normalizeStoredUploadPath(item))
            .filter(Boolean),
    )];

    await Promise.all(uniquePaths.map(async (storedPath) => {
        const absolutePath = resolveStoredUploadAbsolutePath(storedPath);
        if (!absolutePath) {
            return;
        }

        try {
            await unlink(absolutePath);
        } catch (error) {
            if (error?.code !== 'ENOENT') {
                console.error(`Falha ao remover arquivo de upload: ${storedPath}`, error);
            }
        }
    }));
}

export function collectRequestUploadPaths(req) {
    const files = [
        ...(Array.isArray(req?.files) ? req.files : []),
        ...(req?.file ? [req.file] : []),
    ];

    return files
        .map((file) => buildStoredUploadPathFromFile(file))
        .filter(Boolean);
}
