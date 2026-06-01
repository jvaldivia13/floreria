# Florería E-Commerce - Mejoras y Funcionalidades

> **Para workers automáticos:** REQUERIDO: Usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea.

**Objetivo:** Mejorar la experiencia del usuario, seguridad, rendimiento y agregar funcionalidades críticas de negocio para convertir la app en una plataforma lista para producción.

**Arquitectura:** Plan modular organizado por dominio (Performance, Seguridad, UX, Admin, Pagos, Marketing, Escalabilidad). Cada mejora es independiente y puede implementarse en paralelo.

**Stack Tecnológico:** Node.js/Express (backend), React/Vercel (frontend), PostgreSQL, JWT, Stripe/Yape API

---

## PRIORIDADES Y ESFUERZO

### 🔴 CRÍTICO (Bloquea producción)
- [ ] Integración de pagos reales (Stripe/Yape)
- [ ] Validación de seguridad en frontend
- [ ] Rate limiting en API
- [ ] HTTPS y variables de entorno sensibles

### 🟠 ALTO (Mejora significativa)
- [ ] Búsqueda y filtrado mejorado
- [ ] Notificaciones por email transaccionales
- [ ] Dashboard de admin completo
- [ ] Imágenes optimizadas
- [ ] Análisis y reportes

### 🟡 MEDIO (Nice-to-have)
- [ ] Sistema de recomendaciones
- [ ] Wishlist con notificaciones
- [ ] Reviews con fotos
- [ ] Chat de soporte
- [ ] Programa de referidos

---

## FASE 1: SEGURIDAD Y PAGOS (Semana 1-2)

### Tarea 1: Integración de Stripe para pagos de tarjeta

**Archivos:**
- Crear: `backend/src/services/stripeService.js`
- Crear: `backend/src/routes/paymentRoutes.js`
- Crear: `frontend/src/pages/CheckoutPayment.jsx`
- Modificar: `backend/src/index.js` (agregar rutas)
- Modificar: `frontend/src/App.jsx` (agregar ruta)
- Test: `backend/src/services/__tests__/stripeService.test.js`

- [ ] **Paso 1: Instalar Stripe SDK**

```bash
cd backend
npm install stripe
cd ../frontend
npm install @stripe/react-stripe-js @stripe/js
```

- [ ] **Paso 2: Crear servicio de Stripe**

```javascript
// backend/src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, metadata) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata,
  });
  return paymentIntent;
}

async function confirmPayment(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === 'succeeded';
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
};
```

- [ ] **Paso 3: Crear endpoint de pagos**

```javascript
// backend/src/routes/paymentRoutes.js
const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../services/stripeService');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', requireAuth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const paymentIntent = await createPaymentIntent(amount, { orderId });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const success = await confirmPayment(paymentIntentId);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Paso 4: Agregar rutas al servidor**

Modificar `backend/src/index.js`:
```javascript
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);
```

- [ ] **Paso 5: Crear componente de pago en frontend**

```javascript
// frontend/src/pages/CheckoutPayment.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentForm({ orderId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data } = await api.post('/payments/create-intent', {
      amount,
      orderId,
    });

    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      setError(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment}>
      <CardElement />
      {error && <div className="error">{error}</div>}
      <button disabled={!stripe || loading}>
        {loading ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
}

export default function CheckoutPayment({ orderId, amount }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm orderId={orderId} amount={amount} />
    </Elements>
  );
}
```

- [ ] **Paso 6: Agregar variables de entorno**

En Railway backend:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
```

En Vercel frontend:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

- [ ] **Paso 7: Escribir test**

```javascript
// backend/src/services/__tests__/stripeService.test.js
describe('Stripe Service', () => {
  test('createPaymentIntent creates intent with correct amount', async () => {
    const { createPaymentIntent } = require('../stripeService');
    const intent = await createPaymentIntent(99.99, { orderId: 1 });
    expect(intent.amount).toBe(9999);
    expect(intent.currency).toBe('usd');
  });
});
```

- [ ] **Paso 8: Commit**

