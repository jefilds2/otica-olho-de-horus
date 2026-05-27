export const isProduction = process.env.NODE_ENV === 'production';

export const sendServerError = (res, publicMessage, error) => {
    console.error(publicMessage, error);

    return res.status(500).json({
        error: publicMessage,
        ...(isProduction ? {} : { details: error.message }),
    });
};

export const getClientIp = (req) => {
    return req.ip || req.socket?.remoteAddress || 'unknown';
};
