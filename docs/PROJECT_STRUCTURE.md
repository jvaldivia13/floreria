# Estructura del Proyecto - Florería Tulipanes (Monorepo)

## 📋 ESTRUCTURA ACTUAL vs NUEVA

### ESTRUCTURA ACTUAL (Solo Web)
```
floreria/
├── backend/                 # API Node.js/Express
├── frontend/                # App web React (Vercel)
├── docs/
└── README.md
```

### ESTRUCTURA NUEVA (Monorepo con Mobile)
```
floreria/
├── backend/                 # ✅ Sin cambios
│   ├── src/
│   ├── scripts/
│   ├── tests/
│   └── package.json
│
├── frontend/                # ✅ Web React (mantener)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/        # API calls (COMPARTIDO)
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── mobile/                  # 🆕 APP REACT NATIVE (NUEVA)
│   ├── src/
│   │   ├── screens/         # Pantallas (Login, Home, etc)
│   │   ├── components/      # Componentes nativos
│   │   ├── services/        # API calls (COMPARTIDO)
│   │   ├── store/           # Zustand state (COMPARTIDO)
│   │   ├── navigation/      # React Navigation
│   │   ├── utils/           # Utilidades (COMPARTIDAS)
│   │   ├── assets/          # Imágenes, fuentes
│   │   └── App.tsx
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   └── README.md
│
├── shared/                  # 🆕 CÓDIGO COMPARTIDO (OPCIONAL)
│   ├── services/            # API clients
│   ├── store/               # State management
│   ├── types/               # TypeScript types
│   ├── utils/               # Funciones comunes
│   ├── constants/           # Constantes
│   └── package.json
│
├── docs/
│   └── superpowers/
│       ├── plans/
│       ├── specs/
│       └── PROJECT_STRUCTURE.md  (ESTE ARCHIVO)
│
├── .gitignore
├── package.json             # Root workspace
├── pnpm-workspace.yaml      # O turbo.json (OPCIONAL)
└── README.md
```

---

## 🎯 EXPLICACIÓN POR CARPETA

### 1. **`/backend`** (Sin cambios)
Backend Node.js que ambas apps (web y mobile) consumen.

```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/         # Lógica de negocio
│   ├── utils/
│   └── index.js
├── scripts/
│   ├── init-db.js
│   └── seed-data.js
└── package.json          # Dependencias backend
```

**No cambia nada.** Ambas apps (frontend y mobile) hacen HTTP calls al mismo backend.

---

### 2. **`/frontend`** (Web React - REFACTORIZADO)

Reorganizar para compartir código con mobile:

