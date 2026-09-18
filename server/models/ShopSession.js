const mongoose = require('mongoose');

const shopSessionSchema = new mongoose.Schema({
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShopSession', shopSessionSchema);
