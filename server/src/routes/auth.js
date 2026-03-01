const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const config = require('../config/env');
const { rateLimitLogin, recordFailedAttempt, resetAttempts } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const SALT_ROUNDS = 12;

const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }
    if (username.length < 3 || username.length > 50) {
        return { valid: false, error: 'Username must be between 3 and 50 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters long' };
    }
    if (password.length > 128) {
        return { valid: false, error: 'Password must not exceed 128 characters' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, error: 'Password must contain at least one digit' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    return { valid: true };
};

router.post('/login', rateLimitLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({
                success: false,
                error: usernameValidation.error
            });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.error
            });
        }

        const sanitizedUsername = username.trim().toLowerCase();

        const [rows] = await pool.execute(
            'SELECT id, username, password_hash FROM admins WHERE username = ?',
            [sanitizedUsername]
        );

        if (rows.length === 0) {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            recordFailedAttempt(ip);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const admin = rows[0];
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);

        if (!isValidPassword) {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            recordFailedAttempt(ip);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        resetAttempts(ip);

        const token = jwt.sign(
            {
                adminId: admin.id,
                username: admin.username
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRES_IN,
                issuer: 'otp-dashboard',
                audience: 'otp-dashboard-client'
            }
        );

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.post('/verify', authenticateToken, (req, res) => {
    return res.json({
        success: true,
        admin: req.admin
    });
});

router.post('/setup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({
                success: false,
                error: usernameValidation.error
            });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.error
            });
        }

        const sanitizedUsername = username.trim().toLowerCase();

        const [existing] = await pool.execute(
            'SELECT id FROM admins WHERE username = ?',
            [sanitizedUsername]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Username already exists'
            });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await pool.execute(
            'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
            [sanitizedUsername, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: 'Admin account created successfully'
        });

    } catch (error) {
        console.error('Setup error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
