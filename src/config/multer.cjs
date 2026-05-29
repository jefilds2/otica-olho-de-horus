const multer = require("multer");
const { existsSync, mkdirSync } = require("node:fs");
const { extname, resolve } = require("node:path");
const { v4 } = require("uuid");

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
]);

const allowedExtensions = new Set([
    ".jpg",
    ".jpeg",
    ".png",
]);

const projectRootDir = resolve(__dirname, "..", "..");
const siblingPublicUploadsDir = resolve(projectRootDir, "..", "public_html", "uploads");

function resolveUploadsRootDir() {
    const configuredDir = String(process.env.UPLOADS_DIR || "").trim();
    if (configuredDir) {
        return resolve(projectRootDir, configuredDir);
    }

    if (existsSync(siblingPublicUploadsDir)) {
        return siblingPublicUploadsDir;
    }

    return resolve(projectRootDir, "uploads");
}

const uploadsRootDir = resolveUploadsRootDir();

function resolveUploadDestination(file) {
    const subdir = file.fieldname === "files" ? "products" : "categories";
    const destination = resolve(uploadsRootDir, subdir);
    mkdirSync(destination, { recursive: true });
    return destination;
}

module.exports = {
    storage: multer.diskStorage({
        destination: (_req, file, cb) => {
            try {
                return cb(null, resolveUploadDestination(file));
            } catch (error) {
                return cb(error);
            }
        },
        filename: (_req, file, cb) => {
            const extension = extname(file.originalname || "").toLowerCase();
            if (!allowedExtensions.has(extension)) {
                return cb(new Error("Extensão de arquivo inválida. Envie JPG ou PNG."));
            }
            const uniqueName = `${v4()}${extension}`;
            return cb(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new Error("Tipo de arquivo inválido. Envie JPG ou PNG."));
        }

        return cb(null, true);
    },
};
