const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createSessionRequest,
  getSessionRequests,
  updateSessionStatus,
  rescheduleSession,
  markSessionComplete,
  uploadNotesAndFeedback,
  uploadNotesOnly,
  submitRequesterFeedback,
  getCompletionCertificate,
} = require('../controllers/sessionController');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.docx'];
  allowed.includes(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Only PDF, JPG, PNG, TXT, DOCX files allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/request', createSessionRequest);
router.get('/requests', getSessionRequests);
router.post('/update-status', updateSessionStatus);
router.post('/reschedule', rescheduleSession);
router.post('/mark-complete', markSessionComplete);

router.post(
  '/upload-notes-feedback',
  (req,res,next)=>upload.array('files',10)(req,res,err=>err?res.status(400).json({error:err.message}):next()),
  uploadNotesAndFeedback
);
router.post(
  '/upload-notes',
  (req,res,next)=>upload.array('files',10)(req,res,err=>err?res.status(400).json({error:err.message}):next()),
  uploadNotesOnly
);

router.post('/submit-feedback', submitRequesterFeedback);
router.get('/certificate/:id', getCompletionCertificate);

module.exports = router;
