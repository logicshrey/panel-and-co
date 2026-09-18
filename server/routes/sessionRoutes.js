const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const controller = require('../controllers/sessionController');

const router = express.Router();

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.verify(header.slice(7).trim(), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password_hash');
  } catch {
    // A missing or invalid optional token is treated as a guest session join.
  }
  return next();
}

router.post('/', protect, controller.createSession);
router.get('/:code', controller.getSession);
router.post('/:code/join', optionalAuth, controller.joinSession);
router.post('/:code/end', protect, controller.endSession);
router.post('/:code/ping', controller.pingSession);
router.post('/:code/cart', controller.addCartItem);
router.put('/:code/cart/:itemId', controller.updateCartItem);
router.delete('/:code/cart/:itemId', controller.deleteCartItem);

module.exports = router;
