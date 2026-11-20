const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllUsers,
  getConversations,
  getMessages,
  sendMessage,
  sendAudioMessage,
} = require('../controllers/messageController');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/users', getAllUsers);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);

router.post('/messages', upload.single('file'), sendMessage);

router.post('/messages/audio', upload.single('audio'), sendAudioMessage);

router.delete('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastUpdated: new Date(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
