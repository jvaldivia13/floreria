const pool = require('../config/database');

/**
 * Create a review for a product
 */
async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { product_id, rating, comentario } = req.body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product ID and rating (1-5) are required',
      });
    }

    // Check if user has purchased this product
    const purchaseCheck = await pool.query(
      `SELECT 1 FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.estado = $3`,
      [userId, product_id, 'entregado']
    );

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Can only review products you have purchased',
      });
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comentario) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, product_id, rating, comentario || null]
    );

    return res.status(201).json({
      message: 'Review created successfully',
      review: result.rows[0],
    });
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create review',
    });
  }
}

/**
 * Get reviews for a product
 */
async function getReviewsByProduct(req, res) {
  try {
    const { product_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [product_id]
    );

    const reviews = result.rows;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return res.status(200).json({
      reviews,
      statistics: {
        average_rating: parseFloat(avgRating),
        total_reviews: reviews.length,
      },
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch reviews',
    });
  }
}

module.exports = {
  createReview,
  getReviewsByProduct,
};
