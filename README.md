# Khaja-Adda

Khaja-Adda is a complete **Online Food Delivery Management System** with a modern Nepali-themed UI, user ordering flow, order tracking, and an admin dashboard.

## Features

### Customer Side
- Nepali-themed responsive homepage
- Food menu with category filter
- Shopping cart (add/update/remove/clear)
- User registration and login
- Checkout and order placement
- Order history and live order tracking view

### Admin Side
- Admin login-protected dashboard
- View order statistics and recent orders
- Manage food items (add/update/delete and availability)
- Manage order statuses (Placed, Preparing, Out for Delivery, Delivered, Cancelled)

### Technical
- Backend with **Node.js + Express**
- Server-rendered frontend using **EJS + Bootstrap 5**
- Database with **SQLite3**
- Session-based authentication using **express-session + connect-sqlite3**
- Input validation with **express-validator**

---

## Project Structure

```
Khaja-Adda/
├── src/
│   ├── app.js
│   ├── db.js
│   ├── data/
│   ├── middleware/
│   │   └── auth.js
│   ├── public/
│   │   └── css/style.css
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── index.js
│   │   ├── menu.js
│   │   └── orders.js
│   └── views/
│       ├── admin/
│       ├── auth/
│       └── partials/
├── package.json
└── README.md
```

---

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm

---

## Setup Instructions

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <your-repo-url>
   cd Khaja-Adda
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app**
   ```bash
   npm start
   ```

4. Open in browser:
   ```
   http://localhost:3000
   ```

> On first run, SQLite database tables and seed data are created automatically.

---

## Default Admin Login

- **Email:** `admin@khajaadda.com`
- **Password:** `admin123`

Use this account to access:
- `/admin`
- `/admin/foods`
- `/admin/orders`

---

## Available Scripts

- `npm start` → start production server
- `npm run dev` → run with Node watch mode
- `npm test` → placeholder test command

---

## Database

SQLite database files are created at:

- `src/data/khaja_adda.db` (application data)
- `src/data/sessions.db` (session store)

These files are ignored via `.gitignore`.

---

## Future Improvements

- Add API endpoints for mobile clients
- Integrate online payment gateway callbacks
- Add unit/integration test suite
- Add role-based permissions for multiple admin users

