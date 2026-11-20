const express = require('express');
const router = express.Router();
const { getProfile, saveProfile, updateProfile } = require('../controllers/profileController');

router.get('/', getProfile);
router.post('/', saveProfile);
router.put('/', updateProfile);

module.exports = router;
