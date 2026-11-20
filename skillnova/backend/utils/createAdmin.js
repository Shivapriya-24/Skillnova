const User = require('../models/User');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@skillnova.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123'; 
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Admin';

async function createAdmin() {
  try {
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      admin = new User({
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}

module.exports = createAdmin;
