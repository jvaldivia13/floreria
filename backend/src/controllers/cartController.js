const pool = require('../config/database');

/**
 * Add product to cart
 */
async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { product_id, cantidad = 1 } = req.body;

    if (!product_id || cantidad < 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product ID and valid quantity are required',
      });
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT id FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart_items SET cantidad = cantidad + $1 WHERE user_id = $2 AND product_id = $3',
        [cantidad, userId, product_id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, cantidad) VALUES ($1, $2, $3)',
        [userId, product_id, cantidad]
      );
    }

    return res.status(200).json({
      message: 'Product added to cart',
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add to cart',
    });
  }
}

/**
 * Get user's cart
 */
async function getCart(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT ci.id, p.id as product_id, p.name, p.price, ci.cantidad,
              (p.price * ci.cantidad) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const items = result.rows;
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    const shipping = 20;
    const total = subtotal + shipping;

    return res.status(200).json({
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cart',
    });
  }
}

/**
 * Remove item from cart
 */
async function removeFromCart(req, res) {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [itemId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cart item not found',
      });
    }

    return res.status(200).json({
      message: 'Item removed from cart',
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove from cart',
    });
  }
}

/**
 * Update cart item quantity
 */
async function updateCartItem(req, res) {
  try {
    const { itemId } = req.params;
    const { cantidad } = req.body;
    const userId = req.user.id;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Valid quantity is required',
      });
    }

    const result = await pool.query(
      'UPDATE cart_items SET cantidad = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [cantidad, itemId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cart item not found',
      });
    }

    return res.status(200).json({
      message: 'Cart item updated',
      item: result.rows[0],
    });
  } catch (err) {
    console.error('Update cart item error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update cart item',
    });
  }
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
};
