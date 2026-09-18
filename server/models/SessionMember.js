const mongoose = require('mongoose');

const sessionMemberSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopSession',
    required: true,
  },
  displayName: { type: String, required: true, trim: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  joinedAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SessionMember', sessionMemberSchema);
