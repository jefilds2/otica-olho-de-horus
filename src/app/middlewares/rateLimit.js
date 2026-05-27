import { getClientIp } from "../../utils/http.js";

const requestsByKey = new Map();

const removeExpiredEntries = (currentTime) => {
    for (const [key, value] of requestsByKey.entries()) {
        if (value.expiresAt <= currentTime) {
            requestsByKey.delete(key);
        }
    }
};

const createRateLimit = ({
    windowMs,
    maxRequests,
    message,
}) => {
    return (req, res, next) => {
        const currentTime = Date.now();
        removeExpiredEntries(currentTime);

        const key = `${getClientIp(req)}:${req.baseUrl || ''}:${req.path}`;
        const currentEntry = requestsByKey.get(key);

        if (!currentEntry || currentEntry.expiresAt <= currentTime) {
            requestsByKey.set(key, {
                count: 1,
                expiresAt: currentTime + windowMs,
            });

            return next();
        }

        if (currentEntry.count >= maxRequests) {
            return res.status(429).json({ error: message });
        }

        currentEntry.count += 1;
        requestsByKey.set(key, currentEntry);

        return next();
    };
};

export const authRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
});

export const writeRateLimit = createRateLimit({
    windowMs: 5 * 60 * 1000,
    maxRequests: 60,
    message: 'Muitas requisições de escrita. Tente novamente em instantes.',
});
