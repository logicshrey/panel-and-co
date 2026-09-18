const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

async function getAdminProducts(_req, res) {
  try {
    const products = await Product.find().populate('factionId', 'name slug').sort({ createdAt: -1 });
    const variants = await Variant.find({ productId: { $in: products.map((product) => product._id) } });
    const variantsByProduct = new Map();
    variants.forEach((variant) => {
      const key = String(variant.productId);
      variantsByProduct.set(key, [...(variantsByProduct.get(key) || []), variant]);
    });

    res.json({
      products: products.map((product) => ({
        ...product.toObject(),
        variants: variantsByProduct.get(String(product._id)) || [],
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, factionId, description = '', basePrice, images = [] } = req.body;
    if (!name || !factionId || basePrice === undefined) {
      return res.status(400).json({ message: 'name, factionId, and basePrice are required' });
    }
    const product = await Product.create({ name, factionId, description, basePrice, images });
    await product.populate('factionId', 'name slug');
    return res.status(201).json({ product: { ...product.toObject(), variants: [] } });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const fields = ['name', 'factionId', 'description', 'basePrice', 'images'];
    const updates = Object.fromEntries(fields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]));
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('factionId', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const variants = await Variant.find({ productId: product._id });
    return res.json({ product: { ...product.toObject(), variants } });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Variant.deleteMany({ productId: product._id });
    await product.deleteOne();
    return res.json({ message: 'Product and its variants deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createVariant(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { size, color, stock, sku } = req.body;
    if (!size || !color || stock === undefined || !sku) {
      return res.status(400).json({ message: 'size, color, stock, and sku are required' });
    }
    const variant = await Variant.create({ productId: product._id, size, color, stock, sku });
    return res.status(201).json({ variant });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateVariant(req, res) {
  try {
    const fields = ['size', 'color', 'stock', 'sku'];
    const updates = Object.fromEntries(fields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]));
    const variant = await Variant.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    return res.json({ variant });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteVariant(req, res) {
  try {
    const variant = await Variant.findByIdAndDelete(req.params.id);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    return res.json({ message: 'Variant deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getAdminOrders(_req, res) {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    const items = await OrderItem.find({ orderId: { $in: orders.map((order) => order._id) } })
      .populate({ path: 'variantId', populate: { path: 'productId', select: 'name' } });
    const itemsByOrder = new Map();
    items.forEach((item) => {
      const key = String(item.orderId);
      itemsByOrder.set(key, [...(itemsByOrder.get(key) || []), item]);
    });
    return res.json({
      orders: orders.map((order) => ({
        ...order.toObject(),
        items: itemsByOrder.get(String(order._id)) || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
      .populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  getAdminOrders,
  updateOrderStatus,
};