```bash
git add backend/src/services/stripeService.js \
        backend/src/routes/paymentRoutes.js \
        frontend/src/pages/CheckoutPayment.jsx \
        backend/src/services/__tests__/stripeService.test.js
git commit -m "feat: integrate Stripe for credit card payments"
```

---

### Tarea 2: Rate limiting en API

**Archivos:**
- Crear: `backend/src/middleware/rateLimitMiddleware.js`
- Modificar: `backend/src/index.js` (aplicar middleware)
- Modificar: `backend/package.json` (agregar express-rate-limit)

- [ ] **Paso 1: Instalar express-rate-limit**

```bash
cd backend
npm install express-rate-limit
```

- [ ] **Paso 2: Crear middleware de rate limiting**

```javascript
// backend/src/middleware/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

module.exports = { limiter, authLimiter };
```

- [ ] **Paso 3: Aplicar middleware global**

Modificar `backend/src/index.js`:
```javascript
const { limiter, authLimiter } = require('./middleware/rateLimitMiddleware');
app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

- [ ] **Paso 4: Commit**

```bash
git add backend/src/middleware/rateLimitMiddleware.js
git commit -m "feat: add rate limiting to API endpoints"
```

---

### Tarea 3: Validación CSRF y headers de seguridad

**Archivos:**
- Modificar: `backend/src/index.js` (mejorar Helmet config)
- Crear: `backend/src/middleware/csrfMiddleware.js`

- [ ] **Paso 1: Mejorar configuración de Helmet**

```javascript
// backend/src/index.js - reemplazar helmet() básico
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'https:', 'data:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
}));
```

- [ ] **Paso 2: Instalar csrf**

```bash
cd backend
npm install csurf
```

- [ ] **Paso 3: Crear middleware CSRF**

```javascript
// backend/src/middleware/csrfMiddleware.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const csrfProtection = csrf({ cookie: false });

module.exports = { csrfProtection };
```

- [ ] **Paso 4: Aplicar CSRF a rutas sensibles**

```javascript
// backend/src/routes/authRoutes.js
const { csrfProtection } = require('../middleware/csrfMiddleware');

router.post('/register', csrfProtection, register);
router.post('/login', csrfProtection, login);
```

- [ ] **Paso 5: Commit**

```bash
git add backend/src/index.js backend/src/middleware/csrfMiddleware.js
git commit -m "feat: enhance security headers and add CSRF protection"
```

---

## FASE 2: EXPERIENCIA DE USUARIO (Semana 2-3)

### Tarea 4: Sistema de búsqueda y filtrado avanzado

**Archivos:**
- Crear: `backend/src/services/searchService.js`
- Modificar: `backend/src/routes/productsRoutes.js` (agregar endpoint de búsqueda)
- Crear: `frontend/src/components/SearchBar.jsx`
- Crear: `frontend/src/components/ProductFilters.jsx`

- [ ] **Paso 1: Crear servicio de búsqueda**

```javascript
// backend/src/services/searchService.js
const pool = require('../config/database');

async function searchProducts(query, filters = {}) {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
    params.push(`%${query}%`);
  }

  if (filters.category_id) {
    sql += ' AND category_id = $' + (params.length + 1);
    params.push(filters.category_id);
  }

  if (filters.minPrice !== undefined) {
    sql += ' AND price >= $' + (params.length + 1);
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    sql += ' AND price <= $' + (params.length + 1);
    params.push(filters.maxPrice);
  }

  if (filters.inStock !== undefined && filters.inStock) {
    sql += ' AND stock_quantity > 0';
  }

  sql += ' ORDER BY created_at DESC';

  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { searchProducts };
```

- [ ] **Paso 2: Agregar endpoint**

```javascript
// backend/src/routes/productsRoutes.js
const { searchProducts } = require('../services/searchService');

