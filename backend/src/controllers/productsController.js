const pool = require('../config/database');

/**
 * Get all products with pagination, filtering, and search
 */
async function getProducts(req, res) {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM products WHERE is_available = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category_id = (SELECT id FROM categories WHERE name = $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    params.push(parseInt(limit), offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE is_available = true';
    const countParams = [];

    if (category) {
      countParams.push(category);
      countQuery += ` AND category_id = (SELECT id FROM categories WHERE name = $${countParams.length})`;
    }

    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (name ILIKE $${countParams.length} OR description ILIKE $${countParams.length})`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return res.status(200).json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch products',
    });
  }
}

/**
 * Get product by ID
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND is_available = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      product: result.rows[0],
    });
  } catch (err) {
    console.error('Get product by ID error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch product',
    });
  }
}

/**
 * Create new product (admin only)
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, category_id, image_url, stock_quantity } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product name and price are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, price, category_id || null, image_url || null, stock_quantity || 0]
    );

    return res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0],
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create product',
    });
  }
}

/**
 * Update product (admin only)
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, stock_quantity, is_available } = req.body;

    const updates = [];
    const params = [];
    let paramNum = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramNum}`);
      params.push(name);
      paramNum++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramNum}`);
      params.push(description);
      paramNum++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramNum}`);
      params.push(price);
      paramNum++;
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${paramNum}`);
      params.push(category_id);
      paramNum++;
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramNum}`);
      params.push(image_url);
      paramNum++;
    }
    if (stock_quantity !== undefined) {
      updates.push(`stock_quantity = $${paramNum}`);
      params.push(stock_quantity);
      paramNum++;
    }
    if (is_available !== undefined) {
      updates.push(`is_available = $${paramNum}`);
      params.push(is_available);
      paramNum++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramNum} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update product',
    });
  }
}

/**
 * Delete product (soft delete - set is_available to false)
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete product',
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
