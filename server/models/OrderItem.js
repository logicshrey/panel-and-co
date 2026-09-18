const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant',
    required: true,
  },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
