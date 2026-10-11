const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { get, run } = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login | Khaja-Adda' });
});

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.session.flash = { type: 'danger', message: errors.array()[0].msg };
        return res.redirect('/auth/login');
      }

      const { email, password } = req.body;
      const user = await get('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
      if (!user) {
        req.session.flash = { type: 'danger', message: 'Invalid credentials.' };
        return res.redirect('/auth/login');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        req.session.flash = { type: 'danger', message: 'Invalid credentials.' };
        return res.redirect('/auth/login');
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      req.session.flash = { type: 'success', message: `Welcome back, ${user.name}!` };
      return res.redirect(user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register | Khaja-Adda' });
});

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().isLength({ min: 7 }).withMessage('Phone is required'),
    body('address').trim().isLength({ min: 5 }).withMessage('Address is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.session.flash = { type: 'danger', message: errors.array()[0].msg };
        return res.redirect('/auth/register');
      }

      const { name, email, password, phone, address } = req.body;
      const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        req.session.flash = { type: 'danger', message: 'Email already registered.' };
        return res.redirect('/auth/register');
      }

      const hash = await bcrypt.hash(password, 10);
      await run('INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)', [name, email, hash, phone, address]);
      req.session.flash = { type: 'success', message: 'Registration successful. Please login.' };
      return res.redirect('/auth/login');
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
