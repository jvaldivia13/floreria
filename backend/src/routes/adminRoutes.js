const express = require('express');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin verification
router.use(verifyAdmin);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
