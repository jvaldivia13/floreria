import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Flores Frescas Para Cada Ocasión</h1>
        <p>Arreglos florales de calidad entregados en Lima</p>
        <Link to="/catalog" className="btn btn-primary">Ver Catálogo</Link>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🚚 Entrega Rápida</h3>
          <p>Entregas al día siguiente en toda Lima</p>
        </div>
        <div className="feature">
          <h3>💳 Pago Seguro</h3>
          <p>Paga con YAPE o Plin de forma segura</p>
        </div>
        <div className="feature">
          <h3>🌸 Flores Frescas</h3>
          <p>Las mejores flores seleccionadas diariamente</p>
        </div>
      </section>
    </div>
  );
}
