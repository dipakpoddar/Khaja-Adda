const express = require('express');
const { all, get } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await all('SELECT * FROM categories ORDER BY name ASC');
    const selectedCategory = Number(req.query.category) || null;

    const query = `SELECT foods.*, categories.name AS category_name
      FROM foods
      JOIN categories ON categories.id = foods.category_id
      WHERE foods.is_available = 1
      ${selectedCategory ? 'AND foods.category_id = ?' : ''}
      ORDER BY foods.name ASC`;

    const foods = await all(query, selectedCategory ? [selectedCategory] : []);

    res.render('menu', {
      title: 'Food Menu | Khaja-Adda',
      categories,
      foods,
      selectedCategory
    });
  } catch (error) {
    next(error);
  }
});

router.post('/add-to-cart/:foodId', async (req, res, next) => {
  try {
    const foodId = Number(req.params.foodId);
    const quantity = Math.max(1, Number(req.body.quantity) || 1);
    const food = await get('SELECT id, name, price, image FROM foods WHERE id = ? AND is_available = 1', [foodId]);

    if (!food) {
      req.session.flash = { type: 'danger', message: 'Selected item is not available.' };
      return res.redirect('/menu');
    }

    if (!req.session.cart) req.session.cart = [];

    const existing = req.session.cart.find((item) => item.foodId === food.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      req.session.cart.push({
        foodId: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity
      });
    }

    req.session.flash = { type: 'success', message: `${food.name} added to cart.` };
    return res.redirect('/menu');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
