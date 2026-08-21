import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Service.css';

const Service: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <section className="section-header">
        <h1 className="section-title">Catálogo de Servicios Analíticos</h1>
        <p className="section-subtitle">
          Soluciones especializadas integradas dentro de la plataforma corporativa.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Servicio 01 */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="tag-label">Servicio 01</span>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Ingesta &amp; Depuración de Datos CSV
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Permite la carga directa de archivos CSV en la memoria local del navegador sin comprometer la privacidad ni la velocidad. Incluye funciones avanzadas de filtrado para remoción instantánea de filas vacías o campos nulos con trazabilidad de registros.
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Ir a Ingesta CSV
            </button>
          </div>
        </div>

        {/* Servicio 02 */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="tag-label">Servicio 02</span>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Análisis Estadístico &amp; Matriz Numérica
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Procesamiento cuantitativo mediante fórmulas optimizadas NumPy. Obtén métricas claves de tendencia central (suma, media, mediana), medidas de dispersión (desviación estándar) y valores extremos (mínimos y máximos) en milisegundos.
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Ver Métricas NumPy
            </button>
          </div>
        </div>

        {/* Servicio 03 */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="tag-label">Servicio 03</span>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Visualización Gráfica &amp; Reporte Impreso PDF
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Visualización gráfica con barras de gradiente y porcentajes acumulados. Genera informes listos para imprimir o guardar como archivos PDF corporativos mediante un solo clic.
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Generar Reporte PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;