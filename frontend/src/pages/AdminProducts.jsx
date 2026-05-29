import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { productsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminProducts.css';

export default function AdminProducts() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts(1, 100);
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <h1>Gestión de Productos</h1>
        <button onClick={() => navigate('/admin/products/new')} className="btn btn-primary">
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.nombre}</td>
                  <td>S/. {parseFloat(product.precio).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button 
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                      className="btn-action edit"
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-action delete"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
