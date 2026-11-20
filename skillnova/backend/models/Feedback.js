const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },  
  mood: { type: String, required: true },
  rating: { type: Number, required: true },
  features: { type: [String], required: true },
  suggestions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
