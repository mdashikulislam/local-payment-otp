const loginAttempts = new Map();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

const rateLimitLogin = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const attemptData = loginAttempts.get(ip);

    if (attemptData) {
        if (attemptData.blockedUntil && now < attemptData.blockedUntil) {
            const remainingTime = Math.ceil((attemptData.blockedUntil - now) / 1000 / 60);
            return res.status(429).json({
                success: false,
                error: `Too many failed attempts. Please try again in ${remainingTime} minutes.`
            });
        }

        if (now - attemptData.firstAttempt > WINDOW_MS) {
            loginAttempts.set(ip, {
                count: 1,
                firstAttempt: now,
                blockedUntil: null
            });
        }
    }

    next();
};

const recordFailedAttempt = (ip) => {
    const now = Date.now();
    const attemptData = loginAttempts.get(ip);

    if (!attemptData || now - attemptData.firstAttempt > WINDOW_MS) {
        loginAttempts.set(ip, {
            count: 1,
            firstAttempt: now,
            blockedUntil: null
        });
    } else {
        const newCount = attemptData.count + 1;
        if (newCount >= MAX_ATTEMPTS) {
            loginAttempts.set(ip, {
                count: newCount,
                firstAttempt: attemptData.firstAttempt,
                blockedUntil: now + BLOCK_DURATION_MS
            });
        } else {
            loginAttempts.set(ip, {
                count: newCount,
                firstAttempt: attemptData.firstAttempt,
                blockedUntil: null
            });
        }
    }
};

const resetAttempts = (ip) => {
    loginAttempts.delete(ip);
};

const cleanupOldAttempts = () => {
    const now = Date.now();
    for (const [ip, data] of loginAttempts.entries()) {
        if (data.blockedUntil && now > data.blockedUntil + WINDOW_MS) {
            loginAttempts.delete(ip);
        } else if (!data.blockedUntil && now - data.firstAttempt > WINDOW_MS) {
            loginAttempts.delete(ip);
        }
    }
};

setInterval(cleanupOldAttempts, 5 * 60 * 1000);

module.exports = { rateLimitLogin, recordFailedAttempt, resetAttempts };
