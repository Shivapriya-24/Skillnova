const Collaboration = require('../models/Collaboration');
const slugify = require('slugify');
const path = require('path');
const notifCtrl = require('./notificationController'); 
const User = require('../models/User');

function toPublic(collab) {
  if (!collab) return null;
  return {
    id: collab._id.toString(),
    title: collab.title,
    short: collab.short,
    description: collab.description,
    tags: collab.tags,
    visibility: collab.visibility,
    ownerEmail: collab.ownerEmail,
    ownerName: collab.ownerName,
    members: collab.members?.map(m => ({
      email: m.email,
      name: m.name,
      role: m.role
    })),
    createdAt: collab.createdAt,
    updatedAt: collab.updatedAt,

    attachments: collab.attachments?.map(a => ({
      filename: a.originalName || a.filename,
      url: `/uploads/collaborations/${encodeURIComponent(a.filename)}`
    })),

    posts: collab.posts?.map(p => ({
      id: p.id?.toString(),
      title: p.title,
      body: p.body,
      authorEmail: p.authorEmail,
      authorName: p.authorName,
      createdAt: p.createdAt,
      attachments: p.attachments?.map(a => ({
        filename: a.originalName || a.filename,
        url: `/uploads/collaborations/${encodeURIComponent(a.filename)}`
      }))
    })) || [],

    messages: collab.messages?.map(m => ({
      id: m._id?.toString(),
      senderEmail: m.senderEmail,
      senderName: m.senderName,
      text: m.text,
      createdAt: m.createdAt,
      attachments: m.attachments?.map(a => ({
        filename: a.originalName || a.filename,
        url: `/uploads/collaborations/${encodeURIComponent(a.filename)}`
      }))
    })) || []
  };
}

