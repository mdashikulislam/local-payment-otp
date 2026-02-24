const express = require('express');
const router = express.Router();
router.post('/get-otp', (req, res) => {
    const sender = req.body.sender;
    const message = req.body.message;
    return res.json({ otp: '123456' });
});

module.exports = router;
