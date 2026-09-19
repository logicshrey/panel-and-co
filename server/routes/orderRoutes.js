const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getOrder,
  getOrders,
  confirmOrder,
  verifyPayment,
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect);
router.route('/').post(createOrder).get(getOrders);
router.post('/:id/confirm', confirmOrder);
router.post('/:id/verify-payment', verifyPayment);
router.get('/:id', getOrder);

module.exports = router;
