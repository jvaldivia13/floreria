# React Native Migration Plan - Florería Tulipanes

> **Para workers automáticos:** REQUERIDO: Usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea.

**Objetivo:** Migrar la aplicación React web (Vercel) a aplicación nativa iOS y Android usando React Native + Expo, reutilizando toda la lógica de API del backend existente.

**Arquitectura:** Estructura monorepo donde compartimos servicios de API, utilidades y lógica de estado. React Native maneja UI nativa, navegación con React Navigation, y Expo gestiona build/deployment. Backend Node.js permanece sin cambios.

**Tech Stack:** 
- React Native + Expo (CLI)
- React Navigation (navegación nativa)
- Zustand/Context (estado compartido con web)
- Axios (API calls reutilizable)
- JWT (autenticación)
- EAS Build (deployment Expo)

---

## 📁 ESTRUCTURA DEL PROYECTO FINAL

```
floreria/
├── backend/                    # Sin cambios
│   └── src/
├── frontend/                   # App web React (mantener)
│   └── src/
├── mobile/                     # NUEVO - App React Native
│   ├── app.json               # Configuración Expo
│   ├── package.json
│   ├── src/
│   │   ├── screens/           # Pantallas principales
│   │   ├── components/        # Componentes reutilizables
│   │   ├── services/          # API calls (compartido con web)
│   │   ├── store/             # Estado (Zustand)
│   │   ├── navigation/        # Navegación
│   │   └── App.tsx            # Punto de entrada
│   ├── eas.json               # Configuración EAS Build
│   └── ios/android/           # Generado por Expo
└── docs/
```

---

## FASE 1: SETUP INICIAL (Día 1)

### Tarea 1: Crear proyecto Expo y estructura base

**Archivos:**
- Crear: `mobile/` (directorio raíz)
- Crear: `mobile/app.json`
- Crear: `mobile/package.json`
- Crear: `mobile/src/App.tsx`
- Crear: `mobile/.env.example`

- [ ] **Paso 1: Crear proyecto Expo**

```bash
cd floreria
npx create-expo-app mobile
cd mobile
```

- [ ] **Paso 2: Instalar dependencias principales**

```bash
npm install axios zustand react-navigation react-native-screens react-native-safe-area-context
npm install -D typescript @types/react @types/react-native
```

- [ ] **Paso 3: Configurar app.json de Expo**

```json
{
  "expo": {
    "name": "Florería Tulipanes",
    "slug": "floreria-tulipanes",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.floreria.tulipanes"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.floreria.tulipanes"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

- [ ] **Paso 4: Crear archivo .env**

```
VITE_API_URL=https://floreria-production-4282.up.railway.app/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

- [ ] **Paso 5: Crear estructura base de carpetas**

```bash
mkdir -p src/{screens,components,services,store,navigation,utils}
touch src/App.tsx
touch src/services/api.ts
touch src/store/index.ts
```

- [ ] **Paso 6: Crear App.tsx inicial**

```typescript
// mobile/src/App.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Florería Tulipanes - React Native</Text>
    </View>
  );
}
```

- [ ] **Paso 7: Probar que compila**

```bash
npm start
# Presionar 'i' para iOS o 'a' para Android
```

- [ ] **Paso 8: Commit**

```bash
git add mobile/
git commit -m "feat: initialize React Native project with Expo"
```

---

### Tarea 2: Configurar servicios de API reutilizables

**Archivos:**
- Crear: `mobile/src/services/api.ts`
- Crear: `mobile/src/services/auth.ts`
- Crear: `mobile/src/utils/storage.ts`

- [ ] **Paso 1: Crear cliente HTTP**

