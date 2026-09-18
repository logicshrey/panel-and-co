const { GoogleGenAI, Type } = require('@google/genai');
const Faction = require('../models/Faction');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

const MODEL = 'gemini-3.6-flash';
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 15;
const requestsByIp = new Map();

const searchProductsDeclaration = {
  name: 'search_products',
  description: 'Search the real Panel & Co. catalog before recommending any product.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING },
      factionSlug: { type: Type.STRING },
      maxPrice: { type: Type.NUMBER },
      size: { type: Type.STRING },
      color: { type: Type.STRING },
    },
  },
};

const systemInstruction = `You are Panel & Co.'s shopping assistant. Only recommend products actually returned by the search_products tool: never invent products, names, prices, or availability. You can give short, conversational styling advice using the Aetherguard (sky/energy), Ironclad Core (armored/heavy), and Nightspire (shadow/stealth) aesthetics. Search the catalog before making product recommendations.`;

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function validMessages(messages) {
  return Array.isArray(messages) && messages.length > 0 && messages.every((message) => (
    ['user', 'model'].includes(message.role) && typeof message.content === 'string'
  ));
}

async function searchProducts(args = {}) {
  const filter = {};
  if (args.factionSlug) {
    const faction = await Faction.findOne({ slug: String(args.factionSlug) }).select('_id');
    if (!faction) return [];
    filter.factionId = faction._id;
  }
  if (args.query) filter.name = { $regex: String(args.query), $options: 'i' };
  if (Number.isFinite(Number(args.maxPrice))) filter.basePrice = { $lte: Number(args.maxPrice) };

  if (args.size || args.color) {
    const variantFilter = {};
    if (args.size) variantFilter.size = String(args.size);
    if (args.color) variantFilter.color = String(args.color);
    const variantProductIds = await Variant.find(variantFilter).distinct('productId');
    filter._id = { $in: variantProductIds };
  }

  const products = await Product.find(filter).populate('factionId', 'name slug').sort({ createdAt: -1 }).limit(10);
  const variants = await Variant.find({ productId: { $in: products.map((product) => product._id) } });
  const byProduct = new Map();
  variants.forEach((variant) => {
    const key = String(variant.productId);
    byProduct.set(key, [...(byProduct.get(key) || []), variant]);
  });

  return products.map((product) => {
    const productVariants = byProduct.get(String(product._id)) || [];
    return {
      productId: String(product._id),
      name: product.name,
      factionName: product.factionId?.name || '',
      factionSlug: product.factionId?.slug || '',
      basePrice: product.basePrice,
      image: product.images?.[0] || '',
      availableSizes: [...new Set(productVariants.map((variant) => variant.size))],
      availableColors: [...new Set(productVariants.map((variant) => variant.color))],
    };
  });
}

function responseText(response) {
  return response.text || response.candidates?.[0]?.content?.parts
    ?.filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join('') || '';
}

async function chat(req, res) {
  if (isRateLimited(req.ip)) return res.status(429).json({ message: 'Too many assistant requests. Please try again in a minute.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ message: 'Assistant is not configured yet.' });
  if (!validMessages(req.body.messages)) return res.status(400).json({ message: 'messages must contain user/model content strings' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contents = req.body.messages.slice(-20).map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));
    const config = { systemInstruction, tools: [{ functionDeclarations: [searchProductsDeclaration] }] };
    const productsShown = [];

    for (let turn = 0; turn < 5; turn += 1) {
      const response = await ai.models.generateContent({ model: MODEL, contents, config });
      const functionCalls = response.functionCalls || response.candidates?.[0]?.content?.parts
        ?.filter((part) => part.functionCall)
        .map((part) => part.functionCall) || [];

      if (!functionCalls.length) return res.json({ reply: responseText(response), productsShown });

      contents.push({ role: 'model', parts: response.candidates?.[0]?.content?.parts || functionCalls.map((functionCall) => ({ functionCall })) });
      const responses = [];
      for (const functionCall of functionCalls) {
        if (functionCall.name !== 'search_products') continue;
        const products = await searchProducts(functionCall.args);
        productsShown.push(...products.filter((product) => !productsShown.some((shown) => String(shown.productId) === String(product.productId))));
        responses.push({
          functionResponse: {
            id: functionCall.id,
            name: functionCall.name,
            response: { products },
          },
        });
      }
      contents.push({ role: 'user', parts: responses });
    }

    return res.status(502).json({ message: 'Assistant could not complete that request. Please try again.' });
  } catch (error) {
    const status = error.status || error.response?.status;
    if (status === 429) return res.status(429).json({ message: 'Assistant is a bit busy, try again in a moment' });
    console.error('Assistant error:', error.message);
    return res.status(500).json({ message: 'Assistant could not respond right now.' });
  }
}

module.exports = { chat, searchProductsDeclaration };
