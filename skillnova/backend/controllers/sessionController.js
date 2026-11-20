const mongoose = require('mongoose');
const SessionRequest = require('../models/SessionRequest');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { generateCertificate } = require('../utils/certificateGenerator');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5137';
const notifCtrl = require('./notificationController'); 

exports.createSessionRequest = async (req, res) => {
  try {
    const { requesterEmail, receiverEmail, skill, scheduledDate } = req.body;

    const requester = await User.findOne({ email: requesterEmail });
    const teacher = await User.findOne({ email: receiverEmail });
    if (!requester || !teacher) {
      return res.status(404).json({ error: 'Requester or teacher not found' });
    }

    const existing = await SessionRequest.findOne({
      requester: requester._id,
      teacher: teacher._id,
      skillName: skill,
      status: { $ne: 'rejected' },
    });
    if (existing) {
      return res.status(400).json({ error: 'Request already exists for this skill.' });
    }

    const schedule = scheduledDate
      ? new Date(scheduledDate)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = new SessionRequest({
      requester: requester._id,
      teacher: teacher._id,
      skillName: skill,
      scheduledDate: schedule,
      status: 'pending',
    });

    await session.save();
    await notifCtrl.createNotification({
      userId: teacher.email, 
      type: 'session',
      title: 'New session request',
      message: `${requester.name || requesterEmail} requested a session for "${skill}"`,
      data: { sessionId: session._id }
    });

    res.status(201).json(session);
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Failed to create session request' });
  }
};

exports.getSessionRequests = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query param required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sessions = await SessionRequest.find({
      $or: [{ requester: user._id }, { teacher: user._id }],
    })
      .populate('requester', 'name email')
      .populate('teacher', 'name email')
      .sort({ scheduledDate: -1 });

    const sent = [];
    const received = [];

    sessions.forEach((s) => {
      const scheduledAt = s.scheduledDate ? s.scheduledDate.toISOString() : null;
      const base = {
        id: s._id,
        skillName: s.skillName || 'Not specified',
        scheduledAt,
        scheduledDate: scheduledAt, 
        status: s.status,
        rejectionNote: s.rejectionNote || '',
        rescheduleReason: s.rescheduleReason || '',
        rescheduledBy: s.rescheduledBy || '',
        teacherFeedback: s.teacherFeedback || '',
        teacherRating: s.teacherRating || null,
        requesterFeedback: s.requesterFeedback || '',
        requesterRating: s.requesterRating || null,
        noteFileUrls: s.noteFileUrls || [],
        meetLink: s.meetLink || '',
        estimatedDays: s.estimatedDays || null,
        requesterEmail: s.requester?.email || null,
        requesterName: s.requester?.name || null,
        teacherEmail: s.teacher?.email || null,
        teacherName: s.teacher?.name || null,
      };

      if (s.requester?.email === email) {
        sent.push({
          ...base,
          to: s.teacher?.name || s.teacher?.email || 'Unknown',
        });
      }
      if (s.teacher?.email === email) {
        received.push({
          ...base,
          from: s.requester?.name || s.requester?.email || 'Unknown',
        });
      }
    });

    res.json({ sent, received });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ sent: [], received: [] });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { requestId, status, rejectionNote, scheduledAt, meetLink, estimatedDays } = req.body;
    const update = {};
    if (typeof status !== 'undefined') update.status = status;
    if (scheduledAt) update.scheduledDate = new Date(scheduledAt);
    if (meetLink) update.meetLink = meetLink;
    if (estimatedDays) update.estimatedDays = estimatedDays;
    if (rejectionNote) update.rejectionNote = rejectionNote;

    const session = await SessionRequest.findByIdAndUpdate(requestId, update, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (status) {
      await notifCtrl.createNotification({
        userId: session.requester.email,
        type: 'session',
        title: `Session ${status}`,
        message: `Your session for "${session.skillName}" was ${status}`,
        data: { sessionId: session._id, status }
      });
    }
    res.json(session);

  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update session status' });
  }
};

