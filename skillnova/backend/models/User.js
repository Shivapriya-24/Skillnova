const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true }, 
  password: { type: String, required: function() { return !this.googleId && !this.facebookId && !this.appleId } },
  googleId: String,
  linkedinId: String,
  githubId: String,
  role: {
    type: String,
    enum: ['admin', 'teacher', 'learner','both'],
    required: true,
  },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, default: 'en' },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
},{ timestamps: true});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try{
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword =  async function(candidatePassword) {
  return bcrypt.compare(candidatePassword.trim(), this.password);
};


module.exports = mongoose.model('User', userSchema);
