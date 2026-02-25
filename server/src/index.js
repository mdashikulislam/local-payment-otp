const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initDatabase } = require('./config/db');
const otpRoute = require('./routes/otp');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const API_PREFIX = '/api';
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/get-otp`, otpRoute);
app.use(`${API_PREFIX}`, authenticateToken, otpRoute);
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

