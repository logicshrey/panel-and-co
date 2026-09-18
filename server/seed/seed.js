require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Faction = require('../models/Faction');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

function placeholder(bg, text, size = '600x600') {
  const hex = bg.replace('#', '');
  return `https://placehold.co/${size}/${hex}/FFFFFF.png?text=${encodeURIComponent(text)}`;
}

function sku(code, size, color) {
  return `${code}-${size}-${color.replace(/\s+/g, '').toUpperCase()}`;
}

const catalog = [
  {
    faction: {
      name: 'Aetherguard',
      slug: 'aetherguard',
      palette: { primary: '#0EA5E9', secondary: '#FFFFFF', accent: '#C0C0C0' },
      description:
        'Sky and energy-based heroes. Lightweight layers built for speed — electric blue, white, and silver.',
    },
    products: [
      {
        name: 'Aether Drift Tee',
        code: 'AG-DRIFT',
        description:
          'Featherweight jersey tee with a sky-arc print across the chest. Made for daily wear and night patrols.',
        basePrice: 1299,
        variants: [
          { size: 'S', color: 'Sky Blue', stock: 28 },
          { size: 'M', color: 'White', stock: 40 },
          { size: 'L', color: 'Silver', stock: 18 },
        ],
      },
      {
        name: 'Voltline Windbreaker',
        code: 'AG-VOLT',
        description:
          'Packable windbreaker with reflective silver piping and a high collar. Blocks wind without the bulk.',
        basePrice: 2499,
        variants: [
          { size: 'M', color: 'Sky Blue', stock: 22 },
          { size: 'L', color: 'White', stock: 16 },
          { size: 'XL', color: 'Silver', stock: 9 },
        ],
      },
      {
        name: 'Cloudstep Lightweight Tee',
        code: 'AG-CLOUD',
        description:
          'Breathable athletic tee with a faint halftone wing mark. Cool against the skin in long flights.',
        basePrice: 1099,
        variants: [
          { size: 'S', color: 'White', stock: 35 },
          { size: 'M', color: 'Sky Blue', stock: 31 },
        ],
      },
      {
        name: 'Ion Halo Windbreaker',
        code: 'AG-HALO',
        description:
          'Cropped windbreaker with an ion-ring graphic on the back. White shell, electric-blue lining.',
        basePrice: 2799,
        variants: [
          { size: 'M', color: 'White', stock: 14 },
          { size: 'L', color: 'Sky Blue', stock: 12 },
          { size: 'XL', color: 'Silver', stock: 7 },
        ],
      },
    ],
  },
  {
    faction: {
      name: 'Ironclad Core',
      slug: 'ironclad-core',
      palette: { primary: '#DC2626', secondary: '#1F2937', accent: '#000000' },
      description:
        'Armored heavy-hitters of the Ironclad Legion. Crimson, gunmetal, and black — hoodies, heavyweight tees, and caps.',
    },
    products: [
      {
        name: 'Ironclad Core Heavyweight Hoodie',
        code: 'IC-CORE',
        description:
          'Flagship hoodie in dense fleece. Embossed legion crest at the chest, ribbed cuffs that stay put.',
        basePrice: 2999,
        variants: [
          { size: 'M', color: 'Crimson', stock: 20 },
          { size: 'L', color: 'Gunmetal', stock: 24 },
          { size: 'XL', color: 'Black', stock: 17 },
        ],
      },
      {
        name: 'Legion Crest Heavy Tee',
        code: 'IC-CREST',
        description:
          'Thick cotton tee that holds its shape. Front crest, cracked-ink print that looks worn in from day one.',
        basePrice: 1599,
        variants: [
          { size: 'S', color: 'Black', stock: 26 },
          { size: 'M', color: 'Crimson', stock: 33 },
          { size: 'L', color: 'Gunmetal', stock: 19 },
        ],
      },
      {
        name: 'Gunmetal Strike Cap',
        code: 'IC-CAP',
        description:
          'Structured six-panel cap with a metal-tone brim and stitched Ironclad mark. One silhouette, two colors.',
        basePrice: 999,
        variants: [
          { size: 'M', color: 'Gunmetal', stock: 42 },
          { size: 'L', color: 'Black', stock: 38 },
        ],
      },
      {
        name: 'Crimson Plate Hoodie',
        code: 'IC-PLATE',
        description:
          'Oversized-shoulder hoodie with panel stitching that reads like armor plates. Heavy, warm, unapologetic.',
        basePrice: 2899,
        variants: [
          { size: 'L', color: 'Crimson', stock: 15 },
          { size: 'XL', color: 'Black', stock: 11 },
        ],
      },
    ],
  },
  {
    faction: {
      name: 'Nightspire',
      slug: 'nightspire',
      palette: { primary: '#581C87', secondary: '#FCD34D', accent: '#1E1B4B' },
      description:
        'Shadow and stealth. Oversized fits and dark-mode drops in deep purple with gold accents.',
    },
    products: [
      {
        name: 'Nightspire Oversized Tee',
        code: 'NS-OVER',
        description:
          'Dropped-shoulder tee in heavy jersey. Gold sigil on the back, almost invisible until the light hits it.',
        basePrice: 1499,
        variants: [
          { size: 'M', color: 'Deep Purple', stock: 27 },
          { size: 'L', color: 'Midnight', stock: 30 },
          { size: 'XL', color: 'Black', stock: 21 },
        ],
      },
      {
        name: 'Shadowdrop Hoodie',
        code: 'NS-DROP',
        description:
          'Boxy hoodie with a gold-thread hood cord and a matte purple shell. Built for night markets and late sets.',
        basePrice: 2699,
        variants: [
          { size: 'M', color: 'Deep Purple', stock: 13 },
          { size: 'L', color: 'Midnight', stock: 18 },
          { size: 'XL', color: 'Black', stock: 10 },
        ],
      },
      {
        name: 'Voidline Oversized Crew',
        code: 'NS-VOID',
        description:
          'Relaxed crewneck with a void-line graphic across the hem. Soft inside, dark outside.',
        basePrice: 1899,
        variants: [
          { size: 'S', color: 'Midnight', stock: 16 },
          { size: 'M', color: 'Deep Purple', stock: 22 },
          { size: 'L', color: 'Black', stock: 14 },
        ],
      },
      {
        name: 'Gold Sigil Dark Drop Tee',
        code: 'NS-SIGIL',
        description:
          'Limited dark-drop tee. Gold foil sigil that cracks slightly after the first wash — intended, not a flaw.',
        basePrice: 1399,
        variants: [
          { size: 'M', color: 'Black', stock: 8 },
          { size: 'L', color: 'Deep Purple', stock: 6 },
        ],
      },
    ],
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<username>')) {
    console.error('Set a real MONGO_URI in server/.env before seeding.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  await Variant.deleteMany({});
  await Product.deleteMany({});
  await Faction.deleteMany({});
  console.log('Cleared Faction, Product, and Variant collections');

  let productCount = 0;
  let variantCount = 0;

  for (const entry of catalog) {
    const { primary } = entry.faction.palette;
    const faction = await Faction.create({
      ...entry.faction,
      bannerImage: placeholder(primary, entry.faction.name, '1200x400'),
    });

    for (const item of entry.products) {
      const product = await Product.create({
        name: item.name,
        factionId: faction._id,
        description: item.description,
        basePrice: item.basePrice,
        images: [
          placeholder(primary, item.name),
          placeholder(entry.faction.palette.accent, `${item.name} alt`),
        ],
      });
      productCount += 1;

      const variants = item.variants.map((v) => ({
        productId: product._id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: sku(item.code, v.size, v.color),
      }));

      await Variant.insertMany(variants);
      variantCount += variants.length;
    }
  }

  console.log(
    `Seeded ${catalog.length} factions, ${productCount} products, ${variantCount} variants`,
  );

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
