import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="container">
      <section className="section-header">
        <h1 className="section-title">Acerca de la Plataforma</h1>
        <p className="section-subtitle">
          DataAnalytics Suite es una solución web de alto rendimiento desarrollada en el marco del Seminario de Práctica Profesional.
        </p>
      </section>

      {/* Tarjetas de Tecnologías Principales */}
      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <span className="tag-label">Frontend Engine</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>React 19 &amp; TypeScript</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Construido sobre la última versión de React con tipado estático estricto para garantizar solidez de tipos, mantenibilidad y renderizado eficiente.
          </p>
        </div>

        <div className="card">
          <span className="tag-label">Build System</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Vite Build System</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Empaquetamiento ultrarrápido con reemplazo de módulos en caliente (HMR) y compilación optimizada para entornos de producción corporativos.
          </p>
        </div>

        <div className="card">
          <span className="tag-label">Data Computing</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>PapaParse &amp; NumPy Math</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Stream de datos multihilo para archivos CSV de gran volumen combinado con algoritmos de cálculo cuantitativo de baja latencia.
          </p>
        </div>
      </div>

      {/* Misión del Sistema & Ficha del Desarrollador */}
      <div className="grid-2">
        <div className="card">
          <span className="tag-label">Visión Institucional</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Misión del Sistema
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Proporcionar a los analistas de datos e instituciones corporativas una herramienta centralizada que simplifique la ingesta de archivos planos, automatice la limpieza de registros inconsistentes y genere métricas descriptivas con la maxima precisión técnica sin depender de servidores pesados.
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span className="tag-label">Ficha Académica</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Información del Proyecto
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <li style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Equipo de Desarrollo:</strong> Proyecto en Equipo (Seminario de Práctica)
            </li>
            <li style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Contexto Académico:</strong> Seminario de Práctica Profesional
            </li>
            <li style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Especialidad:</strong> Ingeniería de Software &amp; Arquitectura Web
            </li>
            <li style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Estado del Proyecto:</strong> Versión 1.0 Corporativa (Producción)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;