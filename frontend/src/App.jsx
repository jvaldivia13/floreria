import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <h1>Florería Tulipanes</h1>
            <p className="tagline">a tu Alcance</p>
          </div>
          <nav className="header-nav">
            <button>Iniciar sesión</button>
            <button className="btn-primary">Registrarse</button>
          </nav>
        </div>
      </header>

      <nav className="main-nav">
        <ul>
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Catálogo</a></li>
          <li><a href="#">Ofertas</a></li>
          <li><a href="#">Contacto</a></li>
        </ul>
      </nav>

      <main className="main-content">
        <section className="hero">
          <h2>Bienvenido a Florería Tulipanes</h2>
          <p>Las más hermosas flores para tus ocasiones especiales</p>
          <button className="btn-primary btn-large">Ver catálogo</button>
        </section>

        <section className="featured-products">
          <h2>Productos destacados</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">Imagen 1</div>
              <h3>Producto 1</h3>
              <p className="price">S/. 50.00</p>
              <button>Agregar al carrito</button>
            </div>
            <div className="product-card">
              <div className="product-image">Imagen 2</div>
              <h3>Producto 2</h3>
              <p className="price">S/. 75.00</p>
              <button>Agregar al carrito</button>
            </div>
            <div className="product-card">
              <div className="product-image">Imagen 3</div>
              <h3>Producto 3</h3>
              <p className="price">S/. 100.00</p>
              <button>Agregar al carrito</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>Acerca de nosotros</h4>
            <p>Florería Tulipanes ofrece las más hermosas flores frescas para todas tus ocasiones.</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces rápidos</h4>
            <ul>
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Catálogo</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>Email: info@floreria.com</p>
            <p>Teléfono: (51) 999-999-999</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Florería Tulipanes a tu Alcance. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
