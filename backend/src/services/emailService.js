const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(user, order, items) {
  try {
    const itemsList = items
      .map(item => `- ${item.nombre} x${item.cantidad}: S/. ${item.subtotal}`)
      .join('\n');

    const htmlContent = `
      <h1>Confirmación de Orden</h1>
      <p>Hola ${user.nombre},</p>
      <p>Tu orden #${order.id} ha sido creada exitosamente.</p>
      
      <h2>Detalles de la Orden</h2>
      <p><strong>Número de Orden:</strong> ${order.id}</p>
      <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
      <p><strong>Total:</strong> S/. ${order.total}</p>
      
      <h2>Productos</h2>
      <pre>${itemsList}</pre>
      
      <h2>Detalles de Entrega</h2>
      <p><strong>Dirección:</strong> ${order.direccion_entrega}</p>
      <p><strong>Fecha Esperada:</strong> ${new Date(order.fecha_entrega_esperada).toLocaleDateString()}</p>
      
      <p>Gracias por tu compra en Florería Tulipanes.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@floreria.com',
      to: user.email,
      subject: `Confirmación de Orden #${order.id}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
    return true;
  } catch (err) {
    console.error('Error sending order confirmation email:', err);
    return false;
  }
}

/**
 * Send order status update email
 */
async function sendOrderStatusUpdate(user, order, newStatus) {
  try {
    const statusMessages = {
      'pendiente': 'Tu orden está pendiente de procesamiento',
      'procesando': 'Tu orden está siendo procesada',
      'enviado': 'Tu orden ha sido enviada',
      'entregado': 'Tu orden ha sido entregada',
      'cancelado': 'Tu orden ha sido cancelada',
    };

    const htmlContent = `
      <h1>Actualización de Orden</h1>
      <p>Hola ${user.nombre},</p>
      <p>${statusMessages[newStatus] || 'Tu orden ha sido actualizada'}.</p>
      
      <p><strong>Número de Orden:</strong> ${order.id}</p>
      <p><strong>Nuevo Estado:</strong> ${newStatus}</p>
      
      <p>Puedes ver más detalles en tu cuenta.</p>
      <p>Gracias por tu compra en Florería Tulipanes.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@floreria.com',
      to: user.email,
      subject: `Actualización de Orden #${order.id}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${user.email}`);
    return true;
  } catch (err) {
    console.error('Error sending status update email:', err);
    return false;
  }
}

/**
 * Send registration welcome email
 */
async function sendWelcomeEmail(user) {
  try {
    const htmlContent = `
      <h1>¡Bienvenido a Florería Tulipanes!</h1>
      <p>Hola ${user.nombre},</p>
      <p>Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a comprar las más hermosas flores.</p>
      
      <p><strong>Datos de tu cuenta:</strong></p>
      <p>Email: ${user.email}</p>
      
      <p>¡Gracias por unirte a nosotros!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@floreria.com',
      to: user.email,
      subject: 'Bienvenido a Florería Tulipanes',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return false;
  }
}

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
};
