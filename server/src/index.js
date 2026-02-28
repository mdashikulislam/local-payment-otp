const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initDatabase } = require('./config/db');
const { pool } = require('./config/db');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const http = require("http");
const { Server } = require("socket.io");
const API_PREFIX = '/api';
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
// Public routes
app.use(`${API_PREFIX}/auth`, authRoutes);

const options = {};

const server = http.createServer(options,app);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket"],
    allowUpgrades: false,
    pingInterval: 20000,
    pingTimeout: 60000,
    connectTimeout: 10000
});

io.on("connection", (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Public: Receive OTP from external sources
app.post(`${API_PREFIX}/get-otp`, async (req, res) => {
    console.log('otp route called with body:', req.body);
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
                if (match) return match[1];
            }
            const genericMatch = message.match(/\b(\d{4,6})\b/);
            if (genericMatch) return genericMatch[1];
            return null;
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

// Protected routes
app.get(`${API_PREFIX}/otps`, authenticateToken, async (req, res) => {
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

app.delete(`${API_PREFIX}/otps`, authenticateToken, async (req, res) => {
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
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(config.PORT, () => {
      console.log(`API listening on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

