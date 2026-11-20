const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const path = require('path');
const notifCtrl = require('./notificationController'); 

exports.getAllUsers = async (req, res) => {
  const User = require('../models/User');
  try {
    const users = await User.find({}, 'email username avatarUrl online').lean();
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getConversations = async (req, res) => {
  const userEmail = req.query.email;
  try {
    const conversations = await Conversation.find({ participants: userEmail }).sort({ lastUpdated: -1 }).lean();
    const data = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = await Message.findOne({ conversationId: conv._id }).sort({ timestamp: -1 }).lean();
      const other = conv.participants.find((p) => p !== userEmail);
      return {
        id: conv._id,
        withUserEmail: other,
        lastMessageText:
          lastMsg?.text ||
          (lastMsg?.fileName ? `📎 ${lastMsg.fileName}` : '') ||
          (lastMsg?.audioUrl ? '🎤 Voice note' : ''),
        lastMessageTimestamp: lastMsg?.timestamp || conv.lastUpdated,
      };
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const msgs = await Message.find({ conversationId }).sort({ timestamp: 1 }).lean();
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    if (!sender || !receiver) return res.status(400).json({ message: 'Missing sender or receiver' });

    let conv = await Conversation.findOne({ participants: { $all: [sender, receiver], $size: 2 } });
    if (!conv) conv = await new Conversation({ participants: [sender, receiver] }).save();
    else { conv.lastUpdated = new Date(); await conv.save(); }

    let fileUrl = null, fileName = null, fileType = null, audioUrl = null;
    if (req.file) {
      const mimeType = req.file.mimetype;
      const relPath = `/uploads/${req.file.filename}`;
      if (mimeType.startsWith('audio/')) audioUrl = relPath;
      else { fileUrl = relPath; fileName = req.file.originalname; fileType = mimeType; }
    }

    const newMsg = await new Message({ conversationId: conv._id, sender, receiver, text, fileUrl, fileName, fileType, audioUrl }).save();
    await notifCtrl.createNotification({
      userId: receiver,
      type: 'messages',
      title: 'New Message',
      message: text ? text : 'You have received a new message.',
      data: { conversationId: conv._id, messageId: newMsg._id }
    });
    res.status(201).json({ message: newMsg, conversationId: conv._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.sendAudioMessage = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    let conv = await Conversation.findOne({ participants: { $all: [sender, receiver], $size: 2 } });
    if (!conv) conv = await new Conversation({ participants: [sender, receiver] }).save();
    else { conv.lastUpdated = new Date(); await conv.save(); }

    let audioUrl = null;
    if (req.file) audioUrl = `/uploads/${req.file.filename}`;

    const newMsg = await new Message({ conversationId: conv._id, sender, receiver, audioUrl }).save();
    await notifCtrl.createNotification({
      userId: receiver,
      type: 'messages',
      title: 'New Voice Message',
      message: 'You have received a new voice note.',
      data: { conversationId: conv._id, messageId: newMsg._id }
    });

    res.status(201).json({ message: newMsg, conversationId: conv._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
