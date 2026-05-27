import User from '../models/User.js';

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'admin', 'is_active'],
        });

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Usuário inválido ou inativo.' });
        }

        if (!user.admin) {
            return res.status(403).json({ error: 'Acesso permitido apenas para administradores.' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao validar permissão administrativa.' });
    }
};

export default adminMiddleware;
