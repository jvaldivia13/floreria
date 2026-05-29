# Especificación: App de Pedidos Florería Tulipanes a tu Alcance

**Fecha:** 2026-05-28  
**Proyecto:** Florería Tulipanes a tu Alcance  
**Versión:** MVP (2-4 semanas)  
**Estado:** Aprobado

---

## 1. RESUMEN EJECUTIVO

Construir una plataforma web de e-commerce responsive para la Florería "Tulipanes a tu Alcance" que permita a clientes ver catálogo de arreglos florales y complementos, armar pedidos, seleccionar fecha de entrega y pagar online con YAPE/Plin.

**Stack:** React (frontend) + Node.js/Express (backend) + PostgreSQL (DB)  
**Scope:** MVP en 2-4 semanas  
**Target:** Clientes en Lima, compras lunes-sábado, entregas 9am-6pm

---

## 2. CONTEXTO DEL NEGOCIO

### Información General
- **Nombre:** Florería Tulipanes a tu Alcance
- **Ubicación:** Calle Los Andes 120, Miraflores, Lima
- **Teléfono:** 5580885
- **Email:** janovaldivia@gmail.com
- **Zona de cobertura:** Solo Lima
- **Horarios de entrega:** Lunes a sábado, 9am-6pm
- **Costo de entrega:** S/. 20 fijo

### Modelo de Productos
- **Catálogo:** 20-50 productos iniciales
- **Categorías:** Arreglos florales + Complementos (chocolates, globos, peluches, tarjetas, velas, etc.)
- **Variación:** Productos pueden ser personalizables (con mensaje, nombre, etc.)

### Modelo de Negocio
- Clientes compran online
- Entregas al día siguiente (lunes-sábado)
- Pago obligatorio online (YAPE/Plin)
- Seguimiento de pedidos por email

---

## 3. REQUISITOS FUNCIONALES

### 3.1 CLIENTE (Tienda Web)

#### Autenticación
- [x] Registro con email/password
- [x] Login con email/password
- [x] Recuperación de contraseña (email)
- [x] JWT tokens para sesiones
- [x] Logout
- [x] Rol diferenciado (cliente/admin)

#### Catálogo
- [x] Listar productos con foto, nombre, descripción, precio
- [x] Búsqueda por nombre/descripción
- [x] Filtrar por categoría (arreglos, complementos)
- [x] Paginación (20 productos/página)
- [x] Detalle de producto con reseñas
- [x] Stock visible (mostrar si hay disponibilidad)

#### Carrito
- [x] Agregar/eliminar productos
- [x] Modificar cantidad
- [x] Cálculo automático de total (subtotal + envío S/.20)
- [x] Aplicar cupones de descuento
- [x] Persistencia del carrito (en sesión)

#### Checkout
- [x] Formulario de dirección de entrega (Lima)
- [x] Seleccionar fecha de entrega (lunes-sábado, no pasado)
- [x] Elegir método de pago (YAPE/Plin)
- [x] Resumen de orden antes de pagar
- [x] Integración con YAPE/Plin para procesar pago
- [x] Confirmación post-pago

#### Mi Cuenta
- [x] Historial de pedidos con estado
- [x] Ver detalles de cada pedido
- [x] Editar datos personales
- [x] Gestionar dirección de entrega

#### Reseñas y Wishlist
- [x] Ver reseñas de otros clientes (rating 1-5 + comentario)
- [x] Crear reseña después de compra
- [x] Agregar/quitar de wishlist
- [x] Ver wishlist (lista guardada de productos)

---

### 3.2 ADMIN (Panel de Administración)

#### Gestión de Productos
- [x] Crear producto (nombre, descripción, precio, foto, categoría)
- [x] Editar producto
- [x] Eliminar producto
- [x] Ver stock actual
- [x] Actualizar stock manualmente

