const express = require('express');
const { listUsers } = require('../store/users');

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ users: listUsers() });
});

module.exports = router;

