const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/otps', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, sender, message, otp, created_at FROM otps ORDER BY created_at DESC LIMIT 50'
        );
        return res.json({
            success: true,
            otps: rows
        });
    } catch (error) {
        console.error('Error fetching OTPs:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while fetching OTPs'
        });
    }
});

function extractOTP(message) {
    const patterns = [
        { regex: /verification code is (\d{6})/i, type: 'bKash' },
        { regex: /OTP for Nagad.*is (\d{6})/i, type: 'Nagad' },
        { regex: /OTP for e-com transaction.*(\d{6})/i, type: 'Card' },
        { regex: /One-Time-Password \(OTP\).*?(\d{6})/i, type: 'Generic' },
        { regex: /Your OTP is: (\d{4,6})/i, type: 'Card Transaction' },
        { regex: /\b(\d{6})\b.*(?:OTP|One-Time-Password|verification code)/i, type: 'Fallback' },
        { regex: /(?:OTP|One-Time-Password).*?\b(\d{4,6})\b/i, type: 'Fallback2' }
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern.regex);
        if (match) {
            return match[1];
        }
    }

    const genericMatch = message.match(/\b(\d{4,6})\b/);
    if (genericMatch) {
        return genericMatch[1];
    }

    return null;
}

router.delete('/otps', async (req, res) => {
    try {
        await pool.execute('DELETE FROM otps');
        return res.json({
            success: true,
            message: 'All OTP messages deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting OTPs:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while deleting OTPs'
        });
    }
});

router.post('/get-otp', async (req, res) => {
    try {
        const { sender, message } = req.body;
        if (!sender || typeof sender !== 'string' || sender.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'sender is required'
            });
        }

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'message is required'
            });
        }

        const otp = extractOTP(message);

        if (!otp) {
            return res.status(400).json({
                success: false,
                error: 'Could not extract OTP from message'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO otps (sender, message, otp) VALUES (?, ?, ?)',
            [sender.trim(), message.trim(), otp]
        );

        return res.status(201).json({
            success: true,
            otp: otp,
            id: result.insertId,
            message: 'OTP stored successfully'
        });

    } catch (error) {
        console.error('Error storing OTP:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while storing OTP'
        });
    }
});

module.exports = router;
