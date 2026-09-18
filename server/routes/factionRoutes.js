const express = require('express');
const {
  getFactions,
  getFactionBySlug,
} = require('../controllers/factionController');

const router = express.Router();

router.get('/', getFactions);
router.get('/:slug', getFactionBySlug);

module.exports = router;