router.get('/search', async (req, res) => {
  try {
    const { q, category_id, minPrice, maxPrice, inStock } = req.query;
    const products = await searchProducts(q, {
      category_id: category_id ? parseInt(category_id) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true',
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Paso 3: Crear componente SearchBar**

```javascript
// frontend/src/components/SearchBar.jsx
import React, { useState } from 'react';
import api from '../services/api';

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get('/products/search', {
        params: { q: query },
      });
      onResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        placeholder="Buscar flores..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
    </form>
  );
}
```

- [ ] **Paso 4: Crear componente ProductFilters**

```javascript
// frontend/src/components/ProductFilters.jsx
import React, { useState } from 'react';

export default function ProductFilters({ onFilter }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [inStock, setInStock] = useState(false);

  const handleFilter = () => {
    onFilter({ minPrice, maxPrice, inStock });
  };

  return (
    <div className="filters">
      <h3>Filtros</h3>
      <label>
        Precio mínimo: ${minPrice}
        <input
          type="range"
          min="0"
          max="200"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </label>
      <label>
        Precio máximo: ${maxPrice}
        <input
          type="range"
          min="0"
          max="200"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
        Solo disponibles
      </label>
      <button onClick={handleFilter}>Aplicar Filtros</button>
    </div>
  );
}
```

- [ ] **Paso 5: Commit**

```bash
git add backend/src/services/searchService.js \
        backend/src/routes/productsRoutes.js \
        frontend/src/components/SearchBar.jsx \
        frontend/src/components/ProductFilters.jsx
git commit -m "feat: add advanced search and filtering functionality"
```

---

### Tarea 5: Optimización de imágenes

**Archivos:**
- Crear: `backend/src/utils/imageOptimization.js`
- Modificar: `frontend/src/components/ProductCard.jsx` (usar lazy loading)

- [ ] **Paso 1: Crear utilidad de optimización**

```javascript
// backend/src/utils/imageOptimization.js
function getOptimizedImageUrl(originalUrl, size = 'medium') {
  const sizes = {
    thumbnail: '?w=150&h=150&fit=crop&q=80',
    medium: '?w=500&h=500&fit=crop&q=85',
    large: '?w=1000&h=1000&fit=crop&q=90',
  };
  return originalUrl + (sizes[size] || sizes.medium);
}

module.exports = { getOptimizedImageUrl };
```

- [ ] **Paso 2: Agregar lazy loading en ProductCard**

```javascript
// frontend/src/components/ProductCard.jsx
import React from 'react';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        style={{ width: '100%', height: 'auto' }}
      />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

- [ ] **Paso 3: Commit**

```bash
git add backend/src/utils/imageOptimization.js frontend/src/components/ProductCard.jsx
git commit -m "feat: optimize images with lazy loading and size parameters"
```

---

## FASE 3: ADMINISTRACIÓN Y ANÁLISIS (Semana 3-4)

### Tarea 6: Dashboard de admin mejorado con gráficos

**Archivos:**
- Crear: `backend/src/routes/adminRoutes.js` (expandir)
- Crear: `frontend/src/pages/AdminDashboard.jsx`
- Crear: `frontend/src/components/SalesChart.jsx`
- Instalar: `npm install recharts` (frontend)

- [ ] **Paso 1: Crear endpoints de análisis**

```javascript
// backend/src/routes/adminRoutes.js - agregar
router.get('/analytics/sales', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name, COUNT(oi.id) as sales
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY sales DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Paso 2: Instalar Recharts**

```bash
cd frontend
npm install recharts
```

- [ ] **Paso 3: Crear componente SalesChart**

```javascript
// frontend/src/components/SalesChart.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

export default function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/admin/analytics/sales').then((res) => setData(res.data));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Paso 4: Crear página AdminDashboard**

```javascript
// frontend/src/pages/AdminDashboard.jsx
import React from 'react';
import SalesChart from '../components/SalesChart';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Dashboard de Administrador</h1>
      <section>
        <h2>Ventas (últimos 30 días)</h2>
        <SalesChart />
      </section>
    </div>
  );
}
```

- [ ] **Paso 5: Commit**

```bash
git add backend/src/routes/adminRoutes.js \
        frontend/src/pages/AdminDashboard.jsx \
        frontend/src/components/SalesChart.jsx
git commit -m "feat: add admin analytics dashboard with sales charts"
```

---

### Tarea 7: Sistema de notificaciones por email

**Archivos:**
- Crear: `backend/src/services/emailService.js`
- Modificar: `backend/src/routes/ordersRoutes.js` (enviar email en nueva orden)
- Modificar: `backend/package.json` (agregar nodemailer)

- [ ] **Paso 1: Instalar nodemailer**

```bash
cd backend
npm install nodemailer
```

- [ ] **Paso 2: Crear servicio de email**

```javascript
// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendOrderConfirmation(email, order) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Orden #${order.order_number} confirmada`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Tu orden #${order.order_number} ha sido confirmada.</p>
      <p>Total: $${order.total_amount}</p>
      <p>Estado: ${order.status}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function sendOrderShipped(email, order) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Tu orden #${order.order_number} ha sido enviada`,
    html: `
      <h1>Tu orden está en camino</h1>
      <p>Tu orden #${order.order_number} ha sido enviada.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmation, sendOrderShipped };
```

- [ ] **Paso 3: Integrar en ordersRoutes**

```javascript
// backend/src/routes/ordersRoutes.js
const { sendOrderConfirmation } = require('../services/emailService');

// En el endpoint POST /api/orders
const result = await pool.query(
  `INSERT INTO orders (...) VALUES (...) RETURNING *`,
  [...]
);
const order = result.rows[0];

// Enviar email
await sendOrderConfirmation(userEmail, order);

res.status(201).json(order);
```

- [ ] **Paso 4: Configurar variables de entorno en Railway**

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@floreria.com
```

- [ ] **Paso 5: Commit**

```bash
git add backend/src/services/emailService.js backend/src/routes/ordersRoutes.js
git commit -m "feat: add transactional email notifications for orders"
```

---

## FASE 4: MARKETING Y ESCALABILIDAD (Semana 4-5)

### Tarea 8: Sistema de recomendaciones de productos

**Archivos:**
- Crear: `backend/src/services/recommendationService.js`
- Modificar: `backend/src/routes/productsRoutes.js` (agregar endpoint)

- [ ] **Paso 1: Crear servicio de recomendaciones**

```javascript
// backend/src/services/recommendationService.js
const pool = require('../config/database');

async function getRecommendations(userId, limit = 5) {
  // Obtener categorías que el usuario ha comprado
  const userCategories = await pool.query(`
    SELECT DISTINCT p.category_id
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = $1
  `, [userId]);

  if (userCategories.rows.length === 0) {
    // Si no hay historial, retornar productos populares
    const popular = await pool.query(`
      SELECT p.*, COUNT(oi.id) as popularity
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY popularity DESC
      LIMIT $1
    `, [limit]);
    return popular.rows;
  }

  const categoryIds = userCategories.rows.map(r => r.category_id);

  const recommendations = await pool.query(`
    SELECT p.*
    FROM products p
    WHERE p.category_id = ANY($1)
    AND p.id NOT IN (
      SELECT DISTINCT oi.product_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $2
    )
    ORDER BY RANDOM()
    LIMIT $3
  `, [categoryIds, userId, limit]);

  return recommendations.rows;
}

module.exports = { getRecommendations };
```

- [ ] **Paso 2: Agregar endpoint**

```javascript
// backend/src/routes/productsRoutes.js
const { getRecommendations } = require('../services/recommendationService');

router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.id);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Paso 3: Mostrar en frontend**

```javascript
// frontend/src/components/RecommendedProducts.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function RecommendedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products/recommendations').then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Recomendado para ti</h2>
      <div className="products-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <img src={p.image_url} alt={p.name} loading="lazy" />
            <h3>{p.name}</h3>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Paso 4: Commit**

```bash
git add backend/src/services/recommendationService.js frontend/src/components/RecommendedProducts.jsx
git commit -m "feat: add product recommendation engine based on purchase history"
```

---

### Tarea 9: Caching con Redis

**Archivos:**
- Crear: `backend/src/utils/cacheService.js`
- Modificar: `backend/src/routes/productsRoutes.js` (usar cache)
- Modificar: `backend/package.json` (agregar redis)

- [ ] **Paso 1: Instalar redis**

```bash
cd backend
npm install redis
```

- [ ] **Paso 2: Crear servicio de cache**

```javascript
// backend/src/utils/cacheService.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', err => console.log('Redis error:', err));
client.connect();

async function getFromCache(key) {
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

async function setInCache(key, value, ttl = 3600) {
  await client.setEx(key, ttl, JSON.stringify(value));
}

async function deleteFromCache(key) {
  await client.del(key);
}

module.exports = { getFromCache, setInCache, deleteFromCache };
```

- [ ] **Paso 3: Usar cache en productos**

```javascript
// backend/src/routes/productsRoutes.js
const { getFromCache, setInCache } = require('../utils/cacheService');

router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    let product = await getFromCache(cacheKey);

    if (!product) {
      const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [req.params.id]
      );
      product = result.rows[0];
      await setInCache(cacheKey, product, 3600);
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Paso 4: Agregar variable en Railway**

```
REDIS_URL=redis://user:password@redis.railway.app:6379
```

- [ ] **Paso 5: Commit**

```bash
git add backend/src/utils/cacheService.js backend/src/routes/productsRoutes.js
git commit -m "feat: add Redis caching for product queries"
```

---

### Tarea 10: Notificaciones de wishlist

**Archivos:**
- Modificar: `backend/src/routes/wishlistRoutes.js` (agregar notificaciones)
- Crear: `backend/src/services/wishlistNotificationService.js`

- [ ] **Paso 1: Crear servicio de notificaciones**

```javascript
// backend/src/services/wishlistNotificationService.js
const pool = require('../config/database');
const { sendEmail } = require('./emailService');

async function notifyWishlistPrice(productId, newPrice) {
  const wishlists = await pool.query(`
    SELECT DISTINCT u.email, u.id
    FROM wishlist w
    JOIN users u ON w.user_id = u.id
    WHERE w.product_id = $1
  `, [productId]);

  for (const user of wishlists.rows) {
    await sendEmail(user.email, {
      subject: 'Producto en tu wishlist tiene nueva oferta',
      html: `Tu producto tiene una nueva oferta: $${newPrice}`,
    });
  }
}

module.exports = { notifyWishlistPrice };
```

- [ ] **Paso 2: Llamar al notificar cambio de precio**

```javascript
// backend/src/routes/adminRoutes.js
const { notifyWishlistPrice } = require('../services/wishlistNotificationService');

router.put('/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { price } = req.body;
    await pool.query(
      'UPDATE products SET price = $1 WHERE id = $2',
      [price, req.params.id]
    );

    // Notificar usuarios con wishlist
    await notifyWishlistPrice(req.params.id, price);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Paso 3: Commit**

```bash
git add backend/src/services/wishlistNotificationService.js backend/src/routes/adminRoutes.js
git commit -m "feat: notify users when wishlist items go on sale"
```

---

## CHECKLIST DE COBERTURA

✅ **Seguridad:** Pagos Stripe, Rate limiting, CSRF, Headers
✅ **UX:** Búsqueda, filtrado, lazy loading de imágenes
✅ **Admin:** Dashboard con gráficos, analytics
✅ **Notificaciones:** Email transaccionales, wishlist alerts
✅ **Performance:** Caching Redis, optimización de imágenes
✅ **Marketing:** Recomendaciones, programa de fidelización (next)
✅ **Escalabilidad:** Redis, estructura modular

---

## SIGUIENTES FASES (Opcional)

**Fase 5:** Internacionalización (i18n), soporte multimoneda
**Fase 6:** App móvil con React Native
**Fase 7:** Sistema de programa de referidos
**Fase 8:** Chat de soporte en vivo
**Fase 9:** Integraciones con redes sociales
**Fase 10:** PWA y notificaciones push

