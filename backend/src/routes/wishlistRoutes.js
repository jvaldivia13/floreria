const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(verifyToken);

router.post('/', addToWishlist);
router.get('/', getWishlist);
router.delete('/:product_id', removeFromWishlist);

module.exports = router;
