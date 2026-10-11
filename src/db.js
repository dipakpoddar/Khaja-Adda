const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'data', 'khaja_adda.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      return resolve(this);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows);
    });
  });

async function seedData() {
  const categories = [
    ['Momo', 'Steamed and fried momo with authentic Nepali chutney', 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=900&q=80'],
    ['Thakali Set', 'Traditional thakali khana set with gundruk and achar', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'],
    ['Snacks', 'Evening khaja favorites for tea time', 'https://images.unsplash.com/photo-1626203319130-0f6b2d6f2cb6?auto=format&fit=crop&w=900&q=80'],
    ['Drinks', 'Refreshing lassi, chai and cool drinks', 'https://images.unsplash.com/photo-1563223771-375783ee91ad?auto=format&fit=crop&w=900&q=80']
  ];

  const foods = [
    [1, 'Buff Momo', '10 pcs juicy buff momo with spicy achar', 320, 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80', 1],
    [1, 'Jhol Momo', 'Momo in warm tomato-sesame jhol soup', 360, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 1],
    [2, 'Veg Thakali Set', 'Rice, dal, tarkari, alu achar, saag, and papad', 550, 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80', 1],
    [2, 'Chicken Thakali Set', 'Classic thali with chicken curry and local sides', 680, 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80', 1],
    [3, 'Chatpate', 'Street-style spicy chatpate with crunchy mix', 180, 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=800&q=80', 1],
    [3, 'Sel Roti Combo', 'Traditional sel roti with aloo ko achar', 230, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 1],
    [4, 'Masala Chiya', 'Hot Nepali milk tea with cardamom and ginger', 90, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80', 1],
    [4, 'Mango Lassi', 'Chilled mango lassi blended fresh', 160, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80', 1]
  ];

  const categoryCount = await get('SELECT COUNT(*) AS count FROM categories');
  if (!categoryCount || categoryCount.count === 0) {
    for (const category of categories) {
      // eslint-disable-next-line no-await-in-loop
      await run('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)', category);
    }
  }

  const foodCount = await get('SELECT COUNT(*) AS count FROM foods');
  if (!foodCount || foodCount.count === 0) {
    for (const food of foods) {
      // eslint-disable-next-line no-await-in-loop
      await run('INSERT INTO foods (category_id, name, description, price, image, is_available) VALUES (?, ?, ?, ?, ?, ?)', food);
    }
  }

  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@khajaadda.com']);
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['Khaja Admin', 'admin@khajaadda.com', hash, '9800000000', 'Kathmandu', 'admin']
    );
  }
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    is_available INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Placed',
    delivery_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_id) REFERENCES foods(id)
  )`);

  await seedData();
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
