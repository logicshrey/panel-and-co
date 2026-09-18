const Faction = require('../models/Faction');

async function getFactions(_req, res) {
  try {
    const factions = await Faction.find().sort({ name: 1 });
    res.json({ factions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getFactionBySlug(req, res) {
  try {
    const faction = await Faction.findOne({ slug: req.params.slug });
    if (!faction) {
      return res.status(404).json({ message: 'Faction not found' });
    }
    res.json({ faction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getFactions, getFactionBySlug };
