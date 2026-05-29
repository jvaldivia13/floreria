import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminOrders.css';

export default function AdminOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      navigate('/');
      return;
    }
    // Aquí irá la llamada a la API para obtener órdenes
    setLoading(false);
  }, [user, navigate]);

  return (
    <div className="admin-orders">
      <h1>Gestión de Órdenes</h1>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="6" className="empty-state">No hay órdenes aún</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