```typescript
// mobile/src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://floreria-production-4282.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Navegar a login (manejar en pantalla)
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Paso 2: Instalar AsyncStorage**

```bash
npm install @react-native-async-storage/async-storage
```

- [ ] **Paso 3: Crear servicio de autenticación**

```typescript
// mobile/src/services/auth.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  token: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },

  async getStoredUser() {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

- [ ] **Paso 4: Crear utilidades de almacenamiento**

```typescript
// mobile/src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageUtil = {
  async setItem(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getItem(key: string): Promise<any> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
```

- [ ] **Paso 5: Commit**

```bash
git add mobile/src/services/ mobile/src/utils/
git commit -m "feat: set up API client with auth and storage"
```

---

### Tarea 3: Configurar state management con Zustand

**Archivos:**
- Crear: `mobile/src/store/auth.store.ts`
- Crear: `mobile/src/store/products.store.ts`
- Crear: `mobile/src/store/cart.store.ts`
- Crear: `mobile/src/store/index.ts`

- [ ] **Paso 1: Instalar Zustand**

```bash
npm install zustand
```

- [ ] **Paso 2: Crear auth store**

```typescript
// mobile/src/store/auth.store.ts
import { create } from 'zustand';
import { authService } from '../services/auth';
import { storageUtil } from '../utils/storage';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      const response = await authService.register(data);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  restoreSession: async () => {
    try {
      const token = await authService.getStoredToken();
      const user = await authService.getStoredUser();
      if (token && user) {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Paso 3: Crear products store**

```typescript
// mobile/src/store/products.store.ts
import { create } from 'zustand';
import api from '../services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  stock_quantity: number;
  is_available: boolean;
}

interface ProductsStore {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/products');
      set({ products: response.data.products || response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProductById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/products/${id}`);
      set({ selectedProduct: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/products/search', { params: { q: query } });
      set({ products: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

- [ ] **Paso 4: Crear cart store**

```typescript
// mobile/src/store/cart.store.ts
import { create } from 'zustand';
import { storageUtil } from '../utils/storage';

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartStore {
  items: CartItem[];
  total: number;

  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,

  addToCart: async (item: CartItem) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }

    set({ items });
    await storageUtil.setItem('cart', items);
  },

  removeFromCart: async (productId: number) => {
    const items = get().items.filter((i) => i.product_id !== productId);
    set({ items });
    await storageUtil.setItem('cart', items);
  },

  updateQuantity: async (productId: number, quantity: number) => {
    const items = get().items;
    const item = items.find((i) => i.product_id === productId);
    if (item) {
      item.quantity = quantity;
      set({ items });
      await storageUtil.setItem('cart', items);
    }
  },

  clearCart: async () => {
    set({ items: [] });
    await storageUtil.removeItem('cart');
  },

  loadCart: async () => {
    const items = await storageUtil.getItem('cart');
    set({ items: items || [] });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
```

- [ ] **Paso 5: Exportar todos los stores**

```typescript
// mobile/src/store/index.ts
export { useAuthStore } from './auth.store';
export { useProductsStore } from './products.store';
export { useCartStore } from './cart.store';
```

- [ ] **Paso 6: Commit**

```bash
git add mobile/src/store/
git commit -m "feat: set up Zustand store for auth, products, and cart"
```

---

## FASE 2: COMPONENTES PRINCIPALES (Días 2-3)

### Tarea 4: Crear componentes de UI base

**Archivos:**
- Crear: `mobile/src/components/Button.tsx`
- Crear: `mobile/src/components/Input.tsx`
- Crear: `mobile/src/components/Card.tsx`
- Crear: `mobile/src/components/Loading.tsx`
- Crear: `mobile/src/components/Error.tsx`

- [ ] **Paso 1: Crear Button reutilizable**

```typescript
// mobile/src/components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#9333EA',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#1F2937',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text` as keyof typeof styles],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

- [ ] **Paso 2: Crear Input reutilizable**

```typescript
// mobile/src/components/Input.tsx
import React from 'react';
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  error?: string;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  errorInput: {
    borderColor: '#EF4444',
  },
});

export const Input: React.FC<InputProps> = ({
  containerStyle,
  error,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.input, error && styles.errorInput, containerStyle]}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};
```

- [ ] **Paso 3: Crear Card**

```typescript
// mobile/src/components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};
```

- [ ] **Paso 4: Crear Loading**

```typescript
// mobile/src/components/Loading.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const Loading: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#9333EA" />
    </View>
  );
};
```

- [ ] **Paso 5: Crear Error**

```typescript
// mobile/src/components/Error.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
});

export const Error: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <Text onPress={onRetry} style={{ color: '#9333EA', fontWeight: '600' }}>
          Reintentar
        </Text>
      )}
    </View>
  );
};
```

- [ ] **Paso 6: Commit**

```bash
git add mobile/src/components/
git commit -m "feat: add reusable UI components"
```

---

### Tarea 5: Crear pantallas de autenticación

**Archivos:**
- Crear: `mobile/src/screens/LoginScreen.tsx`
- Crear: `mobile/src/screens/RegisterScreen.tsx`
- Crear: `mobile/src/screens/SplashScreen.tsx`

- [ ] **Paso 1: Crear LoginScreen**

```typescript
// mobile/src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Bienvenido a Florería Tulipanes</Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          title="Iniciar Sesión"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  link: {
    textAlign: 'center',
    color: '#9333EA',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Paso 2: Crear RegisterScreen**

```typescript
// mobile/src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone: phone || undefined,
      });
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>

