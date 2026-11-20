const User = require('../models/User');
const Profile = require('../models/Profile');
const crypto =require('crypto');
const mailer =require('../utils/mailer'); 
const bcrypt = require('bcrypt');
exports.signup = async (req, res) => {
  console.log('Sognup body:',req.body);
  const { username , email, password, role } = req.body; 

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.googleId || existing.linkedinId || existing.githubId){
        return res.status(409).json({ message: 'User already exists via social login.please login using Google/Facebook/Apple' });
      } else {
        return res.status(409).json({ message: 'User already exists. Please login or use a different email'});
      }
    }

    const newUser = new User({ email, username, password, role });
    await newUser.save();
    console.log('New user saved:',newUser);

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.googleId || user.linkedinId || user.githubId) {
      return res.status(401).json({ message: 'Social login account. Use the provider or reset password.' });
    }

    console.log(`Login attempt for: ${email}`);
    console.log('Password from DB (hashed):', user.password);
    console.log('Password entered:', password);

    const isMatch = await user.comparePassword(password);
    console.log('Password match?', isMatch);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    return res.status(200).json({
      message: 'Login successful',
      username: user.username,
      email: user.email,
      role: user.role,
      theme: user.theme,
      language: user.language
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'If that email exists, a reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetLink = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${user.email}`;

    await mailer.sendMail({
      to: user.email,
      subject: 'SkillNova Password Reset',
      text: `You requested a password reset. Click the link to reset your password:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
      html: `<p>You requested a password reset. Click <a href="${resetLink}">this link</a> to reset your password.</p>`
    });

    return res.status(200).json({
      message: 'If that email exists, a reset link has been sent.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ message: 'Email, token, and password are required.' });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await mailer.sendMail({
      to: user.email,
      subject: 'Your password has been changed',
      text: 'Your password was successfully changed.',
      html: '<p>Your password was successfully changed.</p>'
    });

    return res.status(200).json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserInfo = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      role: user.role,
      username: user.username,
      email: user.email,
      theme: user.theme,
      language: user.language
    });
  } catch (err) {
    console.error('Fetch user info error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePreferences = async (req, res) => {
  const { email, theme, language } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { theme, language },
      { new: true }
    ).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'Preferences updated', theme: user.theme, language: user.language });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  const { email } = req.body;
  try {
    await User.findOneAndDelete({ email });
    await Profile.findOneAndDelete({ email });
    return res.status(200).json({ message: 'Account and profile deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email role'); 
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Fetch all users error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
