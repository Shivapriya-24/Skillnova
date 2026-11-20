const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'collaborations');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${path.extname(file.originalname)}`;
    cb(null, safe);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); 

module.exports = upload;
