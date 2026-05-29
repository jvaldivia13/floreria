const pool = require('../config/database');

/**
 * Handle payment webhook from YAPE or Plin
 * Updates order status based on payment status
 */
async function handlePaymentWebhook(paymentData) {
  try {
    const { order_id, status, referencia_pago } = paymentData;

    if (!order_id || !status) {
      return {
        success: false,
        message: 'Missing required fields: order_id, status',
      };
    }

    let newStatus = 'pendiente';

    if (status === 'completed' || status === 'success') {
      newStatus = 'procesando';
    } else if (status === 'failed' || status === 'cancelled') {
      newStatus = 'cancelado';
    } else if (status === 'pending') {
      newStatus = 'pendiente';
    }

    // Update order status
    const result = await pool.query(
      `UPDATE orders
       SET estado = $1, referencia_pago = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, estado`,
      [newStatus, referencia_pago || null, order_id]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Order not found',
      };
    }

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: result.rows[0],
    };
  } catch (err) {
    console.error('Payment webhook error:', err);
    return {
      success: false,
      message: 'Failed to process webhook',
      error: err.message,
    };
  }
}

module.exports = {
  handlePaymentWebhook,
};
