import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Columna 1: Resumen de Marca */}
        <div className="footer-brand">
          <h3>DataAnalytics Suite</h3>
          <p>
            Plataforma corporativa de ingeniería de datos para ingesta masiva CSV, computación cuantitativa y generación de reportes ejecutivos.
          </p>
        </div>

        {/* Columna 2: Navegación Principal */}
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/home">Inicio</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* Columna 3: Accesos Módulos */}
        <div className="footer-col">
          <h4>Módulos Dashboard</h4>
          <ul>
            <li><Link to="/dashboard">Ingesta Pandas (CSV)</Link></li>
            <li><Link to="/dashboard">Métricas NumPy</Link></li>
            <li><Link to="/dashboard">Reportes &amp; Gráficos</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} DataAnalytics Platform. Todos los derechos reservados.</p>
        <p>Desarrollado por: <strong>Equipo de Desarrollo - Seminario de Práctica</strong></p>
      </div>
    </footer>
  );
};

export default Footer;
