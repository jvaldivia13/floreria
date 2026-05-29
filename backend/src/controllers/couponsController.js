const pool = require('../config/database');

/**
 * Create a new coupon (admin only)
 */
async function createCoupon(req, res) {
  try {
    const { codigo, descuento_porcentaje, usos_maximos, fecha_expiracion } = req.body;

    if (!codigo || !descuento_porcentaje) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code and discount percentage are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO coupons (codigo, descuento_porcentaje, usos_maximos, fecha_expiracion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [codigo.toUpperCase(), descuento_porcentaje, usos_maximos || null, fecha_expiracion || null]
    );

    return res.status(201).json({
      message: 'Coupon created successfully',
      coupon: result.rows[0],
    });
  } catch (err) {
    console.error('Create coupon error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create coupon',
    });
  }
}

/**
 * Validate a coupon for use
 */
async function validateCoupon(req, res) {
  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Coupon code is required',
      });
    }

    const result = await pool.query(
      `SELECT * FROM coupons
       WHERE UPPER(codigo) = UPPER($1)
       AND is_available = true
       AND (fecha_expiracion IS NULL OR fecha_expiracion >= CURRENT_DATE)
       AND (usos_maximos IS NULL OR usos_actuales < usos_maximos)`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found, expired, or maximum uses exceeded',
      });
    }

    const coupon = result.rows[0];

    return res.status(200).json({
      message: 'Coupon is valid',
      coupon: {
        id: coupon.id,
        codigo: coupon.codigo,
        descuento_porcentaje: coupon.descuento_porcentaje,
      },
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate coupon',
    });
  }
}

/**
 * Get all coupons (admin only)
 */
async function getCoupons(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );

    return res.status(200).json({
      coupons: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Get coupons error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch coupons',
    });
  }
}

/**
 * Update coupon status (admin only)
 */
async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Active status is required',
      });
    }

    const result = await pool.query(
      'UPDATE coupons SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found',
      });
    }

    return res.status(200).json({
      message: 'Coupon updated successfully',
      coupon: result.rows[0],
    });
  } catch (err) {
    console.error('Update coupon error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update coupon',
    });
  }
}

module.exports = {
  createCoupon,
  validateCoupon,
  getCoupons,
  updateCoupon,
};
