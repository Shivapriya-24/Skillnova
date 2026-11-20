const mongoose = require('mongoose');

const sessionRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    skillName:      { type: String, required: true },
    scheduledDate:  { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'rescheduled', 'completed'],
      default: 'pending',
    },

    rescheduledBy:   { type: String, enum: ['teacher', 'learner'] },
    rescheduleReason:{ type: String, default: '' },
    rejectionNote:   { type: String, default: '' },

    teacherFeedback: { type: String, default: '' },
    teacherRating:   { type: Number, min: 1, max: 5 },
    requesterFeedback: { type: String, default: '' },
    requesterRating:   { type: Number, min: 1, max: 5 },

    noteFileUrls:    [{ type: String }],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SessionRequest', sessionRequestSchema);
