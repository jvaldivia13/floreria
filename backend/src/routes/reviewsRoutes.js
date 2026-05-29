const express = require('express');
const { createReview, getReviewsByProduct } = require('../controllers/reviewsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Protected route for creating reviews
router.post('/', verifyToken, createReview);

// Public route for getting reviews
router.get('/product/:product_id', getReviewsByProduct);

module.exports = router;
