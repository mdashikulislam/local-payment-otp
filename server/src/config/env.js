const dotenv = require('dotenv');
dotenv.config();
const config = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  COOKIE_NAME: process.env.COOKIE_NAME || 'token',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};
module.exports = config;

