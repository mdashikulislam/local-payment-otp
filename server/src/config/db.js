const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./env');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender VARCHAR(255) NOT NULL,
        message TEXT,
        otp VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [existingAdmin] = await connection.execute(
      'SELECT id FROM admins WHERE username = ?',
      ['ashiksumon']
    );

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('Sumon11224411@@', 12);
      await connection.execute(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['ashiksumon', passwordHash]
      );
      console.log('Default admin user created: ashiksumon');
    }

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};

module.exports = { pool, initDatabase };
