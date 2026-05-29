const express = require('express');
const { getDashboardSummary, getSalesReport, getTopProducts, getInventoryStatus, getCustomers } = require('../controllers/reportsController');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// All report routes require admin verification
router.use(verifyAdmin);

router.get('/dashboard', getDashboardSummary);
router.get('/sales', getSalesReport);
router.get('/top-products', getTopProducts);
router.get('/inventory', getInventoryStatus);
router.get('/customers', getCustomers);

module.exports = router;
