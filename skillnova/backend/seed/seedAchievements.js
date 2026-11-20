// File: backend/seed/seedAchievements.js (utility to seed default badges for all users)
// Run this as a one-off script (node ./backend/seed/seedAchievements.js)
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillnova');
  const users = await User.find({});
  for (const user of users) {
    const exists = await Achievement.findOne({ userEmail: user.email, key: 'first-session' });
    if (!exists) {
      await Achievement.create({ userEmail: user.email, key: 'first-session', title: 'First Session Completed', description: 'Complete your first session.', progress: 0, earned: false });
    }
    // Add other default badges similarly if you like
  }
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
