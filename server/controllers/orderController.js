const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

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
    const { items, address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const requiredAddressFields = ['line1', 'city', 'state', 'pincode', 'phone'];
    if (!address || requiredAddressFields.some((field) => !address[field])) {
      return res.status(400).json({ message: 'A complete shipping address is required' });
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

    return res.status(201).json({ order: await orderWithItems(order) });
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
    if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be confirmed' });

    order.status = 'paid';
    await order.save();
    return res.json({ order: await orderWithItems(order) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { createOrder, getOrder, getOrders, confirmOrder };
