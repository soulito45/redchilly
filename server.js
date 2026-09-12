import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { restaurantData, menuItems } from './data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'redchilly123';

const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'store.json');
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const deliveryAreas = [
  { name: 'Mira Road East', pincodes: ['401107', '401104'], charge: 30 },
  { name: 'Mira Road West', pincodes: ['401101', '401106'], charge: 40 },
  { name: 'Bhayandar', pincodes: ['401105'], charge: 50 },
];
const defaultCoupons = [{ code: 'WELCOME10', type: 'percent', value: 10, minOrder: 300, active: true }];

const ensureStoreFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    const initialStore = { orders: [], enquiries: [], favorites: {}, reservations: [], reviews: [], profiles: {}, coupons: defaultCoupons, menuOverrides: {}, settings: {}, notifications: [] };
    fs.writeFileSync(storePath, JSON.stringify(initialStore, null, 2));
  }
};

const readStore = () => {
  ensureStoreFile();
  const raw = fs.readFileSync(storePath, 'utf8');
  return JSON.parse(raw);
};

const writeStore = (store) => {
  ensureStoreFile();
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
};

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const encoded = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  next();
};

const sendAdminPage = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/restaurant', (req, res) => {
  res.json(restaurantData);
});
app.get('/api/gallery', (req, res) => res.json({ images: [
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=85',
] }));

app.get('/api/menu', (req, res) => {
  const { q, category } = req.query;

  let filtered = menuItems;

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (q) {
    const query = String(q).toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }

  const store = readStore();
  filtered = filtered.map((item) => ({ ...item, available: store.menuOverrides?.[item.id]?.available !== false, customization: item.customization || ['Less spicy', 'Extra sauce'] }));
  res.json({
    categories: [...new Set(menuItems.map((item) => item.category))],
    items: filtered,
    total: filtered.length,
  });
});

app.get('/api/menu/:id', (req, res) => {
  const item = menuItems.find((menuItem) => menuItem.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }

  res.json({ item });
});

app.get('/api/favorites', (req, res) => {
  const visitorId = String(req.query.visitorId || '').trim();

  if (!visitorId) {
    return res.status(400).json({ message: 'A visitor ID is required.' });
  }

  const store = readStore();
  const favoriteIds = Array.isArray(store.favorites?.[visitorId]) ? store.favorites[visitorId] : [];
  res.json({ favoriteIds });
});

app.put('/api/favorites', (req, res) => {
  const { visitorId, itemId, favorite } = req.body;
  const itemExists = menuItems.some((menuItem) => menuItem.id === itemId);

  if (!visitorId || !itemId || typeof favorite !== 'boolean' || !itemExists) {
    return res.status(400).json({ message: 'Valid visitor ID, menu item, and favorite state are required.' });
  }

  const store = readStore();
  store.favorites = store.favorites || {};
  const current = Array.isArray(store.favorites[visitorId]) ? store.favorites[visitorId] : [];
  const next = favorite ? [...new Set([...current, itemId])] : current.filter((id) => id !== itemId);
  store.favorites[visitorId] = next;
  writeStore(store);

  res.json({ favoriteIds: next });
});

app.get('/api/reviews', (req, res) => {
  const store = readStore();
  res.json([...restaurantData.reviews, ...(store.reviews || [])]);
});

app.post('/api/reviews', (req, res) => {
  const { name, text, rating, orderId } = req.body;
  if (!name || !text || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: 'Name, review and a rating from 1 to 5 are required.' });
  const store = readStore();
  const review = { id: `REV-${Date.now()}`, name, text, rating: Number(rating), orderId: orderId || '', createdAt: new Date().toISOString() };
  store.reviews = store.reviews || []; store.reviews.unshift(review); writeStore(store);
  res.status(201).json({ message: 'Thank you for your review.', review });
});

