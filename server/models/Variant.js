const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Variant', variantSchema);
