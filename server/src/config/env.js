const config = {
  PORT: 4050,
  JWT_SECRET: 'your-very-secure-secret-here', // Change this to your actual secret
  CORS_ORIGIN: 'https://your-cloudflare-domain.com', // Update this to your production domain
  COOKIE_NAME: 'token',
  JWT_EXPIRES_IN: '1h',
  DB_HOST: '127.0.0.1', // Use 127.0.0.1 instead of localhost for better stability on macOS
  DB_USER: 'root',
  DB_PASSWORD: '', // Ensure this matches your local MySQL password
  DB_NAME: 'otp_db',
  DB_PORT: 3306,
};

module.exports = config;

