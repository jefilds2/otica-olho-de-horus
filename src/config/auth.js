const jwtSecret = String(process.env.JWT_SECRET || '').trim();

if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
}

export default {
    secret: jwtSecret,
    expiresIn: '7d',
};
