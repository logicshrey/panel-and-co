const mongoose = require('mongoose');

const factionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    palette: {
      type: {
        primary: { type: String, required: true },
        secondary: { type: String, required: true },
        accent: { type: String, required: true },
      },
      required: true,
    },
    description: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Faction', factionSchema);
