const pool = require('../config/database');

/**
 * Create new order from cart
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { direccion_entrega, fecha_entrega_esperada, metodo_pago } = req.body;

    if (!direccion_entrega || !fecha_entrega_esperada || !metodo_pago) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Delivery address, expected date, and payment method are required',
      });
    }

    // Get cart items
    const cartResult = await pool.query(
      `SELECT ci.id, p.id as product_id, p.precio, ci.cantidad,
              (p.precio * ci.cantidad) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const items = cartResult.rows;

    if (items.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cart is empty',
      });
    }

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    const descuento = 0; // TODO: Apply coupon logic
    const envio = 20;
    const total = subtotal + envio - descuento;

    // Start transaction - create order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, subtotal, descuento_aplicado, total, estado, metodo_pago,
                           fecha_entrega_esperada, direccion_entrega)
       VALUES ($1, $2, $3, $4, 'pendiente', $5, $6, $7)
       RETURNING id, total, metodo_pago, estado, created_at`,
      [userId, subtotal, descuento, total, metodo_pago, fecha_entrega_esperada, direccion_entrega]
    );

    const order = orderResult.rows[0];

    // Add order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.cantidad, item.precio, item.subtotal]
      );
    }

    // Clear cart
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        total: order.total,
        metodo_pago: order.metodo_pago,
        estado: order.estado,
        created_at: order.created_at,
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create order',
    });
  }
}

/**
 * Get order by ID
 */
async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return res.status(200).json({
      order: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch order',
    });
  }
}

/**
 * Get user's orders
 */
async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      orders: result.rows,
    });
  } catch (err) {
    console.error('Get user orders error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders',
    });
  }
}

/**
 * Get all orders (admin only)
 */
async function getAllOrders(req, res) {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM orders';
    const params = [];

    if (estado) {
      params.push(estado);
      query += ` WHERE estado = $${params.length}`;
    }

    params.push(parseInt(limit), offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    return res.status(200).json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders',
    });
  }
}

/**
 * Update order status (admin only)
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const validStates = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

    if (!validStates.includes(estado)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid status. Allowed values: ${validStates.join(', ')}`,
      });
    }

    const result = await pool.query(
      'UPDATE orders SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      message: 'Order status updated',
      order: result.rows[0],
    });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update order',
    });
  }
}

module.exports = {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
