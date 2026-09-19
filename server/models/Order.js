const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'CARD'],
    default: 'COD',
  },
  shippingAddress: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  confirmationEmailSentAt: { type: Date, default: null },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
