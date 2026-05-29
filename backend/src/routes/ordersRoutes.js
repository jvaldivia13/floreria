const express = require('express');
const { createOrder, getOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/ordersController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/admin/all', verifyAdmin, getAllOrders);
router.patch('/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;
