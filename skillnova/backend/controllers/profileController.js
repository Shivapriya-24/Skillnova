const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const profile = await Profile.findOne({ email });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveProfile = async (req, res) => {
  const { email, name, dob, bio, interests } = req.body;

  try {
    const existing = await Profile.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    const newProfile = new Profile({
      email,
      name,
      dob: dob ? new Date(dob) : undefined,
      bio,
      interests,
    });

    await newProfile.save();
    res.status(201).json({ message: 'Profile created successfully' });
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { email, name, dob, bio, interests } = req.body;

  try {
    const updated = await Profile.findOneAndUpdate(
      { email },
      {
        name,
        dob: dob ? new Date(dob) : undefined,
        bio,
        interests,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
