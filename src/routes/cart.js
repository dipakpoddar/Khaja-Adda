const express = require('express');

const router = express.Router();

function calculateTotals(cart = []) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 60 : 0;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee
  };
}

router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', {
    title: 'Your Cart | Khaja-Adda',
    cart,
    totals: calculateTotals(cart)
  });
});

router.post('/update/:foodId', (req, res) => {
  const foodId = Number(req.params.foodId);
  const quantity = Math.max(1, Number(req.body.quantity) || 1);

  req.session.cart = (req.session.cart || []).map((item) =>
    item.foodId === foodId
      ? {
          ...item,
          quantity
        }
      : item
  );

  req.session.flash = { type: 'success', message: 'Cart updated successfully.' };
  res.redirect('/cart');
});

router.post('/remove/:foodId', (req, res) => {
  const foodId = Number(req.params.foodId);
  req.session.cart = (req.session.cart || []).filter((item) => item.foodId !== foodId);
  req.session.flash = { type: 'success', message: 'Item removed from cart.' };
  res.redirect('/cart');
});

router.post('/clear', (req, res) => {
  req.session.cart = [];
  req.session.flash = { type: 'success', message: 'Cart cleared.' };
  res.redirect('/cart');
});

module.exports = {
  router,
  calculateTotals
};
