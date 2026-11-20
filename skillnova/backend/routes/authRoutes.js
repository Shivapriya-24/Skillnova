const express = require('express');
const crypto = require('crypto');
const bcrypt=require('bcryptjs');
const passport = require('../config/passport');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const router = express.Router();

router.get(
  '/google',
  (req,res,next)=>{
     req.session.action = req.query.action || 'login';
     next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`http://localhost:5173/login?socialError=${encodeURIComponent('Login failed. Try again.')}`);
    }

    if (info && info.type === 'ACCOUNT_EXISTS') {
      return res.redirect(
        `http://localhost:5173/login?socialError=${encodeURIComponent(info.message)}`
      );
    }
    if (info && info.type === 'NO_ACCOUNT') {
      return res.redirect(
        `http://localhost:5173/signup?socialError=${encodeURIComponent(info.message)}`
      );
    }

    if (!user) {
      return res.redirect(`http://localhost:5173/login?socialError=${encodeURIComponent('Login failed. Try again.')}`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error after passport:', loginErr);
        return res.redirect(`http://localhost:5173/login?socialError=${encodeURIComponent('Login failed. Try again.')}`);
      }

      const status = user.isNewUser ? 'signup' : 'login';
      return res.redirect(
        `http://localhost:5173/dashboard?status=${status}&username=${encodeURIComponent(user.username)}&role=${user.role}&email=${encodeURIComponent(user.email)}`
      );
    });
  })(req, res, next);
});
router.get('/linkedin', (req, res, next) => {
  req.session.action = req.query.action;
  next();
}, passport.authenticate('linkedin'));

router.get('/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/login',
  session: true
}), (req, res) => {
  res.redirect(`${process.env.APP_URL}/dashboard`);
});
router.get('/github', (req, res, next) => {
    req.session.action = req.query.action || 'login';
    next();
}, passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    res.redirect(`${process.env.APP_URL}/dashboard`);
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: 'SkillNova Password Reset',
      html: `<p>You requested a password reset.</p>
             <p>Click below to reset your password (valid for 1 hour):</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password)
    return res.status(400).json({ message: 'Email, token, and password are required.' });

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token/email.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
