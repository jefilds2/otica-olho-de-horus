const multer = require("multer");
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

module.exports = {
    storage: multer.diskStorage({
        destination: resolve(__dirname, "..", "..", "uploads"),
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
