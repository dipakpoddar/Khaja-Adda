const express = require('express');
const { body, validationResult } = require('express-validator');
const { all, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const [orderStats, foodStats] = await Promise.all([
      all('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
      get('SELECT COUNT(*) AS count FROM foods')
    ]);

    const recentOrders = await all(
      `SELECT orders.id, orders.status, orders.total_amount, orders.created_at, users.name AS customer
       FROM orders
       JOIN users ON users.id = orders.user_id
       ORDER BY orders.created_at DESC
       LIMIT 10`
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard | Khaja-Adda',
      orderStats,
      foodStats: foodStats?.count || 0,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

router.get('/foods', async (req, res, next) => {
  try {
    const [foods, categories] = await Promise.all([
      all(
        `SELECT foods.*, categories.name AS category_name
         FROM foods
         JOIN categories ON categories.id = foods.category_id
         ORDER BY foods.created_at DESC`
      ),
      all('SELECT * FROM categories ORDER BY name ASC')
    ]);

    res.render('admin/foods', {
      title: 'Manage Foods | Khaja-Adda',
      foods,
      categories
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/foods',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Food name is required'),
    body('categoryId').isInt({ min: 1 }).withMessage('Category is required'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be greater than 0')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.session.flash = { type: 'danger', message: errors.array()[0].msg };
        return res.redirect('/admin/foods');
      }

      const { name, categoryId, description, price, image, isAvailable } = req.body;
      await run(
        `INSERT INTO foods (category_id, name, description, price, image, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryId, name, description || '', Number(price), image || '', isAvailable ? 1 : 0]
      );

      req.session.flash = { type: 'success', message: 'Food item added.' };
      return res.redirect('/admin/foods');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/foods/:foodId/update', async (req, res, next) => {
  try {
    const foodId = Number(req.params.foodId);
    const existing = await get('SELECT id FROM foods WHERE id = ?', [foodId]);
    if (!existing) {
      req.session.flash = { type: 'danger', message: 'Food not found.' };
      return res.redirect('/admin/foods');
    }

    const { name, categoryId, description, price, image, isAvailable } = req.body;

    await run(
      `UPDATE foods
       SET name = ?, category_id = ?, description = ?, price = ?, image = ?, is_available = ?
       WHERE id = ?`,
      [name, categoryId, description || '', Number(price), image || '', isAvailable ? 1 : 0, foodId]
    );

    req.session.flash = { type: 'success', message: 'Food item updated.' };
    return res.redirect('/admin/foods');
  } catch (error) {
    return next(error);
  }
});

router.post('/foods/:foodId/delete', async (req, res, next) => {
  try {
    await run('DELETE FROM foods WHERE id = ?', [Number(req.params.foodId)]);
    req.session.flash = { type: 'success', message: 'Food item removed.' };
    return res.redirect('/admin/foods');
  } catch (error) {
    return next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await all(
      `SELECT orders.*, users.name AS customer_name
       FROM orders
       JOIN users ON users.id = orders.user_id
       ORDER BY orders.created_at DESC`
    );

    res.render('admin/orders', {
      title: 'Manage Orders | Khaja-Adda',
      orders,
      statuses: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
    });
  } catch (error) {
    next(error);
  }
});

router.post('/orders/:orderId/status', async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;
    const validStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      req.session.flash = { type: 'danger', message: 'Invalid order status.' };
      return res.redirect('/admin/orders');
    }

    await run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);
    req.session.flash = { type: 'success', message: `Order #${orderId} status updated.` };
    return res.redirect('/admin/orders');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
