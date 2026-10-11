const express = require('express');
const { body, validationResult } = require('express-validator');
const { run, all, get } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { calculateTotals } = require('./cart');

const router = express.Router();

router.get('/checkout', requireAuth, async (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) {
    req.session.flash = { type: 'warning', message: 'Your cart is empty.' };
    return res.redirect('/menu');
  }

  const profile = await get('SELECT phone, address FROM users WHERE id = ?', [req.session.user.id]);

  return res.render('checkout', {
    title: 'Checkout | Khaja-Adda',
    cart,
    totals: calculateTotals(cart),
    profile
  });
});

router.post(
  '/checkout',
  requireAuth,
  [
    body('phone').trim().isLength({ min: 7 }).withMessage('Phone number is required'),
    body('deliveryAddress').trim().isLength({ min: 5 }).withMessage('Delivery address is required'),
    body('paymentMethod').isIn(['Cash on Delivery', 'eSewa', 'Khalti']).withMessage('Invalid payment method')
  ],
  async (req, res, next) => {
    try {
      const cart = req.session.cart || [];
      if (!cart.length) {
        req.session.flash = { type: 'warning', message: 'Your cart is empty.' };
        return res.redirect('/menu');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.session.flash = { type: 'danger', message: errors.array()[0].msg };
        return res.redirect('/orders/checkout');
      }

      const totals = calculateTotals(cart);
      const { phone, deliveryAddress, paymentMethod } = req.body;

      const orderResult = await run(
        `INSERT INTO orders (user_id, total_amount, delivery_address, phone, payment_method)
         VALUES (?, ?, ?, ?, ?)`,
        [req.session.user.id, totals.total, deliveryAddress, phone, paymentMethod]
      );

      for (const item of cart) {
        // eslint-disable-next-line no-await-in-loop
        await run(
          `INSERT INTO order_items (order_id, food_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderResult.lastID, item.foodId, item.quantity, item.price]
        );
      }

      req.session.cart = [];
      req.session.flash = { type: 'success', message: `Order #${orderResult.lastID} placed successfully.` };
      return res.redirect(`/orders/track/${orderResult.lastID}`);
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/my-orders', requireAuth, async (req, res, next) => {
  try {
    const orders = await all(
      `SELECT id, total_amount, status, payment_method, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.session.user.id]
    );

    res.render('orders', {
      title: 'My Orders | Khaja-Adda',
      orders
    });
  } catch (error) {
    next(error);
  }
});

router.get('/track/:orderId', requireAuth, async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId);
    const order = await get(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, req.session.user.id]
    );

    if (!order) {
      req.session.flash = { type: 'danger', message: 'Order not found.' };
      return res.redirect('/orders/my-orders');
    }

    const items = await all(
      `SELECT order_items.*, foods.name, foods.image
       FROM order_items
       JOIN foods ON foods.id = order_items.food_id
       WHERE order_items.order_id = ?`,
      [orderId]
    );

    return res.render('track-order', {
      title: `Track Order #${orderId} | Khaja-Adda`,
      order,
      items,
      orderSteps: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered']
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
