import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password, nombre, telefono, direccion) =>
    api.post('/auth/register', { email, password, nombre, telefono, direccion }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const productsAPI = {
  getProducts: (page = 1, limit = 20, categoria, search) =>
    api.get('/products', { params: { page, limit, categoria, search } }),
  getProductById: (id) => api.get(`/products/${id}`),
};

export const cartAPI = {
  addToCart: (product_id, cantidad) => api.post('/cart', { product_id, cantidad }),
  getCart: () => api.get('/cart'),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  updateCartItem: (itemId, cantidad) => api.put(`/cart/${itemId}`, { cantidad }),
};

export const ordersAPI = {
  createOrder: (direccion_entrega, fecha_entrega_esperada, metodo_pago) =>
    api.post('/orders', { direccion_entrega, fecha_entrega_esperada, metodo_pago }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/my-orders'),
};

export const reviewsAPI = {
  getReviewsByProduct: (product_id) => api.get(`/reviews/product/${product_id}`),
  createReview: (product_id, rating, comentario) =>
    api.post('/reviews', { product_id, rating, comentario }),
};

export const wishlistAPI = {
  addToWishlist: (product_id) => api.post('/wishlist', { product_id }),
  getWishlist: () => api.get('/wishlist'),
  removeFromWishlist: (product_id) => api.delete(`/wishlist/${product_id}`),
};

export const couponsAPI = {
  validateCoupon: (codigo) => api.post('/coupons/validate', { codigo }),
};

export default api;
