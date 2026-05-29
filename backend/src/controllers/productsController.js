const pool = require('../config/database');

/**
 * Get all products with pagination, filtering, and search
 */
async function getProducts(req, res) {
  try {
    const { page = 1, limit = 20, categoria, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM products WHERE activo = true';
    const params = [];

    if (categoria) {
      params.push(categoria);
      query += ` AND categoria_id = (SELECT id FROM categories WHERE nombre = $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
    }

    params.push(parseInt(limit), offset);
    query += ` ORDER BY fecha_creacion DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE activo = true';
    const countParams = [];

    if (categoria) {
      countParams.push(categoria);
      countQuery += ` AND categoria_id = (SELECT id FROM categories WHERE nombre = $${countParams.length})`;
    }

    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (nombre ILIKE $${countParams.length} OR descripcion ILIKE $${countParams.length})`;
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
      'SELECT * FROM products WHERE id = $1 AND activo = true',
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
    const { nombre, descripcion, precio, categoria_id, foto_url, stock } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Product name and price are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO products (nombre, descripcion, precio, categoria_id, foto_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, descripcion || null, precio, categoria_id || null, foto_url || null, stock || 0]
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
    const { nombre, descripcion, precio, categoria_id, foto_url, stock, activo } = req.body;

    const updates = [];
    const params = [];
    let paramNum = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramNum}`);
      params.push(nombre);
      paramNum++;
    }
    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramNum}`);
      params.push(descripcion);
      paramNum++;
    }
    if (precio !== undefined) {
      updates.push(`precio = $${paramNum}`);
      params.push(precio);
      paramNum++;
    }
    if (categoria_id !== undefined) {
      updates.push(`categoria_id = $${paramNum}`);
      params.push(categoria_id);
      paramNum++;
    }
    if (foto_url !== undefined) {
      updates.push(`foto_url = $${paramNum}`);
      params.push(foto_url);
      paramNum++;
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramNum}`);
      params.push(stock);
      paramNum++;
    }
    if (activo !== undefined) {
      updates.push(`activo = $${paramNum}`);
      params.push(activo);
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
 * Delete product (soft delete - set activo to false)
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
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
