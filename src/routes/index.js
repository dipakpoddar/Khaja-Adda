const express = require('express');
const { all } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const featuredFoods = await all(
      `SELECT foods.*, categories.name AS category_name
       FROM foods
       JOIN categories ON categories.id = foods.category_id
       WHERE foods.is_available = 1
       ORDER BY foods.created_at DESC
       LIMIT 6`
    );
    const categories = await all('SELECT * FROM categories ORDER BY name ASC');

    res.render('home', {
      title: 'Khaja-Adda | Nepali Food Delivery',
      featuredFoods,
      categories
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