        <Input
          placeholder="Nombre"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        <Input
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Input
          placeholder="Teléfono (opcional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  link: {
    textAlign: 'center',
    color: '#9333EA',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Paso 3: Crear SplashScreen**

```typescript
// mobile/src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const bootstrap = async () => {
      await restoreSession();
    };

    bootstrap().then(() => {
      setTimeout(() => {
        navigation.navigate(isAuthenticated ? 'Home' : 'Auth');
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Florería Tulipanes</Text>
      <ActivityIndicator size="large" color="#9333EA" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9333EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  loader: {
    marginTop: 20,
  },
});
```

- [ ] **Paso 4: Commit**

```bash
git add mobile/src/screens/
git commit -m "feat: add authentication screens (login, register, splash)"
```

---

### Tarea 6: Crear pantallas principales (Catálogo, Carrito, Perfil)

**Archivos:**
- Crear: `mobile/src/screens/HomeScreen.tsx`
- Crear: `mobile/src/screens/ProductDetailScreen.tsx`
- Crear: `mobile/src/screens/CartScreen.tsx`
- Crear: `mobile/src/screens/ProfileScreen.tsx`

- [ ] **Paso 1: Crear HomeScreen**

```typescript
// mobile/src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useProductsStore, useCartStore } from '../store';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const searchProducts = useProductsStore((state) => state.searchProducts);
  const products = useProductsStore((state) => state.products);
  const isLoading = useProductsStore((state) => state.isLoading);
  const error = useProductsStore((state) => state.error);
  const addToCart = useCartStore((state) => state.addToCart);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      searchProducts(text);
    } else {
      fetchProducts();
    }
  };

  const handleAddToCart = async (product: any) => {
    await addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });
    alert('Producto agregado al carrito');
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchProducts} />;

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>Agregar al carrito</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar flores..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#9333EA',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
```

- [ ] **Paso 2: Crear ProductDetailScreen**

```typescript
// mobile/src/screens/ProductDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useProductsStore, useCartStore } from '../store';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';

export const ProductDetailScreen: React.FC<{
  route: any;
  navigation: any;
}> = ({ route, navigation }) => {
  const { productId } = route.params;
  const fetchProductById = useProductsStore((state) => state.fetchProductById);
  const selectedProduct = useProductsStore((state) => state.selectedProduct);
  const isLoading = useProductsStore((state) => state.isLoading);
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductById(productId);
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    setAddingToCart(true);
    try {
      await addToCart({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        image_url: selectedProduct.image_url,
      });
      Alert.alert(
        'Éxito',
        'Producto agregado al carrito',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el producto');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!selectedProduct) return <Text>Producto no encontrado</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: selectedProduct.image_url }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{selectedProduct.name}</Text>
        <Text style={styles.price}>${selectedProduct.price.toFixed(2)}</Text>
        <Text style={styles.description}>{selectedProduct.description}</Text>

        <Text style={styles.sectionTitle}>Disponibilidad</Text>
        <Text style={styles.availability}>
          {selectedProduct.stock_quantity > 0
            ? `${selectedProduct.stock_quantity} disponibles`
            : 'Sin stock'}
        </Text>

        <Text style={styles.sectionTitle}>Cantidad</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            onPress={() =>
              setQuantity(
                Math.min(selectedProduct.stock_quantity, quantity + 1)
              )
            }
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Agregar al carrito"
          onPress={handleAddToCart}
          loading={addingToCart}
          style={styles.addButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  availability: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
  },
  addButton: {
    marginTop: 24,
    marginBottom: 30,
  },
});
```

- [ ] **Paso 3: Crear CartScreen**

```typescript
// mobile/src/screens/CartScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useCartStore } from '../store';
import { Button } from '../components/Button';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const items = useCartStore((state) => state.items);
  const loadCart = useCartStore((state) => state.loadCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal);

  useEffect(() => {
    loadCart();
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product_name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() =>
            updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
          }
        >
          <Text style={styles.quantityButton}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
        >
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.product_id)}>
        <Text style={styles.deleteButton}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <Button
          title="Continuar comprando"
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${getTotal().toFixed(2)}</Text>
        </View>
        <Button
          title="Proceder al pago"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  shopButton: {
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#9333EA',
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9333EA',
    paddingHorizontal: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 8,
  },
  deleteButton: {
    fontSize: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  checkoutButton: {
    marginBottom: 0,
  },
});
```

- [ ] **Paso 4: Crear ProfileScreen**

```typescript
// mobile/src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    Alert.alert(
      'Confirmar',
      '¿Deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            await logout();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No autenticado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Text style={styles.name}>
          {user.first_name} {user.last_name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>
          {user.role === 'admin' ? 'Administrador' : 'Cliente'}
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opciones</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Mis Órdenes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Mi Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Configuración</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileCard: {
    margin: 16,
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  role: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#1F2937',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
```

- [ ] **Paso 5: Commit**

```bash
git add mobile/src/screens/
git commit -m "feat: add main screens (home, product detail, cart, profile)"
```

---

## FASE 3: NAVEGACIÓN Y INTEGRACIÓN (Día 4)

### Tarea 7: Configurar navegación con React Navigation

**Archivos:**
- Crear: `mobile/src/navigation/RootNavigator.tsx`
- Crear: `mobile/src/navigation/AuthNavigator.tsx`
- Crear: `mobile/src/navigation/AppNavigator.tsx`
- Modificar: `mobile/src/App.tsx`

- [ ] **Paso 1: Instalar React Navigation**

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-gesture-handler react-native-reanimated
```

- [ ] **Paso 2: Crear AuthNavigator**

```typescript
// mobile/src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};
```

- [ ] **Paso 3: Crear AppNavigator**

```typescript
// mobile/src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: 'Catálogo' }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalles del Producto' }}
      />
    </HomeStack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#9333EA',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Catálogo',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🌹</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
```

- [ ] **Paso 4: Crear RootNavigator**

```typescript
// mobile/src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Loading } from '../components/Loading';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
```

- [ ] **Paso 5: Actualizar App.tsx**

```typescript
// mobile/src/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store';
import 'react-native-gesture-handler';

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

- [ ] **Paso 6: Commit**

```bash
git add mobile/src/navigation/ mobile/src/App.tsx
git commit -m "feat: set up React Navigation with auth and app flows"
```

---

## FASE 4: TESTING Y DEPLOYMENT (Días 5-7)

### Tarea 8: Crear build para iOS y Android con Expo

**Archivos:**
- Crear: `mobile/eas.json`

- [ ] **Paso 1: Instalar EAS CLI**

```bash
npm install -g eas-cli
eas login
```

- [ ] **Paso 2: Crear configuración EAS**

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "requireCommit": true
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": {
        "asciiProvider": "app-store-connect",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "googleServiceAccount": "./google-services.json"
      }
    }
  }
}
```

- [ ] **Paso 3: Configurar credenciales para iOS**

```bash
eas build --platform ios
# Sigue el asistente para configurar certificados
```

- [ ] **Paso 4: Configurar credenciales para Android**

```bash
eas build --platform android
# Sigue el asistente para configurar keystore
```

- [ ] **Paso 5: Build para preview (APK)**

```bash
eas build --platform android --profile preview
# Esto genera un APK que puedes descargar e instalar
```

- [ ] **Paso 6: Build para producción**

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

- [ ] **Paso 7: Commit**

```bash
git add mobile/eas.json
git commit -m "feat: configure EAS for iOS and Android builds"
```

---

### Tarea 9: Optimizaciones finales y tests

**Archivos:**
- Crear: `mobile/src/__tests__/auth.test.ts`
- Crear: `mobile/src/__tests__/cart.test.ts`

- [ ] **Paso 1: Instalar testing libraries**

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest
```

