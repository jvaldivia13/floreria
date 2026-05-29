const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.put('/:itemId', updateCartItem);

module.exports = router;
