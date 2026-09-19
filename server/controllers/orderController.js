const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');

const PAYMENT_METHODS = ['COD', 'UPI', 'CARD'];

async function orderWithItems(order) {
  const items = await OrderItem.find({ orderId: order._id })
    .populate({ path: 'variantId', populate: { path: 'productId' } });

  return { ...order.toObject(), items };
}

function isOwnerOrAdmin(order, user) {
  return user.role === 'admin' || order.userId.equals(user._id);
}

async function createOrder(req, res) {
  try {
    const { items, address, paymentMethod = 'COD' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const requiredAddressFields = ['line1', 'city', 'state', 'pincode', 'phone'];
    if (!address || requiredAddressFields.some((field) => !address[field])) {
      return res.status(400).json({ message: 'A complete shipping address is required' });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (paymentMethod !== 'COD' && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
      return res.status(503).json({ message: 'Online payments are not configured' });
    }

    const quantities = new Map();
    for (const item of items) {
      const qty = Number(item.qty);
      if (!item.variantId || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Each item needs a variantId and a positive integer qty' });
      }
      quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + qty);
    }

    const lines = [];
    for (const [variantId, qty] of quantities) {
      const variant = await Variant.findById(variantId);
      if (!variant) {
        return res.status(400).json({ message: `Variant ${variantId} was not found` });
      }
      if (variant.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for variant ${variantId}` });
      }

      const product = await Product.findById(variant.productId);
      if (!product) {
        return res.status(400).json({ message: `Product for variant ${variantId} was not found` });
      }

      lines.push({ variantId: variant._id, qty, price: product.basePrice });
    }

    const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    const order = await Order.create({
      userId: req.user._id,
      total,
      status: 'pending',
      paymentMethod,
      shippingAddress: address,
      createdAt: new Date(),
    });

    const decrementedLines = [];
    try {
      for (const line of lines) {
        const updated = await Variant.findOneAndUpdate(
          { _id: line.variantId, stock: { $gte: line.qty } },
          { $inc: { stock: -line.qty } },
          { new: true },
        );

        if (!updated) {
          throw new Error(`Insufficient stock for variant ${line.variantId}`);
        }
        decrementedLines.push(line);
      }

      await OrderItem.insertMany(lines.map((line) => ({ ...line, orderId: order._id })));
    } catch (error) {
      await Promise.all(decrementedLines.map((line) => Variant.findByIdAndUpdate(
        line.variantId,
        { $inc: { stock: line.qty } },
      )));
      await OrderItem.deleteMany({ orderId: order._id });
      await Order.findByIdAndDelete(order._id);
      return res.status(400).json({ message: error.message });
    }

    const createdOrder = await orderWithItems(order);
    if (paymentMethod === 'COD') {
      const sent = await sendOrderConfirmationEmail({ order: createdOrder, user: req.user });
      if (sent) {
        order.confirmationEmailSentAt = new Date();
        await order.save();
        createdOrder.confirmationEmailSentAt = order.confirmationEmailSentAt;
      }
    } else {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: total * 100,
          currency: 'INR',
          receipt: String(order._id),
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        createdOrder.razorpayOrderId = razorpayOrder.id;
      } catch (error) {
        await Promise.all(lines.map((line) => Variant.findByIdAndUpdate(
          line.variantId,
          { $inc: { stock: line.qty } },
        )));
        await OrderItem.deleteMany({ orderId: order._id });
        await Order.findByIdAndDelete(order._id);
        console.error('Razorpay order creation failed:', error.message);
        return res.status(502).json({ message: 'Could not start online payment. Please try again.' });
      }
    }
    return res.status(201).json({
      order: createdOrder,
      razorpayOrderId: createdOrder.razorpayOrderId,
      razorpayKeyId: paymentMethod === 'COD' ? undefined : process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!isOwnerOrAdmin(order, req.user)) return res.status(403).json({ message: 'Not authorized to view this order' });

    return res.json({ order: await orderWithItems(order) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const populatedOrders = await Promise.all(orders.map(orderWithItems));
    return res.json({ orders: populatedOrders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function confirmOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.userId.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized to confirm this order' });
    return res.status(400).json({ message: 'Payment confirmation must be completed through Razorpay verification. COD is paid on delivery.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.userId.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized to verify this order' });
    if (!['UPI', 'CARD'].includes(order.paymentMethod)) return res.status(400).json({ message: 'This order does not require Razorpay verification' });
    if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be verified' });
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || razorpayOrderId !== order.razorpayOrderId) {
      return res.status(400).json({ message: 'Invalid Razorpay payment details' });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const signatureMatches = expectedSignature.length === razorpaySignature.length
      && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));
    if (!signatureMatches) return res.status(400).json({ message: 'Payment signature verification failed' });

    order.status = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
    const paidOrder = await orderWithItems(order);
    if (!order.confirmationEmailSentAt) {
      const sent = await sendOrderConfirmationEmail({ order: paidOrder, user: req.user });
      if (sent) {
        order.confirmationEmailSentAt = new Date();
        await order.save();
        paidOrder.confirmationEmailSentAt = order.confirmationEmailSentAt;
      }
    }
    return res.json({ order: paidOrder });
  } catch (error) {
    console.error('Razorpay payment verification failed:', error.message);
    return res.status(500).json({ message: 'Could not verify payment' });
  }
}

module.exports = { createOrder, getOrder, getOrders, confirmOrder, verifyPayment };
