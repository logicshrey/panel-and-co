const nodemailer = require('nodemailer');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function transporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendOrderConfirmationEmail({ order, user }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Order email skipped: EMAIL_USER or EMAIL_PASS is not configured');
    return false;
  }

  try {
    const items = order.items || [];
    const address = order.shippingAddress || {};
    const itemRows = items.map((item) => `<li>${escapeHtml(item.variantId?.productId?.name || 'Product')} × ${item.qty} — ₹${item.price * item.qty}</li>`).join('');
    const delivery = [address.line1, address.line2, address.city, address.state, address.pincode, address.phone]
      .filter(Boolean).map(escapeHtml).join('<br>');
    await transporter().sendMail({
      from: `Panel & Co. <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Panel & Co. order ${order._id} confirmed`,
      html: `<h1>Thanks for your order</h1><p>Order ID: ${escapeHtml(order._id)}</p><p>Payment method: ${escapeHtml(order.paymentMethod)}</p><ul>${itemRows}</ul><p><strong>Total: ₹${order.total}</strong></p><p><strong>Shipping address</strong><br>${delivery}</p>`,
    });
    return true;
  } catch (error) {
    console.error('Order confirmation email failed:', error.message);
    return false;
  }
}

async function sendOrderCancellationEmail({ order, user }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Cancellation email skipped: EMAIL_USER or EMAIL_PASS is not configured');
    return false;
  }

  try {
    await transporter().sendMail({
      from: `Panel & Co. <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Panel & Co. order ${order._id} cancelled`,
      html: `<h1>Your order was cancelled</h1><p>Order ID: ${escapeHtml(order._id)}</p><p>Total: ₹${order.total}</p>`,
    });
    return true;
  } catch (error) {
    console.error('Order cancellation email failed:', error.message);
    return false;
  }
}

module.exports = { sendOrderConfirmationEmail, sendOrderCancellationEmail };
