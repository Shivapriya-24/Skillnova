const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: Date },
  bio: { type: String, default: '' },
  interests: { type: [String], default: [] },
});

module.exports = mongoose.model('Profile', profileSchema);