```
frontend/
├── src/
│   ├── pages/                    # Páginas web únicas
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── components/               # Componentes WEB específicos
│   │   ├── Header.tsx            # Solo para web (navbar)
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProductCard.tsx       # Card específica web
│   │   ├── CartItem.tsx
│   │   ├── Button.tsx            # Botón HTML
│   │   └── FormInputs/
│   │       ├── TextInput.tsx
│   │       ├── Select.tsx
│   │       └── Checkbox.tsx
│   │
│   ├── shared/                   # ⭐ Código compartido
│   │   ├── services/             # API calls
│   │   │   ├── api.ts            # Cliente HTTP (COMPARTIDO)
│   │   │   ├── auth.ts           # Auth service (COMPARTIDO)
│   │   │   ├── products.ts       # Products service (COMPARTIDO)
│   │   │   ├── cart.ts
│   │   │   ├── orders.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/                # Estado (COMPARTIDO)
│   │   │   ├── auth.ts           # Zustand auth store (COMPARTIDO)
│   │   │   ├── products.ts       # Zustand products (COMPARTIDO)
│   │   │   ├── cart.ts           # Zustand cart (COMPARTIDO)
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                # TypeScript (COMPARTIDO)
│   │   │   ├── auth.ts
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   ├── cart.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                # Utilidades (COMPARTIDAS)
│   │   │   ├── validators.ts     # Email, password, etc
│   │   │   ├── formatters.ts     # Dinero, fechas
│   │   │   ├── constants.ts      # URLs, mensajes
│   │   │   └── index.ts
│   │   │
│   │   └── hooks/                # Custom hooks (COMPARTIDOS)
│   │       ├── useAuth.ts
│   │       ├── useProducts.ts
│   │       └── useCart.ts
│   │
│   ├── styles/                   # CSS/Tailwind (web específico)
│   │   ├── globals.css
│   │   ├── pages.css
│   │   └── components.css
│   │
│   ├── App.tsx                   # Punto de entrada web
│   └── main.tsx
│
├── public/                       # Assets estáticos web
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Cambios principales:**
- ✅ Crear carpeta `/shared` para código reutilizable
- ✅ Mover `services`, `store`, `types`, `utils`, `hooks` a `/shared`
- ✅ Mantener en `/components` solo componentes web específicos (Header, Footer, Sidebar)

---

### 3. **`/mobile`** (React Native - NUEVA)

```
mobile/
├── src/
│   ├── screens/                  # Pantallas nativas
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   │
│   │   ├── app/
│   │   │   ├── HomeScreen.tsx    # Catálogo
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   ├── CheckoutScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   └── admin/
│   │       ├── DashboardScreen.tsx
│   │       └── OrdersScreen.tsx
│   │
│   ├── components/               # Componentes NATIVOS específicos
│   │   ├── UI/                   # Componentes base
│   │   │   ├── Button.tsx        # TouchableOpacity button
│   │   │   ├── Input.tsx         # TextInput nativo
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Error.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── ProductCard.tsx       # Card nativa (diferente a web)
│   │   ├── CartItem.tsx
│   │   ├── Header.tsx            # Header nativo (no navbar web)
│   │   └── TabBar.tsx            # Bottom tab bar
│   │
│   ├── shared/                   # ⭐ Código COMPARTIDO CON WEB
│   │   ├── services/             # API calls (IMPORTADOS DE /frontend/shared)
│   │   ├── store/                # Zustand stores (IMPORTADOS)
│   │   ├── types/                # TypeScript types (IMPORTADOS)
│   │   ├── utils/                # Utilidades (IMPORTADOS)
│   │   └── hooks/                # Custom hooks (IMPORTADOS)
│   │
│   ├── navigation/               # React Navigation
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── assets/                   # Imágenes, iconos, fuentes
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── splash.png
│   │
│   ├── utils/                    # Mobile-specific utilities
│   │   ├── storage.ts            # AsyncStorage
│   │   ├── notifications.ts      # Push notifications
│   │   └── permissions.ts        # Permisos del dispositivo
│   │
│   ├── constants/                # Constantes mobile
│   │   ├── colors.ts
│   │   ├── sizes.ts
│   │   └── spacing.ts
│   │
│   ├── App.tsx                   # Punto de entrada mobile
│   └── index.ts
│
├── app.json                      # Configuración Expo
├── eas.json                      # Configuración EAS Build
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**Características:**
- ✅ Usa `shared/` para reutilizar código con web
- ✅ `components/` tiene componentes NATIVOS (TouchableOpacity, TextInput, etc)
- ✅ `screens/` reemplaza a `pages/`
- ✅ Sin HTML, solo React Native

---

### 4. **`/shared`** (OPCIONAL - Mejor práctica)

Si quieres máxima reutilización, crea un paquete compartido:

```
shared/
├── src/
│   ├── services/
│   │   ├── api.ts               # Cliente HTTP compartido
│   │   ├── auth.ts              # Auth service
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── index.ts
│   │
│   ├── store/
│   │   ├── auth.ts              # Zustand auth
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   └── common.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   └── useAsync.ts
│   │
│   ├── __tests__/
│   │   ├── validators.test.ts
│   │   ├── formatters.test.ts
│   │   └── hooks.test.ts
│   │
│   └── index.ts                 # Export todo
│
├── tsconfig.json
├── package.json
└── README.md
```

**Ventajas:**
- ✅ Código centralizado y versionado
- ✅ Fácil de testear
- ✅ Reutilización garantizada
- ✅ Mantenimiento centralizado

---

## 📦 IMPORTACIONES COMPARTIDAS

### Desde `/frontend`:
```typescript
// Traer desde shared
import { useAuth } from '../shared/hooks/useAuth';
import { useProducts } from '../shared/hooks/useProducts';
import { useCart } from '../shared/hooks/useCart';

import { authService } from '../shared/services/auth';
import { productsService } from '../shared/services/products';

import { useAuthStore } from '../shared/store/auth';
import { useProductsStore } from '../shared/store/products';

import type { User, Product, CartItem } from '../shared/types';

import { formatPrice, validateEmail } from '../shared/utils';
```

### Desde `/mobile`:
```typescript
// ¡MISMO PATRÓN que web!
import { useAuth } from '../shared/hooks/useAuth';
import { useProducts } from '../shared/hooks/useProducts';
import { useCart } from '../shared/hooks/useCart';

import { authService } from '../shared/services/auth';
import { productsService } from '../shared/services/products';

import { useAuthStore } from '../shared/store/auth';
import { useProductsStore } from '../shared/store/products';

import type { User, Product, CartItem } from '../shared/types';

import { formatPrice, validateEmail } from '../shared/utils';
```

**Nota:** El único cambio es que `components/` son diferentes:
- `frontend/components/` → componentes HTML/React
- `mobile/components/` → componentes React Native

