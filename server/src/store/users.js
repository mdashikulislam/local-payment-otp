const bcrypt = require('bcryptjs');

const users = new Map();
let idCounter = 1;

const sanitize = (user) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  if (users.has(normalizedEmail)) {
    const error = new Error('User already exists');
    error.code = 'USER_EXISTS';
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: idCounter++, name: name.trim(), email: normalizedEmail, passwordHash };
  users.set(normalizedEmail, user);
  return sanitize(user);
}

async function verifyCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? sanitize(user) : null;
}

function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return sanitize(users.get(normalizedEmail));
}

function listUsers() {
  return Array.from(users.values()).map(sanitize);
}

function ensureSeedUser() {
  if (users.size === 0) {
    const passwordHash = bcrypt.hashSync('password', 10);
    const user = { id: idCounter++, name: 'Demo User', email: 'demo@example.com', passwordHash };
    users.set(user.email, user);
  }
}

module.exports = {
  createUser,
  verifyCredentials,
  getUserByEmail,
  listUsers,
  ensureSeedUser,
};

