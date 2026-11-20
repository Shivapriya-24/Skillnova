const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!email || !message) return res.status(400).json({ error: 'Email & message required' });

    const newMsg = await Contact.create({ name, email, phone, message });
    res.json({ success: true, data: newMsg });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
