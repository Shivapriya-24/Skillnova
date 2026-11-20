const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const Achievement = require('../models/Achievement'); 

router.get('/public/:email/:key', async (req, res) => {
  try {
    const { email, key } = req.params;
    const badge = await Achievement.findOne({ userEmail: email, key });
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      earnedAt: badge.earnedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:email', achievementController.getAchievements);

router.post('/calculate/:email', achievementController.calculateAchievements);



module.exports = router;