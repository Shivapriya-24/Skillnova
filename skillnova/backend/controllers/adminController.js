const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const SessionRequest = require('../models/SessionRequest');
const Achievement = require('../models/Achievement');
const Feedback = require('../models/Feedback');
const Collaboration = require('../models/Collaboration');
const Notification = require('../models/Notification');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email role createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.listSkills = async (req, res) => {
  try {
    const skills = await SkillProfile.find().lean();
    if (!skills.length) return res.json([]);

    const formatted = [];

    skills.forEach(profile => {
      (profile.knownSkills || []).forEach(skill => {
        formatted.push({
          _id: skill._id,
          skill: skill.skill || '—',
          owner: profile.email || 'Unknown',
        });
      });
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ message: 'Error fetching skills' });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await SessionRequest.find()
      .populate({ path: 'requester', select: 'username email', strictPopulate: false })
      .populate({ path: 'teacher', select: 'username email', strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    if (!sessions.length) return res.json([]);

    const formatted = sessions.map(s => ({
      _id: s._id,
      requester: 
        s.requester?.email || s.requester?.username || s.requesterEmail || 'Unknown',
      teacher: 
        s.teacher?.email || s.teacher?.username || s.teacherEmail || 'Unknown',
      skill: s.skillName || '—',
      status: s.status || '—',
      scheduledDate: s.scheduledDate ? new Date(s.scheduledDate).toLocaleString() : '—'
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

exports.listAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().lean();
    if (!achievements.length) return res.json([]);

    const formatted = achievements.map(a => ({
      _id: a._id,
      title: a.title || '—',
      description: a.description || '—',
      user: a.userEmail || 'Unknown',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};

exports.listFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

    if (!feedbacks.length) return res.json([]);

    const formatted = feedbacks.map(f => ({
      _id: f._id,
      from: f.userEmail || 'Unknown',
      to: 'N/A',
      rating: f.rating || '—',
      comments: f.suggestions || f.features?.join(', ') || '',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
};

exports.listCollaborations = async (req, res) => {
  try {
    const collabs = await Collaboration.find().lean();
    if (!collabs.length) return res.json([]);

    const formatted = collabs.map(c => ({
      _id: c._id,
      title: c.title || '—',
      category: c.tags?.join(', ') || 'N/A',
      createdBy: c.ownerName || c.ownerEmail || 'Unknown',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching collaborations:', err);
    res.status(500).json({ message: 'Error fetching collaborations' });
  }
};

exports.deleteCollaboration = async (req, res) => {
  try {
    const { collabId } = req.params;
    await Collaboration.findByIdAndDelete(collabId);
    res.json({ message: 'Collaboration deleted' });
  } catch (err) {
    console.error('Error deleting collaboration:', err);
    res.status(500).json({ message: 'Error deleting collaboration' });
  }
};

exports.listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();

    if (!contacts.length) return res.json([]);

    const formatted = contacts.map(c => ({
      _id: c._id,
      name: c.name || '—',
      email: c.email || '—',
      message: c.message || '',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    await Contact.findByIdAndDelete(contactId);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ message: 'Error deleting contact' });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const messages = await Message.find().lean();
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Conversation.findByIdAndDelete(conversationId);
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error('Error clearing conversation:', err);
    res.status(500).json({ message: 'Error clearing conversation' });
  }
};
