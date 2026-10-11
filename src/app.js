const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const methodOverride = require('method-override');
const { initDb } = require('./db');

const homeRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const { router: cartRoutes } = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'data') }),
    secret: process.env.SESSION_SECRET || 'khaja-adda-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const flash = req.session.flash;
  if (flash) {
    res.locals.flash = flash;
    delete req.session.flash;
  } else {
    res.locals.flash = null;
  }

  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = (req.session.cart || []).reduce((total, item) => total + item.quantity, 0);
  next();
});

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found | Khaja-Adda' });
});

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  if (res.headersSent) return next(error);
  req.session.flash = { type: 'danger', message: 'Something went wrong. Please try again.' };
  return res.redirect('back');
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Khaja-Adda server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
