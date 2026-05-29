const pool = require('../config/database');

/**
 * Get dashboard summary with key metrics
 */
async function getDashboardSummary(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Sales today
    const salesToday = await pool.query(
      `SELECT COUNT(*) as total_orders, SUM(total) as total_sales
       FROM orders
       WHERE DATE(created_at) = $1`,
      [today]
    );

    // Pending orders
    const pendingOrders = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE estado = $1',
      ['pendiente']
    );

    // Low stock_quantity products
    const lowStock = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE stock_quantity < 5 AND is_available = true'
    );

    // Total customers
    const customers = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['cliente']
    );

    return res.status(200).json({
      dashboard: {
        orders_today: parseInt(salesToday.rows[0].total_orders || 0),
        sales_today: parseFloat(salesToday.rows[0].total_sales || 0),
        pending_orders: parseInt(pendingOrders.rows[0].count || 0),
        low_stock_quantity_items: parseInt(lowStock.rows[0].count || 0),
        total_customers: parseInt(customers.rows[0].count || 0),
      },
    });
  } catch (err) {
    console.error('Get dashboard error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch dashboard',
    });
  }
}

/**
 * Get sales report for date range
 */
async function getSalesReport(req, res) {
  try {
    const { start_date, end_date } = req.query;

    let query = `SELECT DATE(created_at) as fecha, COUNT(*) as pedidos, SUM(total) as total
                 FROM orders
                 WHERE estado IN ('procesando', 'enviado', 'entregado')`;
    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND created_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND created_at <= $${params.length}`;
    }

    query += ' GROUP BY DATE(created_at) ORDER BY fecha DESC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      sales_report: result.rows.map(row => ({
        fecha: row.fecha,
        pedidos: parseInt(row.pedidos),
        total: parseFloat(row.total || 0),
      })),
    });
  } catch (err) {
    console.error('Get sales report error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch sales report',
    });
  }
}

/**
 * Get top products by sales
 */
async function getTopProducts(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, SUM(oi.cantidad) as total_vendido, SUM(oi.subtotal) as ingresos
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY total_vendido DESC
       LIMIT 10`
    );

    return res.status(200).json({
      top_products: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        total_vendido: parseInt(row.total_vendido),
        ingresos: parseFloat(row.ingresos || 0),
      })),
    });
  } catch (err) {
    console.error('Get top products error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch top products',
    });
  }
}

/**
 * Get inventory status
 */
async function getInventoryStatus(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, stock_quantity,
              CASE
                WHEN stock_quantity = 0 THEN 'Sin stock_quantity'
                WHEN stock_quantity < 5 THEN 'Bajo stock_quantity'
                ELSE 'Disponible'
              END as estado
       FROM products
       WHERE is_available = true
       ORDER BY stock_quantity ASC`
    );

    return res.status(200).json({
      inventory: result.rows,
    });
  } catch (err) {
    console.error('Get inventory error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch inventory',
    });
  }
}

/**
 * Get customers list with order history
 */
async function getCustomers(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, COUNT(o.id) as total_ordenes, SUM(o.total) as total_gastado
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = $1
       GROUP BY u.id
       ORDER BY total_ordenes DESC
       LIMIT $2 OFFSET $3`,
      ['cliente', parseInt(limit), offset]
    );

    return res.status(200).json({
      customers: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        total_ordenes: parseInt(row.total_ordenes || 0),
        total_gastado: parseFloat(row.total_gastado || 0),
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get customers error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch customers',
    });
  }
}

module.exports = {
  getDashboardSummary,
  getSalesReport,
  getTopProducts,
  getInventoryStatus,
  getCustomers,
};
