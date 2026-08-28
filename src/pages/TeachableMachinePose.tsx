import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Sección Hero Ejecutiva */}
      <section className="hero-section">
        <h1 className="hero-title">
          Pose&amp; <span>Procesamiento de Datos</span>
        </h1>
        <p className="hero-subtitle">
          Infraestructura de alto rendimiento diseñada para la carga, limpieza y evaluación estadística de conjuntos de datos masivos. Generación de informes financieros e inteligencia analítica corporativa.
        </p>
        <div className="hero-actions">
          <button className="btn btn-lg btn-primary" onClick={() => navigate('/dashboard')}>
            Iniciar Dashboard
          </button>
          <button className="btn btn-lg btn-outline" onClick={() => navigate('/servicios')}>
            Explorar Servicios
          </button>
        </div>
      </section>

      {/* Grid de 3 Tarjetas de Beneficios / Módulos */}
      <section style={{ marginTop: '4rem' }}>
        <div className="section-header">
          <h2 className="section-title">Módulos de la Plataforma</h2>
          <p className="section-subtitle">
            Arquitectura desacoplada en tres etapas clave para garantizar integridad y rapidez.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <span className="tag-label">Módulo 01</span>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '1.2rem' }}>
              Ingesta &amp; Limpieza CSV
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Procesamiento por secuencias mediante Web Workers. Filtrado automático de registros nulos, depuración de anomalías y visualización paginada de tablas numéricas.
            </p>
          </div>

          <div className="card">
            <span className="tag-label">Módulo 02</span>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '1.2rem' }}>
              Cálculo Estadístico NumPy
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Motor de analítica cuantitativa O(N) para la extracción rápida de medias, medianas, desviación estándar, percentiles y evaluación de riesgo transaccional.
            </p>
          </div>

          <div className="card">
            <span className="tag-label">Módulo 03</span>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '1.2rem' }}>
              Reportes &amp; Exportación PDF
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Generación de gráficos distribucionales y exportación directa de informes consolidados listos para auditorías institucionales y toma de decisiones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;