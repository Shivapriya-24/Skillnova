const SkillProfile = require('../models/SkillProfile');
const SessionRequest = require('../models/SessionRequest');
const User = require('../models/User');
const notifCtrl = require('./notificationController'); 

exports.saveSkillProfile = async (req, res) => {
  const { email, languagePref, location } = req.body;

  let knownSkillsRaw = [];
  try {
    knownSkillsRaw = JSON.parse(req.body.knownSkills || '[]');
  } catch (err) {
    console.error('Invalid knownSkills JSON:', err);
    return res.status(400).json({ message: 'Invalid knownSkills format' });
  }

  const wantedSkills = JSON.parse(req.body.wantedSkills || '[]');

  try {
    const existingProfile = await SkillProfile.findOne({ email });

    const knownSkills = knownSkillsRaw.map((skillObj, idx) => {
      const existingProofPaths = skillObj.existingProofPaths || [];
      return {
        skill: skillObj.skill,
        proofPaths: [...existingProofPaths], 
      };
    });

    if (req.files && req.files.length) {
      req.files.forEach((file, idx) => {
        const skillIdx = Math.min(idx, knownSkills.length - 1);
        if (knownSkills[skillIdx]) {
          knownSkills[skillIdx].proofPaths.push(file.path);
        }
      });
    }

    const profile = await SkillProfile.findOneAndUpdate(
      { email },
      {
        knownSkills,
        wantedSkills,
        languagePref,
        location,
      },
      { upsert: true, new: true }
    );
    await notifCtrl.createNotification({
      userId: email,
      type: 'skills',
      title: 'Skill Profile Updated',
      message: 'Your skill profile has been successfully saved/updated.',
      data: { profileId: profile._id }
    });
    res.json({ message: 'Profile saved', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSkillProfile = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email query param is required' });
  }

  try {
    const profile = await SkillProfile.findOne({ email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllSkillProfiles = async (req, res) => {
  try {
    const profiles = await SkillProfile.find();

    const emails = profiles.map(p => p.email);

    const users = await User.find({ email: { $in: emails } }).select('email username').lean();

    const emailToUsername = {};
    users.forEach(u => {
      if (u.username && u.username.trim().length > 0) {
        emailToUsername[u.email] = u.username;
      }
    });

    const profilesWithUsernames = profiles.map(profile => ({
      ...profile.toObject(),
      displayName: emailToUsername[profile.email] || profile.email,
    }));

    res.json(profilesWithUsernames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all profiles' });
  }
};
