import multer from "multer";
import { isProduction } from "../../utils/http.js";

const errorHandler = (error, _req, res, _next) => {
    if (!error) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: `Falha no upload: ${error.message}` });
    }

    if (error.name === 'SyntaxError' && error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido na requisição.' });
    }

    console.error('Unhandled application error', error);

    return res.status(500).json({
        error: 'Erro interno do servidor.',
        ...(isProduction ? {} : { details: error.message }),
    });
};

export default errorHandler;
