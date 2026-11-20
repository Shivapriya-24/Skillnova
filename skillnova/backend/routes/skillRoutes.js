const express = require('express');
const multer = require('multer');
const path = require('path');
const { saveSkillProfile, getSkillProfile, getAllSkillProfiles } = require('../controllers/skillController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.get('/get', getSkillProfile); 
router.get('/all',getAllSkillProfiles);
router.post('/save', upload.array('proofs'), saveSkillProfile);


module.exports = router;