exports.rescheduleSession = async (req, res) => {
  try {
    const { requestId, newDate, rescheduleReason, rescheduledBy } = req.body;
    if (!requestId || !newDate || !rescheduledBy) {
      return res.status(400).json({ error: 'requestId, newDate and rescheduledBy are required' });
    }

    const update = {
      scheduledDate: new Date(newDate),
      status: 'rescheduled',
      rescheduleReason: rescheduleReason || '',
      rescheduledBy,
    };

    const session = await SessionRequest.findByIdAndUpdate(requestId, update, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('Reschedule error:', err);
    res.status(500).json({ error: 'Failed to reschedule session' });
  }
};

exports.markSessionComplete = async (req, res) => {
  try {
    const { requestId } = req.body;
    const session = await SessionRequest.findById(requestId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (new Date() < new Date(session.scheduledDate)) {
      return res.status(400).json({ error: 'Cannot mark as completed before scheduled time' });
    }

    session.status = 'completed';
    await session.save();
    await notifCtrl.createNotification({
      userId: session.requester.email,
      type: 'session',
      title: 'Session Completed',
      message: `Your session on "${session.skillName}" was marked completed.`,
      data: { sessionId: session._id }
    });
    res.json(session);
  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({ error: 'Failed to mark session complete' });
  }
};

exports.uploadNotesAndFeedback = async (req, res) => {
  try {
    const requestId = req.body.requestId;
    const teacherFeedback = req.body.feedback || req.body.teacherFeedback || '';
    const teacherRating = req.body.starRating || req.body.teacherRating || null;

    const session = await SessionRequest.findById(requestId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (req.files && req.files.length > 0) {
      const urls = req.files.map(
       (file) => `${BASE_URL}/uploads/${file.filename}`
      );
      session.noteFileUrls = urls;
    }

    session.teacherFeedback = teacherFeedback;
    session.teacherRating = teacherRating;
    await session.save();
    await notifCtrl.createNotification({
      userId: session.requester.email,   
      type: 'session',
      title: 'Notes Uploaded',
      message: `Notes were uploaded for your session on "${session.skillName}".`,
      data: { sessionId: session._id }
    });
    res.json(session);
  } catch (err) {
    console.error('Upload notes/feedback error:', err);
    res.status(500).json({ error: 'Failed to upload notes/feedback' });
  }
};

exports.uploadNotesOnly = async (req, res) => {
  try {
    const requestId = req.body.requestId;
    const session = await SessionRequest.findById(requestId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (req.files && req.files.length > 0) {
     const urls = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );
      session.noteFileUrls = [...(session.noteFileUrls || []), ...urls];
    }
    await session.save();
    await notifCtrl.createNotification({
      userId: session.requester.email,  
      type: 'session',
      title: 'Notes Uploaded',
      message: `Notes were uploaded for your session on "${session.skillName}".`,
      data: { sessionId: session._id }
    });
    res.json(session);
  } catch (err) {
    console.error('Upload notes error:', err);
    res.status(500).json({ error: 'Failed to upload notes' });
  }
};

exports.submitRequesterFeedback = async (req, res) => {
  try {
    const { requestId, requesterFeedback, requesterRating } = req.body;
    const session = await SessionRequest.findById(requestId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.requesterFeedback = requesterFeedback;
    session.requesterRating = requesterRating;
    await session.save();

    res.json(session);
  } catch (err) {
    console.error('Requester feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.getCompletionCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.query.email;

    const session = await SessionRequest.findById(id)
        .populate('requester', 'name email')
        .populate('teacher', 'email');

    if (!session || session.status !== 'completed')
      return res.status(404).json({ error: 'Session not found or not completed' });

    if (session.requester.email !== email)
      return res.status(403).json({ error: 'Only the learner can download this certificate' });

    const certUrl = await generateCertificate({
      _id: session._id,
      requesterName: session.requester.name,
      requesterEmail: session.requester.email,
      teacherEmail: session.teacher.email,
      skillName: session.skillName,
    });

    return res.download(path.join(__dirname, '..', 'public', certUrl));
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};