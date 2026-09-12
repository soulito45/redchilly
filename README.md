# New Red Chilly

Restaurant ordering website and admin dashboard for New Red Chilly, Mira Road.

## Features

- Responsive restaurant website with menu search and category filters
- Veg, Non-Veg, and All dietary filters
- Menu images, item detail modal, favorites, and availability support
- Shopping cart and order confirmation
- Cash on Delivery and Razorpay payment flow
- Delivery-area validation, pincode checks, delivery charges, and coupons
- WhatsApp ordering support
- Customer profiles, order history, reorder support, and loyalty data
- Table reservations, reviews, ratings, restaurant gallery, offers, and combos
- Order status tracking and notification support
- Refined admin dashboard with orders, enquiries, analytics, reservations, and menu availability
- SEO and local restaurant metadata

Progressive Web App functionality is intentionally not included.

## Requirements

- Node.js 18 or later
- npm

## Installation

```bash
npm install
```

## Running locally

Start the server:

```bash
npm start
```

Start in watch mode during development:

```bash
npm run dev
```

The public website is available at:

```text
http://localhost:3000
```

## Admin dashboard

Open:

```text
http://localhost:3000/admin
```

Default development credentials:

```text
Username: admin
Password: redchilly123
```

For production, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

## Razorpay configuration

Online payments use Razorpay. Configure the credentials through environment variables; do not commit them to the repository:

```text
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

If Razorpay is not configured, Cash on Delivery remains available and the online payment endpoint returns a clear configuration response.

## API overview

Public endpoints include:

```text
GET  /api/restaurant
GET  /api/menu
GET  /api/menu/:id
GET  /api/gallery
GET  /api/offers
GET  /api/settings
GET  /api/reviews
POST /api/reviews
POST /api/orders
GET  /api/orders/:id
POST /api/reservations
GET  /api/favorites
PUT  /api/favorites
POST /api/enquiries
```

Additional APIs support delivery validation, coupons, profiles, notifications, Razorpay payments, order status tracking, and admin analytics.

## Data storage

Development data is stored in `data/store.json`. This includes orders, enquiries, favorites, reservations, profiles, notifications, and settings.

For production use, replace the JSON store with a database and configure secure production authentication.

## Project structure

```text
server.js          Express API and static-file server
data/seedData.js   Restaurant and menu seed data
data/store.json    Local development data store
public/index.html  Public restaurant website
public/app.js      Public website behavior
public/styles.css  Public website styles
public/admin.html  Admin dashboard
public/admin.js    Admin dashboard behavior
```

## Validation

The project can be syntax-checked with:

```bash
node --check server.js
node --check public/app.js
node --check public/admin.js
```
