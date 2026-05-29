import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/Cart.css';

export default function Cart() {
  const { items, total, removeItem, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = items.length > 0 ? 20 : 0;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h1>Carrito de Compras</h1>
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <Link to="/catalog" className="btn btn-primary">Continuar comprando</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>

      <div className="cart-content">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="item-image" onError={(e) => e.target.style.display = 'none'} />
              )}
              <div className="item-info">
                <h3>{item.name}</h3>
                {item.description && <p className="item-description">{item.description}</p>}
                <p className="item-price">S/. {parseFloat(item.price).toFixed(2)}</p>
              </div>

              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <input type="number" value={item.quantity} readOnly />
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>

              <div className="item-subtotal">
                <p>S/. {(item.price * item.quantity).toFixed(2)}</p>
              </div>

              <button onClick={() => removeItem(item.id)} className="btn-remove">Eliminar</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen de Compra</h2>
          <div className="summary-line">
            <span>Subtotal:</span>
            <span>S/. {parseFloat(subtotal).toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Envío:</span>
            <span>S/. {shipping}</span>
          </div>
          <div className="summary-line total">
            <span>Total:</span>
            <span>S/. {parseFloat(subtotal + shipping).toFixed(2)}</span>
          </div>

          <button onClick={handleCheckout} className="btn btn-primary btn-checkout">
            Proceder al Pago
          </button>

          <Link to="/catalog" className="btn btn-secondary">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