app.get('/api/delivery-areas', (req, res) => res.json({ areas: deliveryAreas }));
app.get('/api/delivery/validate', (req, res) => {
  const pincode = String(req.query.pincode || '').trim();
  const area = deliveryAreas.find((entry) => entry.pincodes.includes(pincode));
  res.json({ valid: Boolean(area), area: area?.name || null, charge: area?.charge || 0 });
});
app.get('/api/coupons', (req, res) => {
  const store = readStore(); res.json({ coupons: (store.coupons || defaultCoupons).filter((coupon) => coupon.active !== false) });
});
app.get('/api/offers', (req, res) => {
  res.json({ offers: menuItems.filter((item) => item.category === 'Special Combos').map((item) => ({ ...item, label: 'Chef special combo' })) });
});
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body; const store = readStore();
  const coupon = (store.coupons || defaultCoupons).find((entry) => entry.active !== false && entry.code.toLowerCase() === String(code || '').trim().toLowerCase());
  if (!coupon || Number(subtotal || 0) < Number(coupon.minOrder || 0)) return res.status(400).json({ message: 'Coupon is invalid or the minimum order is not met.' });
  const discount = coupon.type === 'percent' ? Number(subtotal) * coupon.value / 100 : coupon.value;
  res.json({ coupon, discount: Math.round(discount) });
});

app.get('/api/orders', requireAdminAuth, (req, res) => {
  const store = readStore();
  res.json({ orders: store.orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = readStore().orders.find((entry) => entry.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order });
});

app.patch('/api/orders/:id/status', requireAdminAuth, (req, res) => {
  const store = readStore(); const order = store.orders.find((entry) => entry.id === req.params.id);
  const allowed = ['Received', 'Preparing', 'Ready', 'Out for delivery', 'Delivered', 'Cancelled'];
  if (!order || !allowed.includes(req.body.status)) return res.status(400).json({ message: 'Valid order and status are required.' });
  order.status = req.body.status; order.updatedAt = new Date().toISOString();
  store.notifications = store.notifications || []; store.notifications.unshift({ orderId: order.id, status: order.status, createdAt: order.updatedAt });
  writeStore(store); res.json({ order });
});

app.get('/api/notifications', (req, res) => res.json({ notifications: readStore().notifications || [] }));

app.post('/api/payments/razorpay/order', async (req, res) => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return res.status(503).json({ configured: false, message: 'Online payments are not configured. Please use Cash on Delivery or ask the restaurant to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
  const amount = Math.round(Number(req.body.amount || 0) * 100);
  if (!amount) return res.status(400).json({ message: 'A valid payment amount is required.' });
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'INR', receipt: `rc_${Date.now()}`, notes: { restaurant: restaurantData.name } }) });
    const result = await response.json(); if (!response.ok) return res.status(response.status).json({ message: result.error?.description || 'Unable to create payment order.' });
    res.json({ configured: true, keyId: RAZORPAY_KEY_ID, order: result });
  } catch (error) { res.status(502).json({ message: 'Payment gateway is temporarily unavailable.' }); }
});

app.post('/api/payments/razorpay/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!RAZORPAY_KEY_SECRET || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ message: 'Payment verification data is incomplete.' });
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const supplied = Buffer.from(String(razorpay_signature));
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), supplied)) return res.status(400).json({ message: 'Payment signature could not be verified.' });
  res.json({ verified: true });
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, pincode, items, total, paymentMethod = 'cod', paymentId, visitorId, couponCode, customizations } = req.body;

  if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Please provide customer details and at least one item.' });
  }

  const store = readStore();
  const area = deliveryAreas.find((entry) => entry.pincodes.includes(String(pincode || '').trim()));
  if (pincode && !area) return res.status(400).json({ message: 'We do not deliver to this pincode yet.' });
  const order = {
    id: `ORD-${Date.now()}`,
    customerName,
    phone,
    address: address || '',
    items,
    total: Number(total || 0) + (area?.charge || 0),
    subtotal: Number(total || 0), deliveryCharge: area?.charge || 0, pincode: pincode || '', paymentMethod, paymentId: paymentId || '',
    status: 'Received', visitorId: visitorId || '', couponCode: couponCode || '', customizations: customizations || {},
    createdAt: new Date().toISOString(),
  };

  store.orders.unshift(order);
  if (visitorId) {
    store.profiles = store.profiles || {};
    store.profiles[visitorId] = { ...(store.profiles[visitorId] || {}), name: customerName, phone, address, lastOrderId: order.id, loyaltyPoints: Number(store.profiles[visitorId]?.loyaltyPoints || 0) + Math.floor(Number(total || 0) / 100) };
  }
  writeStore(store);

  res.status(201).json({ message: 'Order placed successfully.', order });
});

