import { useEffect, useState, useContext } from 'react';
import { productsAPI } from '../services/api';
import { CartContext } from '../context/CartContext';
import '../styles/Catalog.css';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [categoria, setCategoria] = useState('');
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, [page, categoria, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts(page, 20, categoria || undefined, search || undefined);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    alert('Producto agregado al carrito');
  };

  const handleCategoryChange = (e) => {
    setCategoria(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="catalog">
      <h1>Catálogo de Productos</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={categoria} onChange={handleCategoryChange} className="filter-select">
          <option value="">Todas las categorías</option>
          <option value="arreglos">Arreglos</option>
          <option value="complementos">Complementos</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Cargando productos...</p>
      ) : (
        <>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map(product => (
                <div key={product.id} className="product-card">
                  {product.foto_url && (
                    <img src={product.foto_url} alt={product.nombre} className="product-image" />
                  )}
                  <div className="product-content">
                    <h3>{product.nombre}</h3>
                    {product.descripcion && <p className="description">{product.descripcion}</p>}
                    <p className="price">S/. {parseFloat(product.precio).toFixed(2)}</p>
                    {product.stock > 0 ? (
                      <button onClick={() => handleAddToCart(product)} className="btn btn-small">
                        Agregar al carrito
                      </button>
                    ) : (
                      <p className="out-of-stock">Sin stock</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-products">No se encontraron productos</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-pagination"
              >
                ← Anterior
              </button>
              <span className="page-info">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-pagination"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