#### Gestión de Pedidos
- [x] Ver todos los pedidos (filtrar por estado, fecha)
- [x] Ver detalles de cada pedido (cliente, items, dirección, monto)
- [x] Cambiar estado de pedido (pendiente → procesando → enviado → entregado)
- [x] Nota interna para cada pedido

#### Gestión de Cupones
- [x] Crear código de descuento (porcentaje, límite de usos)
- [x] Activar/desactivar cupones
- [x] Ver cupones usados

#### Reportes y Analítica
- [x] Dashboard: resumen de ventas hoy, pedidos pendientes, productos sin stock
- [x] Reporte de ventas (total ingresos por período)
- [x] Productos más vendidos
- [x] Clientes registrados

#### Gestión de Usuarios
- [x] Ver lista de clientes
- [x] Ver historial de compras por cliente

---

## 4. ARQUITECTURA TÉCNICA

### 4.1 Frontend (React)

**Páginas:**
1. **Login/Registro** — autenticación de usuario
2. **Home** — búsqueda destacada, categorías, productos en oferta
3. **Catálogo** — grid de productos, filtros, búsqueda, paginación
4. **Detalle de Producto** — foto, descripción, precio, reseñas, cantidad, botones "agregar al carrito" y "wishlist"
5. **Carrito** — resumen de items, cupones, total con envío
6. **Checkout** — dirección, fecha entrega, método pago
7. **Confirmación** — resumen de pedido, número de seguimiento
8. **Mi Cuenta** — historial de pedidos, datos personales
9. **Admin Dashboard** — resumen de operaciones
10. **Admin Productos** — CRUD de productos
11. **Admin Pedidos** — ver y cambiar estado
12. **Admin Reportes** — ventas, analítica
13. **Admin Cupones** — crear y gestionar

**Componentes reutilizables:**
- ProductCard
- Header (nav, búsqueda, carrito, usuario)
- Footer (contacto, info)
- Modal (confirmaciones, formularios)

**Estado:** Context API o Redux (elegir en implementación)

---

### 4.2 Backend (Node.js + Express)

**Endpoints de Autenticación:**
```
POST   /api/auth/register          — crear usuario
POST   /api/auth/login             — login
POST   /api/auth/logout            — logout
POST   /api/auth/forgot-password   — recuperar contraseña
```

**Endpoints de Productos:**
```
GET    /api/products               — listar con filtros, búsqueda, paginación
GET    /api/products/:id           — detalle
GET    /api/categories             — listar categorías
```

**Endpoints de Carrito:**
```
POST   /api/cart                   — agregar item
DELETE /api/cart/:itemId           — eliminar item
GET    /api/cart                   — obtener carrito
```

**Endpoints de Pedidos:**
```
POST   /api/orders                 — crear pedido
GET    /api/orders/:id             — detalle de pedido
GET    /api/orders                 — historial del usuario
POST   /api/orders/:id/webhook     — webhook de pago (YAPE/Plin)
```

**Endpoints de Reseñas:**
```
POST   /api/reviews                — crear reseña
GET    /api/products/:id/reviews   — obtener reseñas de producto
```

**Endpoints de Admin (requieren autenticación admin):**
```
POST   /api/admin/products         — crear producto
PUT    /api/admin/products/:id     — editar producto
DELETE /api/admin/products/:id     — eliminar producto
GET    /api/admin/orders           — listar todos los pedidos
PATCH  /api/admin/orders/:id/status — cambiar estado
GET    /api/admin/reports          — ventas, analítica
POST   /api/admin/coupons          — crear cupón
GET    /api/admin/coupons          — listar cupones
GET    /api/admin/inventory        — stock de productos
GET    /api/admin/users            — listar clientes
```

**Endpoints de Cupones:**
```
POST   /api/coupons/validate       — validar código antes de checkout
```

---

### 4.3 Base de Datos (PostgreSQL)

**Tablas:**

**users**
```sql
id (PK), email, password_hash, nombre, telefono, 
direccion, fecha_registro, rol (cliente/admin), activo
```

