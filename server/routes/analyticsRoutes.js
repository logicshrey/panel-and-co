const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getRevenue,
  getBestSellers,
  getLowStock,
  getSummary,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/revenue', getRevenue);
router.get('/best-sellers', getBestSellers);
router.get('/low-stock', getLowStock);
router.get('/summary', getSummary);

module.exports = router;
