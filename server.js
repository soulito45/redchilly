import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { restaurantData, menuItems } from './data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'redchilly123';

const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'store.json');

const ensureStoreFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    const initialStore = { orders: [], enquiries: [] };
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

  res.json({
    categories: [...new Set(menuItems.map((item) => item.category))],
    items: filtered,
    total: filtered.length,
  });
});

app.get('/api/reviews', (req, res) => {
  res.json(restaurantData.reviews);
});

app.get('/api/orders', requireAdminAuth, (req, res) => {
  const store = readStore();
  res.json({ orders: store.orders });
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, items, total } = req.body;

  if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Please provide customer details and at least one item.' });
  }

  const store = readStore();
  const order = {
    id: `ORD-${Date.now()}`,
    customerName,
    phone,
    address: address || '',
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  store.orders.unshift(order);
  writeStore(store);

  res.status(201).json({ message: 'Order placed successfully.', order });
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