- [ ] **Paso 2: Crear test de autenticación**

```typescript
// mobile/src/__tests__/auth.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../store/auth.store';

describe('Auth Store', () => {
  it('should restore session on app load', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.restoreSession();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
```

- [ ] **Paso 3: Crear test del carrito**

```typescript
// mobile/src/__tests__/cart.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCartStore } from '../store/cart.store';

describe('Cart Store', () => {
  it('should add item to cart', async () => {
    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addToCart({
        product_id: 1,
        product_name: 'Rosa',
        price: 99.99,
        quantity: 1,
        image_url: 'https://...',
      });
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].product_id).toBe(1);
  });

  it('should calculate total correctly', async () => {
    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addToCart({
        product_id: 1,
        product_name: 'Rosa',
        price: 100,
        quantity: 2,
        image_url: 'https://...',
      });
    });

    expect(result.current.getTotal()).toBe(200);
  });
});
```

- [ ] **Paso 4: Ejecutar tests**

```bash
npm test
```

- [ ] **Paso 5: Optimizar performance**

Crear `mobile/src/utils/performance.ts`:

```typescript
// mobile/src/utils/performance.ts
import { useMemo } from 'react';

export const useOptimizedList = (items: any[], predicate: (item: any) => boolean) => {
  return useMemo(() => items.filter(predicate), [items, predicate]);
};

export const useDebounce = (value: string, delay: number = 300): string => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

- [ ] **Paso 6: Commit**

```bash
git add mobile/src/__tests__/ mobile/src/utils/performance.ts
git commit -m "test: add unit tests and performance optimizations"
```

---

### Tarea 10: Documentación y publicación

**Archivos:**
- Crear: `mobile/README.md`
- Crear: `mobile/DEPLOYMENT.md`

- [ ] **Paso 1: Crear README**

```markdown
# Florería Tulipanes - React Native App

