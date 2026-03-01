const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const API_PREFIX = '/api';
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Public routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}`, otpRoutes);

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