**products**
```sql
id (PK), nombre, descripcion, precio, categoria_id (FK), 
foto_url, stock, activo, fecha_creacion, updated_at
```

**categories**
```sql
id (PK), nombre (arreglos/complementos)
```

**cart_items**
```sql
id (PK), user_id (FK), product_id (FK), cantidad, 
fecha_agregado
```

**orders**
```sql
id (PK), user_id (FK), total, subtotal, descuento_aplicado,
estado (pendiente/procesando/enviado/entregado), 
metodo_pago (yape/plin), referencia_pago, 
fecha_pedido, fecha_entrega_esperada, 
direccion_entrega, fecha_entrega_real, 
notas_admin, created_at, updated_at
```

**order_items**
```sql
id (PK), order_id (FK), product_id (FK), cantidad, 
precio_unitario, subtotal
```

**reviews**
```sql
id (PK), user_id (FK), product_id (FK), rating (1-5), 
comentario, fecha_creacion
```

**coupons**
```sql
id (PK), codigo (UNIQUE), descuento_porcentaje, 
usos_maximos, usos_actuales, activo, 
fecha_creacion, fecha_expiracion
```

**wishlist**
```sql
id (PK), user_id (FK), product_id (FK), fecha_agregado
```

---

## 5. INTEGRACIONES EXTERNAS

### Pagos (YAPE/Plin)
- Integración de API de YAPE para generar QR de pago
- Integración de API de Plin para generación de código
- Webhook para confirmar pago (actualiza estado de orden)
- Manejo de errores y reintentos

### Email (Notificaciones)
- Confirmación de pedido inmediato
- Notificación cuando estado cambia a "procesando"
- Notificación cuando estado cambia a "enviado"
- Servicio: SendGrid, Resend, o nodemailer

---

## 6. FLUJOS CRÍTICOS

### Flujo de Compra
1. Cliente accede a la tienda
2. Login (o registro si es nuevo)
3. Navega catálogo, filtra, busca
4. Agrega productos al carrito
5. Va a carrito, revisa, aplica cupón si tiene
6. Procede a checkout
7. Ingresa dirección (Lima)
8. Selecciona fecha entrega (lunes-sábado, no pasado)
9. Elige YAPE o Plin
10. Sistema genera QR/código de pago
11. Cliente paga (puede ser en tiempo real o después)
12. Webhook confirma pago
13. Orden guardada con estado "pendiente"
14. Email de confirmación al cliente
15. Admin ve orden en panel, marca como "procesando"
16. Admin marca como "enviado"
17. Cliente recibe emails en cada paso

### Flujo de Admin
1. Admin login
2. Ve dashboard (ventas hoy, pedidos pendientes, stock bajo)
3. Ve listado de pedidos
4. Selecciona un pedido
5. Revisa detalles (cliente, items, dirección)
6. Cambia estado (pendiente → procesando → enviado → entregado)
7. Puede agregar notas internas

---

## 7. BRANDING Y DISEÑO VISUAL

