import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administrador</h1>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>📦 Gestionar Productos</h2>
          <p>Crear, editar y eliminar productos del catálogo</p>
          <button onClick={() => navigate('/admin/products')} className="btn btn-primary">
            Ir a Productos
          </button>
        </div>

        <div className="admin-card">
          <h2>📋 Gestionar Órdenes</h2>
          <p>Ver y actualizar el estado de los pedidos</p>
          <button onClick={() => navigate('/admin/orders')} className="btn btn-primary">
            Ir a Órdenes
          </button>
        </div>

        <div className="admin-card">
          <h2>📊 Ver Reportes</h2>
          <p>Dashboard de ventas, productos y clientes</p>
          <button onClick={() => navigate('/admin/reports')} className="btn btn-primary">
            Ver Reportes
          </button>
        </div>

        <div className="admin-card">
          <h2>🎟️ Gestionar Cupones</h2>
          <p>Crear y administrar códigos de descuento</p>
          <button onClick={() => navigate('/admin/coupons')} className="btn btn-primary">
            Ir a Cupones
          </button>
        </div>
      </div>
    </div>
  );
}
