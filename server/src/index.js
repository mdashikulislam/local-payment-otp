const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const http = require("https");
const { Server } = require("socket.io");
const fs = require('fs');
const path = require("path");

const API_PREFIX = '/api';
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());

const options = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "118.179.76.17-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "118.179.76.17.pem")),
};
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
});
console.log('ashik');
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

