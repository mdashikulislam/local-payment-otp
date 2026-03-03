const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

function extractOTP(message) {
    if (!message) return null;

    // Normalize message
    const text = message.replace(/\s+/g, ' ').trim();

    const patterns = [
        // bKash
        { regex: /verification code is\s*(\d{6})/i },

        // Nagad ECOM
        { regex: /OTP\s*for\s*Nagad.*?\b(\d{6})\b/i },

        // Debit/Credit Card e-com
        { regex: /is your OTP for e-?com transaction.*?\b(\d{6})\b/i },

        // Generic "XXXX is your OTP"
        { regex: /\b(\d{4,6})\b\s*is your (?:One-Time-Password|OTP)/i },

        // "Your OTP is: XXXX"
        { regex: /Your OTP\s*(?:is|:)\s*(\d{4,6})/i },

        // IVACBD specific
        { regex: /use OTP[:\s]*\s*(\d{4,6})/i },

        // Rocket
        { regex: /security code.*?\b(\d{6})\b/i },

        // Fallback: number near OTP word
        { regex: /(?:OTP|One-Time-Password|verification code).*?\b(\d{4,6})\b/i },

        // Reverse fallback: number before OTP word
        { regex: /\b(\d{4,6})\b.*?(?:OTP|One-Time-Password|verification code)/i }
    ];

    for (const { regex } of patterns) {
        const match = text.match(regex);
        if (match) {
            return match[1];
        }
    }

    return null; // Avoid unsafe generic fallback
}

// Public: Receive OTP from external sources
router.post('/get-otp', async (req, res) => {
    try {
        const { sender, message, device } = req.body;
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
            'INSERT INTO otps (sender, message, otp, device) VALUES (?, ?, ?, ?)',
            [sender.trim(), message.trim(), otp, device ? device.trim() : null]
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

// Protected: Get all OTPs
router.get('/otps', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, sender, message, otp, device, created_at FROM otps ORDER BY created_at DESC LIMIT 50'
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

// Protected: Delete all OTPs
router.delete('/otps', authenticateToken, async (req, res) => {
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

module.exports = router;