const User = require('../models/User');

async function adminAuth(req, res, next) {
  try {
    const email =
      req.query.email ||
      req.body?.email ||
      req.headers['x-admin-email'];

    if (!email) {
      return res.status(401).json({ message: 'Admin email required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.admin = user;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = adminAuth;
