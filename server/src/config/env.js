const dotenv = require('dotenv');
dotenv.config();
const config = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  COOKIE_NAME: process.env.COOKIE_NAME || 'token',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'otp_db',
  DB_PORT: process.env.DB_PORT || 3306,
};
module.exports = config;

