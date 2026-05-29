import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import '../styles/Checkout.css';

export default function Checkout() {
  const { items, clearCart, total } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    direccion_entrega: user?.direccion || '',
    fecha_entrega_esperada: '',
    metodo_pago: 'yape',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ordersAPI.createOrder(
        formData.direccion_entrega,
        formData.fecha_entrega_esperada,
        formData.metodo_pago
      );

      clearCart();
      navigate(`/order-success/${response.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <h2>Detalles de Entrega</h2>

            <div className="form-group">
              <label>Dirección de Entrega</label>
              <textarea
                name="direccion_entrega"
                value={formData.direccion_entrega}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Fecha Esperada de Entrega</label>
              <input
                type="date"
                name="fecha_entrega_esperada"
                value={formData.fecha_entrega_esperada}
                onChange={handleChange}
                required
              />
            </div>

            <h2>Método de Pago</h2>

            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pago"
                  value="yape"
                  checked={formData.metodo_pago === 'yape'}
                  onChange={handleChange}
                />
                <span>YAPE</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pago"
                  value="plin"
                  checked={formData.metodo_pago === 'plin'}
                  onChange={handleChange}
                />
                <span>PLIN</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Orden'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Resumen</h2>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.nombre} x {item.cantidad}</span>
                <span>S/. {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>S/. {(total - 20).toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Envío:</span>
              <span>S/. 20.00</span>
            </div>
            <div className="total-line total">
              <span>Total:</span>
              <span>S/. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
