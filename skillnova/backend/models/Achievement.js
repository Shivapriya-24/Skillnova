const mongoose = require('mongoose');


const achievementSchema = new mongoose.Schema({
userEmail: { type: String, required: true, index: true },
key: { type: String, required: true }, 
title: { type: String, required: true },
description: { type: String },
icon: { type: String },
progress: { type: Number, default: 0 }, 
earned: { type: Boolean, default: false },
earnedAt: { type: Date },
meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });


module.exports = mongoose.model('Achievement', achievementSchema);