const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const controller = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/products', controller.getAdminProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);
router.post('/products/:id/variants', controller.createVariant);
router.put('/variants/:id', controller.updateVariant);
router.delete('/variants/:id', controller.deleteVariant);
router.get('/orders', controller.getAdminOrders);
router.put('/orders/:id/status', controller.updateOrderStatus);

module.exports = router;
