const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Variant = require('../models/Variant');

const COUNTED_STATUSES = ['paid', 'shipped', 'delivered'];
const DEFAULT_LOW_STOCK = 5;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function utcDayString(date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDayDaysAgo(days) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start;
}

function fillRevenueDays(days, start, rows) {
  const byDate = new Map(rows.map((row) => [row._id, row]));
  const series = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const date = utcDayString(day);
    const row = byDate.get(date);
    series.push({
      date,
      revenue: row ? row.revenue : 0,
      orderCount: row ? row.orderCount : 0,
    });
  }

  return series;
}

async function getRevenue(req, res) {
  try {
    const days = parsePositiveInt(req.query.days, 30);
    const start = startOfUtcDayDaysAgo(days);

    const rows = await Order.aggregate([
      {
        $match: {
          status: { $in: COUNTED_STATUSES },
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    res.json({ days, revenue: fillRevenueDays(days, start, rows) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getBestSellers(_req, res) {
  try {
    const [result] = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $match: { 'order.status': { $in: COUNTED_STATUSES } } },
      {
        $lookup: {
          from: 'variants',
          localField: 'variantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: '$variant' },
      {
        $lookup: {
          from: 'products',
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'factions',
          localField: 'product.factionId',
          foreignField: '_id',
          as: 'faction',
        },
      },
      { $unwind: '$faction' },
      {
        $facet: {
          factions: [
            {
              $group: {
                _id: '$faction._id',
                factionName: { $first: '$faction.name' },
                totalRevenue: { $sum: { $multiply: ['$qty', '$price'] } },
                totalQtySold: { $sum: '$qty' },
              },
            },
            { $sort: { totalRevenue: -1 } },
            {
              $project: {
                _id: 0,
                factionId: '$_id',
                factionName: 1,
                totalRevenue: 1,
                totalQtySold: 1,
              },
            },
          ],
          topProducts: [
            {
              $group: {
                _id: '$product._id',
                productName: { $first: '$product.name' },
                factionName: { $first: '$faction.name' },
                totalRevenue: { $sum: { $multiply: ['$qty', '$price'] } },
                totalQtySold: { $sum: '$qty' },
              },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 0,
                productId: '$_id',
                productName: 1,
                factionName: 1,
                totalRevenue: 1,
                totalQtySold: 1,
              },
            },
          ],
        },
      },
    ]);

    res.json({
      factions: result?.factions || [],
      topProducts: result?.topProducts || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getLowStock(req, res) {
  try {
    const threshold = parsePositiveInt(req.query.threshold, DEFAULT_LOW_STOCK);

    const variants = await Variant.find({ stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .populate({
        path: 'productId',
        select: 'name factionId',
        populate: { path: 'factionId', select: 'name' },
      });

    res.json({
      threshold,
      items: variants.map((variant) => ({
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        productName: variant.productId?.name || '',
        factionName: variant.productId?.factionId?.name || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getSummary(_req, res) {
  try {
    const countedFilter = { status: { $in: COUNTED_STATUSES } };

    const [revenueRow] = await Order.aggregate([
      { $match: countedFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const [totalPendingOrders, totalLowStockCount] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Variant.countDocuments({ stock: { $lte: DEFAULT_LOW_STOCK } }),
    ]);

    res.json({
      totalRevenue: revenueRow?.totalRevenue || 0,
      totalOrders: revenueRow?.totalOrders || 0,
      totalPendingOrders,
      totalLowStockCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getRevenue,
  getBestSellers,
  getLowStock,
  getSummary,
};
