import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import './styles/App.css';

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const { items } = useContext(CartContext);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">Florería Tulipanes</Link>
          <nav className="nav">
            <Link to="/">Inicio</Link>
            <Link to="/catalog">Catálogo</Link>
            <Link to="/cart" className="cart-link">
              🛒 Carrito ({items.length})
            </Link>
            {user ? (
              <div className="user-section">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button onClick={logout} className="btn-logout">Salir</button>
              </div>
            ) : (
              <div className="auth-section">
                <Link to="/login" className="btn btn-link">Iniciar sesión</Link>
                <Link to="/register" className="btn btn-primary">Registrarse</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>Calle Los Andes 120, Miraflores | Tel: 5580885 | Email: info@floreria.com</p>
          <p>&copy; 2024 Florería Tulipanes a tu Alcance. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
