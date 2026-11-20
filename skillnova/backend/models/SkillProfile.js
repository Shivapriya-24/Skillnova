const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  skill: String,
  proofPaths: [String], 
});

const skillProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  languagePref: String,
  location: String,
  knownSkills: [skillSchema],
  wantedSkills: [String],
});

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
