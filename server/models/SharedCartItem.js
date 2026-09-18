const mongoose = require('mongoose');

const sharedCartItemSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShopSession',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    qty: { type: Number, required: true, min: 1 },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SessionMember',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SharedCartItem', sharedCartItemSchema);
