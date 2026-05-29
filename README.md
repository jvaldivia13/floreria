# Florería Tulipanes a tu Alcance - Aplicación E-commerce

Aplicación completa de e-commerce para florerías con backend en Node.js/Express, base de datos PostgreSQL y frontend en React.

## 📋 Características

- ✅ Autenticación de usuarios con JWT
- ✅ Catálogo de productos con búsqueda y filtrado
- ✅ Carrito de compras y checkout
- ✅ Sistema de órdenes completo
- ✅ Reseñas y lista de deseos
- ✅ Cupones de descuento
- ✅ Webhooks de pago (YAPE/Plin)
- ✅ Dashboard de administrador
- ✅ Reportes y analytics
- ✅ Notificaciones por email

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express.js
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails
- Axios para HTTP requests

**Frontend:**
- React 18
- React Router v6
- Context API para estado
- Axios para API calls
- CSS3 con responsive design

## 📦 Instalación

### Requisitos
- Node.js 14+
- PostgreSQL 12+
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con URLs de API
npm run dev
```

## 🚀 Deployment

### Variables de Entorno - Backend

```env
NODE_ENV=production
PORT=5000
API_URL=https://api.floreria.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floreria_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@floreria.com

# YAPE/Plin
YAPE_API_URL=https://api.yape.pe/v1
YAPE_API_KEY=your_key
PLIN_API_URL=https://api.plin.pe/v1
PLIN_API_KEY=your_key

# CORS
CORS_ORIGIN=https://floreria.com
```

### Deploy en Heroku (Backend)

```bash
# Login a Heroku
heroku login

# Crear app
heroku create floreria-backend

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Setear variables
heroku config:set NODE_ENV=production JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Deploy en Vercel (Frontend)

```bash
# Login a Vercel
npm install -g vercel

# Deploy
vercel

# Setear variables de entorno en Vercel dashboard
VITE_API_URL=https://api.floreria.com
```

### Deploy Manual en AWS/DigitalOcean

**Backend:**
```bash
# En servidor Ubuntu
sudo apt-get update
sudo apt-get install nodejs npm postgresql

# Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE floreria_db;
CREATE USER floreria WITH PASSWORD 'password';
ALTER ROLE floreria SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE floreria_db TO floreria;

# Clone repo y setup
git clone <repo>
cd floreria/backend
npm install
npm run dev
```

**Frontend:**
```bash
# Build
cd floreria/frontend
npm install
npm run build

# Servir con nginx
sudo apt-get install nginx
# Copiar dist a /var/www/html
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Products
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/admin/products` - Crear producto (admin)
- `PUT /api/admin/products/:id` - Actualizar producto (admin)

### Orders
- `POST /api/orders` - Crear orden
- `GET /api/orders/my-orders` - Mis órdenes
- `GET /api/orders/:id` - Obtener orden
- `GET /api/admin/orders/all` - Ver todas (admin)

### Cart
- `POST /api/cart` - Agregar al carrito
- `GET /api/cart` - Ver carrito
- `DELETE /api/cart/:itemId` - Eliminar item

## 📧 Configurar Email

1. Habilitar "Acceso de aplicaciones menos seguras" en Gmail
2. Generar contraseña de aplicación
3. Usar en EMAIL_PASSWORD env variable

## 📊 Base de Datos

Tablas principales:
- `users` - Usuarios registrados
- `products` - Catálogo de productos
- `categories` - Categorías
- `cart_items` - Items en carrito
- `orders` - Órdenes de compra
- `order_items` - Items en orden
- `reviews` - Reseñas de productos
- `wishlist` - Lista de deseos
- `coupons` - Cupones de descuento

## 🔒 Seguridad

- Contraseñas hasheadas con bcryptjs
- JWT para autenticación stateless
- CORS configurado
- Helmet.js para headers seguros
- Validación de entrada en endpoints
- SQL parametrizado para prevenir inyecciones

## 🧪 Testing

```bash
# Backend
npm test

# Frontend (no implementado aún)
npm test
```

## 📝 Licencia

MIT

## 👤 Autor

Janier Valdivia - janovaldivia@gmail.com

## 📞 Soporte

Para reportar bugs o sugerencias:
- Email: janovaldivia@gmail.com
- Teléfono: 5580885
