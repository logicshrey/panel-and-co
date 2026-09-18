const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    factionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faction',
      required: true,
    },
    description: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