**Nombre:** Florería Tulipanes a tu Alcance  
**Logo:** TBD en implementación (propuesta: tulipán estilizado)  
**Colores:** Palette floral sugerida
- Primario: Rosa/Fucsia (#E85B9C o similar)
- Secundario: Verde Natural (#4CAF50 o similar)
- Neutro: Blanco/Gris para fondos

**Tipografía:** Sans-serif moderno (ej: Poppins, Inter, Roboto)

**Tone of Voice:** Amable, accesible, florido pero profesional

---

## 8. REQUISITOS NO FUNCIONALES

### Seguridad
- Contraseñas hasheadas con bcrypt
- JWT tokens con expiración
- HTTPS en producción
- Validación de datos en backend (frontend + backend)
- Admin requiere autenticación adicional
- Sanitización de inputs contra SQL injection y XSS

### Performance
- Paginación de catálogo (20 items/página)
- Imágenes optimizadas y comprimidas
- Load time < 3 segundos (página principal)
- Responsive en móvil, tablet, desktop

### Disponibilidad
- Uptime objetivo: 99.5% (MVP)
- Manejo de errores: mensajes claros al usuario
- Logging de errores para debugging

### Escalabilidad
- Arquitectura preparada para cachés (Redis) en v2
- Paginación desde el inicio
- API versionada (v1)

---

## 9. TESTING (MVP)

### Tests Manuales
- [x] Login/registro funciona
- [x] Búsqueda y filtros de catálogo
- [x] Agregar/quitar del carrito
- [x] Cálculo correcto de totales con envío
- [x] Checkout con YAPE/Plin
- [x] Confirmación post-pago
- [x] Admin puede crear/editar productos
- [x] Admin puede cambiar estado de pedidos
- [x] Emails se envían correctamente

### Tests Automatizados (básicos)
- Rutas de autenticación (login, registro)
- Creación de orden
- Cálculo de totales
- Validación de cupones

---

## 10. TIMELINE Y FASES

**Total: 2-4 semanas**

**Semana 1: Setup + Frontend Core**
- Configurar proyecto React y Node/Express
- Diseñar componentes base
- Implementar páginas: Home, Catálogo, Detalle, Carrito

**Semana 2: Checkout + Admin Básico**
- Integrar YAPE/Plin
- Checkout completo
- Admin CRUD de productos
- Gestión de pedidos

**Semana 3: Notificaciones + Polish**
- Email de confirmación y updates
- Reseñas y wishlist
- Dashboard admin
- Tests y bugfixes

**Semana 4 (opcional): Reportes + Deploy**
- Reportes y analítica
- Cupones completo
- Deploy a producción

---

## 11. DEPLOYMENT

**Frontend:**
- Vercel, Netlify, o servidor propio
- Build: `npm run build`, servir dist/

**Backend:**
- Heroku, Render, Railway, o VPS
- Environment variables para DB, APIs, secrets

**Base de Datos:**
- PostgreSQL en cloud: Supabase, Railway, Managed Database

**Storage de Imágenes:**
- Cloudinary, AWS S3, o carpeta en servidor (MVP)

---

## 12. EXCLUSIONES (Futura v1.1+)

- ❌ Notificaciones por WhatsApp (v1.1)
- ❌ Caché con Redis (v2)
- ❌ Analytics avanzado (v2)
- ❌ App móvil nativa (v2)
- ❌ Integración con redes sociales para login (v2)
- ❌ Recomendaciones personalizadas (v2)

---

## 13. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Delay en integración YAPE/Plin | Media | Alto | Contactar providers temprano, tener endpoint mock |
| Scope creep (pedir más features) | Alta | Alto | Scope fijo para MVP, features en backlog v1.1 |
| Bugs en producción | Media | Alto | Testing manual exhaustivo antes de deploy |
| Performance lenta | Baja | Medio | Optimizar imágenes, paginación desde inicio |
| Disponibilidad de DB | Baja | Alto | Usar managed DB service con backups |

---

## 14. CRITERIOS DE ACEPTACIÓN

MVP considerado **COMPLETO** cuando:
- ✅ Clientes pueden registrarse, loginearse
- ✅ Catálogo visible con búsqueda y filtros
- ✅ Carrito funcional con cálculo correcto
- ✅ Checkout con YAPE/Plin
- ✅ Órdenes guardadas y visibles en admin
- ✅ Admin puede cambiar estado de pedidos
- ✅ Emails se envían en eventos críticos
- ✅ Sin errores críticos en producción
- ✅ Responsive en móvil y desktop
- ✅ Reseñas y wishlist funcionales

---

**Documento Aprobado:** 2026-05-28  
**Responsable de Especificación:** Claude Code (Haiku 4.5)  
**Stakeholder:** Jano Valdivia (janovaldivia@gmail.com)
