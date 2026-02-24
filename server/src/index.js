const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const userRoutes = require('./routes/users');
const { ensureSeedUser } = require('./store/users');
ensureSeedUser();
const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});