app.get('/api/profiles/:visitorId', (req, res) => {
  const store = readStore(); const profile = store.profiles?.[req.params.visitorId] || { loyaltyPoints: 0 };
  const orders = store.orders.filter((order) => order.visitorId === req.params.visitorId);
  res.json({ profile, orders });
});
app.get('/api/profiles/:visitorId/orders', (req, res) => {
  const orders = readStore().orders.filter((order) => order.visitorId === req.params.visitorId);
  res.json({ orders });
});
app.post('/api/reservations', (req, res) => {
  const { name, phone, date, time, guests, notes } = req.body;
  if (!name || !phone || !date || !time || !guests) return res.status(400).json({ message: 'Name, phone, date, time and guests are required.' });
  const store = readStore(); const reservation = { id: `TAB-${Date.now()}`, name, phone, date, time, guests: Number(guests), notes: notes || '', status: 'Requested', createdAt: new Date().toISOString() };
  store.reservations = store.reservations || []; store.reservations.unshift(reservation); writeStore(store);
  res.status(201).json({ message: 'Table reservation request received.', reservation });
});
app.get('/api/reservations', requireAdminAuth, (req, res) => res.json({ reservations: readStore().reservations || [] }));
app.get('/api/settings', (req, res) => res.json({ settings: { deliveryAreas, paymentMethods: ['cod', 'razorpay'], whatsapp: '918828826565', ...readStore().settings } }));
app.put('/api/settings', requireAdminAuth, (req, res) => { const store = readStore(); store.settings = { ...(store.settings || {}), ...req.body }; writeStore(store); res.json({ settings: store.settings }); });
app.get('/api/analytics', requireAdminAuth, (req, res) => {
  const orders = readStore().orders || []; const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  res.json({ orders: orders.length, revenue, averageOrder: orders.length ? revenue / orders.length : 0, byStatus: orders.reduce((all, order) => ({ ...all, [order.status || 'Received']: (all[order.status || 'Received'] || 0) + 1 }), {}) });
});
app.put('/api/menu/:id/availability', requireAdminAuth, (req, res) => {
  if (!menuItems.some((item) => item.id === req.params.id)) return res.status(404).json({ message: 'Menu item not found.' });
  const store = readStore(); store.menuOverrides = store.menuOverrides || {}; store.menuOverrides[req.params.id] = { ...(store.menuOverrides[req.params.id] || {}), available: Boolean(req.body.available) }; writeStore(store);
  res.json({ id: req.params.id, available: store.menuOverrides[req.params.id].available });
});

app.get('/api/enquiries', requireAdminAuth, (req, res) => {
  const store = readStore();
  res.json({ enquiries: store.enquiries });
});

app.post('/api/enquiries', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  const store = readStore();
  const enquiry = {
    id: `ENQ-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    message,
    createdAt: new Date().toISOString(),
  };

  store.enquiries.unshift(enquiry);
  writeStore(store);

  res.status(201).json({ message: 'Enquiry sent successfully.', enquiry });
});

app.get('/admin', requireAdminAuth, sendAdminPage);
app.get('/admin.html', requireAdminAuth, sendAdminPage);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureStoreFile();

app.listen(PORT, () => {
  console.log(`Red Chilly website running on http://localhost:${PORT}`);
  console.log(`Admin login: ${ADMIN_USERNAME}/${ADMIN_PASSWORD}`);
});
