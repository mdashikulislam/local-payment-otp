const config = {
    PORT: 4050,
    JWT_SECRET: 'OTP-Secure-JWT-Key-2024-Local-Development-Only-Change-For-Production',
    CORS_ORIGIN: 'http://localhost:5173',
    COOKIE_NAME: 'token',
    JWT_EXPIRES_IN: '1h',
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_NAME: 'otp_db',
    DB_PORT: 3306,
};

module.exports = config;