---

## 🔄 COMPARATIVA: COMPONENTES

### Componentes COMPARTIDOS (Mismo código)
```
✅ services/api.ts           (HTTP client)
✅ store/auth.ts             (Zustand)
✅ store/products.ts         (Zustand)
✅ store/cart.ts             (Zustand)
✅ types/                     (TypeScript)
✅ utils/formatters.ts       (Formateo dinero, fechas)
✅ utils/validators.ts       (Email, contraseña)
✅ hooks/useAuth.ts          (Custom hooks)
✅ hooks/useProducts.ts
✅ hooks/useCart.ts
```

### Componentes ESPECÍFICOS (Código diferente)

#### Frontend (HTML/React)
```typescript
// frontend/components/Button.tsx
export const Button = ({ title, onClick }) => (
  <button onClick={onClick} className="btn-primary">
    {title}
  </button>
);
```

#### Mobile (React Native)
```typescript
// mobile/components/Button.tsx
export const Button = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);
```

---

## 📊 TABLA RESUMEN

| Carpeta | Frontend | Mobile | Compartido |
|---------|----------|--------|-----------|
| `services/` | ✅ | ✅ | COMPARTIDO |
| `store/` | ✅ | ✅ | COMPARTIDO |
| `types/` | ✅ | ✅ | COMPARTIDO |
| `utils/` | ✅ | ✅ | COMPARTIDO |
| `hooks/` | ✅ | ✅ | COMPARTIDO |
| `components/` | ✅ | ✅ | ❌ DIFERENTES |
| `pages/` | ✅ | ❌ | - |
| `screens/` | ❌ | ✅ | - |
| `navigation/` | ❌ | ✅ | - |
| `styles/` (CSS) | ✅ | ❌ | - |

---

## 🚀 PLAN DE MIGRACIÓN

### Fase 1: Reorganizar `/frontend` (1 día)
```bash
# 1. Crear carpeta shared
mkdir -p frontend/src/shared/{services,store,types,utils,hooks}

# 2. Mover archivos
mv frontend/src/services/* frontend/src/shared/services/
mv frontend/src/store/* frontend/src/shared/store/
mv frontend/src/types/* frontend/src/shared/types/
mv frontend/src/utils/* frontend/src/shared/utils/
mv frontend/src/hooks/* frontend/src/shared/hooks/

# 3. Actualizar imports en frontend
# frontend/src/pages/*.tsx
# frontend/src/components/*.tsx
# Cambiar de:
// import { useAuth } from '../hooks/useAuth'
// import { api } from '../services/api'
// A:
import { useAuth } from '../shared/hooks/useAuth'
import { api } from '../shared/services/api'
```

### Fase 2: Crear `/mobile` con referencias a `/frontend/shared`
```bash
# El proyecto mobile importará directamente de shared:
// En mobile/package.json, opcional:
"dependencies": {
  "@floreria/shared": "workspace:*"  // Si usas monorepo
}

// O simplemente:
import { useAuth } from '../frontend/src/shared/hooks/useAuth'
// (Vía path mapping en tsconfig)
```

### Fase 3: (Opcional) Crear paquete `/shared` independiente
```bash
# Si quieres máxima limpieza
mkdir shared
cd shared && npm init

# Luego:
frontend/src/shared/ → shared/src/
mobile/src/shared/ → shared/src/

# Y ambas importan de:
import { useAuth } from '@floreria/shared/hooks'
```

---

## 📝 TSCONFIG PARA MONOREPO

Usar path mapping para importaciones limpias:

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["./frontend/src/shared/*"],
      "@mobile/*": ["./mobile/src/*"],
      "@web/*": ["./frontend/src/*"]
    }
  }
}
```

Luego importas así:
```typescript
// En frontend
import { useAuth } from '@shared/hooks';

// En mobile
import { useAuth } from '@shared/hooks';
```

---

## ✅ RESULTADO FINAL

Tu proyecto tendrá:

```
floreria/
├── backend/          (API - sin cambios)
├── frontend/         (Web React - refactorizado)
│   ├── src/shared/   (Código compartido)
│   ├── src/pages/    (Páginas web)
│   └── src/components/ (Componentes web)
│
├── mobile/           (App React Native - NUEVA)
│   ├── src/shared/   (Referencia a frontend/shared)
│   ├── src/screens/  (Pantallas móviles)
│   └── src/components/ (Componentes nativos)
│
└── docs/
    └── PROJECT_STRUCTURE.md (ESTE ARCHIVO)
```

**Beneficios:**
✅ Código compartido entre web y mobile
✅ Una sola fuente de verdad para tipos, servicios, estado
✅ Fácil de mantener y actualizar
✅ Tests centralizados
✅ Escalable para el futuro