## Instalación

```bash
cd mobile
npm install
npm start
```

## Development

```bash
# iOS
npm start
# Presionar 'i'

# Android
npm start
# Presionar 'a'
```

## Build

```bash
# Preview APK
eas build --platform android --profile preview

# Production
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Estructura

- `src/screens/` - Pantallas principales
- `src/components/` - Componentes reutilizables
- `src/services/` - API services
- `src/store/` - Zustand stores
- `src/navigation/` - React Navigation setup

## Características

- ✅ Autenticación
- ✅ Catálogo de productos
- ✅ Carrito de compras
- ✅ Perfil de usuario
- ✅ Búsqueda y filtrado
- ✅ Notificaciones push (próximo)
```

- [ ] **Paso 2: Crear DEPLOYMENT.md**

```markdown
# Deployment Guide

## iOS App Store

1. Completar build en EAS:
```bash
eas build --platform ios --profile production
```

2. Ir a App Store Connect y crear nueva app
3. Configurar:
   - App Name: Florería Tulipanes
   - Primary Language: Spanish
   - Bundle ID: com.floreria.tulipanes

4. Subir build:
```bash
eas submit --platform ios
```

## Google Play

1. Completar build:
```bash
eas build --platform android --profile production
```

2. Ir a Google Play Console
3. Crear nueva app con:
   - Nombre: Florería Tulipanes
   - Package name: com.floreria.tulipanes

4. Subir build:
```bash
eas submit --platform android
```
```

- [ ] **Paso 3: Commit**

```bash
git add mobile/README.md mobile/DEPLOYMENT.md
git commit -m "docs: add setup and deployment documentation"
```

---

## CHECKLIST DE COMPLETITUD

✅ **Fase 1:** Setup + servicios API
✅ **Fase 2:** Componentes + pantallas principales
✅ **Fase 3:** Navegación + integración completa
✅ **Fase 4:** Testing + deployment

---

## SIGUIENTES PASOS (Opcional)

1. **Notificaciones Push:** `expo-notifications`
2. **Biometría:** `expo-local-authentication`
3. **Cámara:** Para fotos de productos/reviews
4. **Maps:** Ubicación de tiendas
5. **Payment:** Stripe SDK nativo

