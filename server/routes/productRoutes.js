const express = require('express');
const {
  getProducts,
  getProductFilters,
  getProductById,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/filters', getProductFilters);
router.get('/:id', getProductById);

module.exports = router;