module.exports.create = async (req, res) => {
  try {
    const { title, short, description, tags = [], visibility = 'public', ownerEmail, ownerName } = req.body;
    if (!title || !ownerEmail) return res.status(400).json({ error: 'title and ownerEmail required' });
    const coll = new Collaboration({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      short,
      description,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s=>s.trim()) : []),
      visibility,
      ownerEmail,
      ownerName,
      members: [{ email: ownerEmail, name: ownerName, role: 'owner', joinedAt: new Date() }],
      attachments: (req.files || []).map(f => ({
        originalName: f.originalname,
        filename: f.filename,
        path: `uploads/collaborations/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
        uploadedBy: ownerEmail
      }))

    });

    if (req.files && req.files.length) {
      coll.attachments = req.files.map(f => ({
        originalName: f.originalname,
        filename: f.filename,          
        path: `uploads/collaborations/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
        uploadedBy: ownerEmail,
      }));
    }

    await coll.save();
    const membersToNotify = [ownerEmail];
    for (const email of membersToNotify) {
      const u= await User.findOne({ email });
      if (u) await notifCtrl.createNotification({ 
        userId: u.email,
        type: 'collaboration',
        title: 'Collaboration Created',
        message: `Collaboration "${title}" was created.`,
        data: { collaborationId: coll._id }
      });
    }
    res.json({ collaboration: coll });
  } catch (err) {
    console.error('create collab error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.list = async (req, res) => {
  try {
    const q = req.query.q || '';
    const tag = req.query.tag;
    const visibility = req.query.visibility; 
    const filters = {};
    if (q) filters.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }, { short: new RegExp(q, 'i') }];
    if (tag) filters.tags = tag;
    if (visibility) filters.visibility = visibility;
    const items = await Collaboration.find(filters).sort({ createdAt: -1 }).limit(200);
    res.json({ collaborations: items.map(toPublic) });
  } catch (err) {
    console.error('list collab error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.get = async (req, res) => {
  try {
    const id = req.params.id;
    const coll = await Collaboration.findById(id);
    if (!coll) return res.status(404).json({ error: 'Not found' });
    res.json({ collaboration: coll });
  } catch (err) {
    console.error('get collab error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.publicGet = async (req, res) => {
  try {
    const id = req.params.id;
    const coll = await Collaboration.findById(req.params.id);
    if (!coll) return res.status(404).json({ error: 'Not found' });
    if (coll.visibility === 'private') return res.status(403).json({ error: 'This collaboration is private' });
    res.json(toPublic(coll));
  } catch (err) {
    console.error('publicGet collab error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.requestJoin = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, name, message } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    const coll = await Collaboration.findById(id);
    if (!coll) return res.status(404).json({ error: 'Not found' });

    const exists = coll.members.find(m => m.email === email);
    if (exists) return res.status(400).json({ error: 'Already a member or requested' });

    coll.members.push({ email, name, role: 'requested', joinedAt: null });
    if (message) coll.messages.push({ senderEmail: email, senderName: name, text: `[Join request] ${message}` });
    await coll.save();
    await notifCtrl.createNotification({
      userId: (await User.findOne({ email: coll.ownerEmail}))?._id,
      type: 'collaboration',
      title: 'Join Request',
      message: `${name || email} requested to join your collaboration "${coll.title}"`,
      data: { collaborationId: coll._id, requesterEmail: email }
    });
    res.json({ ok: true, message: 'Join requested' });
  } catch (err) {
    console.error('requestJoin error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.approveMember = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, approverEmail, accept } = req.body;
    const coll = await Collaboration.findById(id);
    if (!coll) return res.status(404).json({ error: 'Not found' });

    const approver = coll.members.find(m => m.email === approverEmail);
    if (!approver || !['owner','admin'].includes(approver.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const m = coll.members.find(x => x.email === email);
    if (!m) return res.status(404).json({ error: 'Member not found' });

    if (accept) {
      m.role = 'member';
      m.joinedAt = new Date();
      coll.messages.push({ senderEmail: approverEmail, senderName: approver?.name || '', text: `${email} was accepted to the collaboration.` });
    } else {
      coll.members = coll.members.filter(x => x.email !== email);
      coll.messages.push({ senderEmail: approverEmail, senderName: approver?.name || '', text: `${email} was rejected/removed.` });
    }
    await coll.save();
    if (accept) {
    await notifCtrl.createNotification({
      userId: (await User.findOne({ email}))?._id,
      type: 'collaboration',
      title: 'Join Request Accepted',
      message: `Your request to join "${coll.title}" was accepted`,
      data: { collaborationId: coll._id }
    });
    } else {
    const uReject = await User.findOne({ email });
    if (uReject) {
      await notifCtrl.createNotification({
        userId: uReject._id,
        type: 'collaboration',
        title: 'Join Request Rejected',
        message: `Your request to join "${coll.title}" was rejected`,
        data: { collaborationId: coll._id }
      });
    }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('approveMember error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.createPost = async (req, res) => {
  try {
    const id = req.params.id;
    const { authorEmail, authorName, title, body } = req.body;
    const coll = await Collaboration.findById(id);
    if (!coll) return res.status(404).json({ error: 'Not found' });
    const attachments = (req.files || []).map(f => ({
      originalName: f.originalname,
      filename: f.filename,   
      path: `uploads/collaborations/${f.filename}`,
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: authorEmail  
    }));
    coll.posts.unshift({ authorEmail, authorName, title, body, attachments });
    coll.updatedAt = new Date();
    await coll.save();
    const notifyMembers = coll.members.filter(m => m.email !== authorEmail).map(m => m.email || m.memberEmail);
    for (const memberEmail of notifyMembers) {
      const u= await User.findOne({ email: memberEmail });
      if (u) await notifCtrl.createNotification({
        userId: u.email,
        type: 'collaboration',
        title: 'New Post in Collaboration',
        message: `${authorName || authorEmail} added a post in "${coll.title}"`,
        data: { collaborationId: coll._id }
      });
    }
    res.json({ ok: true, post: coll.posts[0] });
  } catch (err) {
    console.error('createPost', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { senderEmail, senderName, text } = req.body;
    if (!senderEmail) return res.status(400).json({ error: 'senderEmail required' });

    const collab = await Collaboration.findById(req.params.id);
    if (!collab) return res.status(404).json({ error: 'Collaboration not found' });

    const attachments = (req.files || []).map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      url: `/uploads/collaborations/${f.filename}`, 
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: senderEmail,
    }));

    collab.messages.push({
      senderEmail,
      senderName,
      text,
      attachments,
      createdAt: new Date(),
    });

    await collab.save();
    const notifyMembers = collab.members.filter(m => m.email !== senderEmail).map(m => m.email || m.memberEmail);
    for (const memberEmail of notifyMembers) {
      const u = await User.findOne({ email:memberEmail});
      if (u) await notifCtrl.createNotification({
        userId: u.email,
        type: 'collaboration',
        title: 'New Post in Collaboration',
        message: `${senderName || senderEmail} added a post in "${collab.title}"`,
        data: { collaborationId: collab._id }
      });
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


module.exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; 
    const coll = await Collaboration.findById(id);
    if (!coll) return res.status(404).json({ error: 'Not found' });

    if (coll.ownerEmail !== email)
      return res.status(403).json({ error: 'Not authorized' });

    await coll.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('delete collab error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
function mapFiles(files, uploadedBy) {
  return (files || []).map(f => ({
    filename: f.originalname,
    storedName: f.filename,
    url: `/uploads/collaborations/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size,
    uploadedBy,
  }));
}

exports.getPublic = async (req, res) => {
  try {
    const collab = await Collaboration.findById(req.params.id).lean();
    if (!collab) return res.status(404).json({ error: 'Not found' });

    res.json({
      _id: collab._id,
      title: collab.title,
      short: collab.short,
      description: collab.description,
      tags: collab.tags || [],
      attachments: collab.attachments || [],
      members: collab.members || [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};