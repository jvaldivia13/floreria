const pool = require('../config/database');

/**
 * Add product to wishlist
 */
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product ID is required',
      });
    }

    // Insert or ignore if already exists
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, product_id]
    );

    return res.status(201).json({
      message: 'Product added to wishlist',
    });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add to wishlist',
    });
  }
}

/**
 * Get user's wishlist
 */
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.*
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1 AND p.activo = true
       ORDER BY w.fecha_agregado DESC`,
      [userId]
    );

    return res.status(200).json({
      wishlist: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch wishlist',
    });
  }
}

/**
 * Remove product from wishlist
 */
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [userId, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found in wishlist',
      });
    }

    return res.status(200).json({
      message: 'Product removed from wishlist',
    });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove from wishlist',
    });
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
