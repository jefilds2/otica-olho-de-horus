import jwt from "jsonwebtoken";
import authConfig from "../../config/auth.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não informado.' });
    }

    const token = authToken.split(' ')[1];

    try {
        const decoded = jwt.verify(token, authConfig.secret);
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'is_active'],
        });

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Usuário inválido ou inativo.' });
        }

        req.userId = decoded.id;
    } catch (_error) {
        return res.status(401).json({ error: 'Token inválido.' });
    }

    return next();
};

export default authMiddleware;
