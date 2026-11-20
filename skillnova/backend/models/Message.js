const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String },
  audioUrl: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
