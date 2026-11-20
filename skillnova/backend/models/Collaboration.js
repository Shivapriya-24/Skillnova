const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedBy: String, 
  uploadedAt: {type: Date, default: Date.now},
  createdAt: { type: Date, default: Date.now },  
},{ _id: false });

const MessageSchema = new mongoose.Schema({
  senderEmail: String,
  senderName: String,
  text: String,
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  authorEmail: String,
  authorName: String,
  title: String,
  body: String,
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now },
});

const MemberSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: { type: String, enum: ['owner','admin','member','requested'], default: 'requested' },
  joinedAt: Date,
});

const CollaborationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, index: true },
  short: String,
  description: String,
  tags: [String],
  visibility: { type: String, enum: ['public','private'], default: 'public' },
  ownerEmail: { type: String, required: true },
  ownerName: String,
  members: [MemberSchema],
  posts: [PostSchema],
  messages: [MessageSchema],
  attachments: [AttachmentSchema],
  gmeetLink: String,
  zoomLink: String,
  teamsLink: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Collaboration', CollaborationSchema);
