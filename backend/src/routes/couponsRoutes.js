const express = require('express');
const { createCoupon, validateCoupon, getCoupons, updateCoupon } = require('../controllers/couponsController');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', verifyAdmin, createCoupon);
router.get('/', verifyAdmin, getCoupons);
router.put('/:id', verifyAdmin, updateCoupon);

module.exports = router;
