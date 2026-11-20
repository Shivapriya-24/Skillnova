const Achievement = require('../models/Achievement');
const SessionRequest = require('../models/SessionRequest');
const User = require('../models/User');

async function calculateForUser(userEmail) {
  
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new Error('User not found');

  const asRequester = await SessionRequest.find({ requester: user._id });
  const asTeacher = await SessionRequest.find({ teacher: user._id });

  const completedAsLearner = asRequester.filter(s => s.status === 'completed').length;
  const completedAsTeacher = asTeacher.filter(s => s.status === 'completed').length;
  const totalCompleted = completedAsLearner + completedAsTeacher;

  const totalSessions = asRequester.length + asTeacher.length;

  const teacherRatings = asTeacher.map(s => s.requesterRating).filter(r => typeof r === 'number');
  const avgTeacherRating = teacherRatings.length ? (teacherRatings.reduce((a,b)=>a+b,0)/teacherRatings.length) : 0;

  const requesterRatings = asRequester.map(s => s.teacherRating).filter(r=>typeof r === 'number');
  const avgRequesterRating = requesterRatings.length ? (requesterRatings.reduce((a,b)=>a+b,0)/requesterRatings.length) : 0;

  const skills = new Set();
  [...asRequester, ...asTeacher].forEach(s => { if (s.skillName) skills.add(s.skillName); });

  const candidates = [
    {
      key: 'first-session',
      title: 'First Session Completed',
      description: 'Complete your first session as learner or teacher',
      icon:"/images/first-session.jpg",
      progress: Math.min(100, totalCompleted >= 1 ? 100 : (totalCompleted / 1) * 100),
      earned: totalCompleted >= 1,
    },
    {
      key: 'five-sessions',
      title: '5 Sessions Completed',
      description: 'Complete 5 sessions (teacher or learner)',
      icon:"/images/5-session.jpg",
      progress: Math.min(100, (totalCompleted / 5) * 100),
      earned: totalCompleted >= 5,
    },
    {
      key: 'mentor-20',
      title: '20 Sessions Taught',
      description: 'Teach 20 sessions as instructor',
      icon: "/images/20-session.jpg",
      progress: Math.min(100, (completedAsTeacher / 20) * 100),
      earned: completedAsTeacher >= 20,
    },
    {
      key: 'polyglot-3',
      title: 'Multi-Skill Explorer',
      description: 'Complete sessions across 3 different skills',
      icon:"/images/multi-skill.webp",
      progress: Math.min(100, (skills.size / 3) * 100),
      earned: skills.size >= 3,
    },
    {
      key: 'high-rated-teacher',
      title: 'Top Rated Teacher',
      description: 'Maintain an average rating >= 4.8 across 10+ taught sessions',
      icon:"/images/top-rated.jpg",
      progress: Math.min(100, avgTeacherRating ? (avgTeacherRating/5)*100 : 0),
      earned: avgTeacherRating >= 4.8 && asTeacher.length >= 10,
    },
    {
      key: 'feedback-giver-10',
      title: 'Feedback Champion',
      description: 'Submit feedback on 10 sessions',
      icon: "/images/feedback.jpg",
      progress: 0, 
      earned: false,
    },
  ];

  const feedbackGiven = [...asRequester, ...asTeacher].filter(s => s.requesterFeedback || s.teacherFeedback).length;
  const feedbackCandidate = candidates.find(c=>c.key==='feedback-giver-10');
  if (feedbackCandidate) {
    feedbackCandidate.progress = Math.min(100, (feedbackGiven/10)*100);
    feedbackCandidate.earned = feedbackGiven >= 10;
  }

  const results = [];
  for (const cand of candidates) {
    const existing = await Achievement.findOne({ userEmail: userEmail, key: cand.key });
    if (existing) {
      existing.title = cand.title;
      existing.description = cand.description;
      existing.progress = cand.progress;
      if (!existing.earned && cand.earned) {
        existing.earned = true;
        existing.earnedAt = new Date();
      }
      existing.icon = cand.icon;
      await existing.save();
      results.push(existing);
    } else {
      const doc = await Achievement.create({
        userEmail,
        key: cand.key,
        title: cand.title,
        description: cand.description,
        progress: cand.progress,
        earned: cand.earned,
        earnedAt: cand.earned ? new Date() : null,
         icon: cand.icon 
      });
      results.push(doc);
    }
  }

  return results;
}

module.exports.getAchievements = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) return res.status(400).json({ error: 'email required' });
    const items = await Achievement.find({ userEmail: email }).sort({ earned: -1, progress: -1 });
    if (!items || items.length === 0) {
      await calculateForUser(email);
      const fresh = await Achievement.find({ userEmail: email }).sort({ earned: -1, progress: -1 });
      return res.json({ achievements: fresh });
    }
    return res.json({ achievements: items });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

module.exports.calculateAchievements = async (req, res) => {
  try {
    const email = req.params.email || req.body.email;
    if (!email) return res.status(400).json({ error: 'email required' });
    const results = await calculateForUser(email);
    res.json({ achievements: results });
  } catch (err) {
    console.error('Calculate achievements error:', err);
    res.status(500).json({ error: 'Failed to calculate achievements' });
  }
};
