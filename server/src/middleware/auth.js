const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        return res.status(403).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

module.exports = { authenticateToken };
