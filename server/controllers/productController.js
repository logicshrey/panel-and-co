const Faction = require('../models/Faction');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

function toArray(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function sortSpec(sort) {
  if (sort === 'price' || sort === 'price-asc') return { basePrice: 1 };
  if (sort === 'price-desc') return { basePrice: -1 };
  return { createdAt: -1 };
}

async function getProducts(req, res) {
  try {
    const factions = toArray(req.query.faction);
    const sizes = toArray(req.query.size);
    const colors = toArray(req.query.color);
    const { category, minPrice, maxPrice, sort } = req.query;

    const filter = {};

    if (factions.length) {
      const docs = await Faction.find({ slug: { $in: factions } }).select('_id');
      filter.factionId = { $in: docs.map((d) => d._id) };
    }

    if (category) {
      filter.name = { $regex: String(category), $options: 'i' };
    }

    if (minPrice !== undefined && minPrice !== '') {
      filter.basePrice = { ...filter.basePrice, $gte: Number(minPrice) };
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      filter.basePrice = { ...filter.basePrice, $lte: Number(maxPrice) };
    }

    if (sizes.length || colors.length) {
      const variantFilter = {};
      if (sizes.length) variantFilter.size = { $in: sizes };
      if (colors.length) variantFilter.color = { $in: colors };
      const variants = await Variant.find(variantFilter).select('productId');
      const ids = [...new Set(variants.map((v) => String(v.productId)))];
      filter._id = { $in: ids };
    }

    const products = await Product.find(filter)
      .populate('factionId', 'name slug')
      .sort(sortSpec(sort));

    const variants = await Variant.find({
      productId: { $in: products.map((product) => product._id) },
    }).sort({ size: 1, color: 1 });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProductFilters(_req, res) {
  try {
    const [sizes, colors] = await Promise.all([
      Variant.distinct('size'),
      Variant.distinct('color'),
    ]);

    res.json({
      sizes: sizes.sort(),
      colors: colors.sort(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate(
      'factionId',
      'name slug palette',
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variants = await Variant.find({ productId: product._id }).sort({
      size: 1,
      color: 1,
    });

    res.json({
      product: {
        ...product.toObject(),
        variants,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getProducts, getProductFilters, getProductById };
