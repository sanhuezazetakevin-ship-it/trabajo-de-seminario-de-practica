import React, { useMemo } from 'react';
import './charts.css';

interface ChartsProps {
  data: Record<string, any>[];
}

export const ChartsPage: React.FC<ChartsProps> = ({ data }) => {
  // Procesamiento cuantitativo para los gráficos de barras nativas CSS
  const { totalRecords, categoriaBars, canalBars, riesgoBars } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalRecords: 0, categoriaBars: [], canalBars: [], riesgoBars: [] };
    }

    const total = data.length;
    const catMap: Record<string, number> = {};
    const canalMap: Record<string, number> = {};
    let riesgoCount = 0;
    let normalCount = 0;

    for (let i = 0; i < total; i++) {
      const row = data[i];

      // Categoría / Segmento
      const cat = String(row.categoria_comercio ?? row.segmento_cliente ?? row.departamento ?? row.categoria ?? 'General');
      catMap[cat] = (catMap[cat] || 0) + 1;

      // Canal / Ubicación
      const canal = String(row.canal_transaccion ?? row.linea_negocio ?? row.sede ?? row.canal ?? 'Online');
      canalMap[canal] = (canalMap[canal] || 0) + 1;

      // Riesgo / Estado
      const rVal = row.es_fraude_confirmado ?? row.es_churn_confirmado ?? row.falla_critica_30d ?? row.riesgo;
      if (rVal !== undefined && rVal !== null) {
        if (Number(rVal) === 1 || String(rVal).toLowerCase() === 'alto') riesgoCount++;
        else normalCount++;
      }
    }

    // Transformación a estructuras con porcentaje y absoluto
    const catList = Object.entries(catMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const maxCatCount = catList.length > 0 ? Math.max(...catList.map((c) => c.count)) : 1;

    const canalList = Object.entries(canalMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const maxCanalCount = canalList.length > 0 ? Math.max(...canalList.map((c) => c.count)) : 1;

    const totalRiesgoEvaluado = riesgoCount + normalCount;
    const riesgoList = totalRiesgoEvaluado > 0
      ? [
          { name: 'Operaciones Normales', count: normalCount, pct: (normalCount / totalRiesgoEvaluado) * 100 },
          { name: 'Alertas de Alto Riesgo', count: riesgoCount, pct: (riesgoCount / totalRiesgoEvaluado) * 100 },
        ]
      : [];

    return {
      totalRecords: total,
      categoriaBars: catList.map((item) => ({ ...item, fillPct: (item.count / maxCatCount) * 100 })),
      canalBars: canalList.map((item) => ({ ...item, fillPct: (item.count / maxCanalCount) * 100 })),
      riesgoBars: riesgoList.map((item) => ({ ...item, fillPct: item.pct })),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Reportes Ejecutivos &amp; Gráficos
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Generación de distribuciones gráficas en CSS nativo y exportación a informe PDF.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="tag-label">Dataset Requerido</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No hay datos cargados para graficar
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            Por favor, dirígete a la pestaña <strong>Pandas (CSV)</strong> para cargar un archivo de datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera y Botón Exportar PDF */}
      <div className="action-bar no-print" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="tag-label">Informe Consolidado</span>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: 0 }}>
            Dashboard de Métricas &amp; Distribuciones
          </h2>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => window.print()}>
          Exportar Informe PDF
        </button>
      </div>

      {/* Área Imprimible / Gráficos de Barras CSS Nativo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="charts-grid">
          {/* Gráfico 1: Categorías / Segmentos */}
          <div className="chart-card">
            <span className="tag-label">Distribución 01</span>
            <h3 className="chart-title">Distribución por Categoría / Segmento</h3>

            <div className="css-bar-chart">
              {categoriaBars.map((item) => (
                <div key={item.name} className="chart-item">
                  <div className="chart-item-header">
                    <span className="chart-item-label">{item.name}</span>
                    <span className="chart-item-meta">
                      <strong>{item.count.toLocaleString('es-ES')}</strong> reg. ({item.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(item.fillPct, 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico 2: Distribución por Canal */}
          <div className="chart-card">
            <span className="tag-label">Distribución 02</span>
            <h3 className="chart-title">Distribución por Canal Transaccional</h3>

            <div className="css-bar-chart">
              {canalBars.map((item) => (
                <div key={item.name} className="chart-item">
                  <div className="chart-item-header">
                    <span className="chart-item-label">{item.name}</span>
                    <span className="chart-item-meta">
                      <strong>{item.count.toLocaleString('es-ES')}</strong> reg. ({item.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill accent-teal"
                      style={{ width: `${Math.max(item.fillPct, 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico 3: Matriz de Riesgo si existe */}
        {riesgoBars.length > 0 && (
          <div className="chart-card">
            <span className="tag-label">Distribución 03</span>
            <h3 className="chart-title">Estado de Riesgo &amp; Alertas Detectadas</h3>

            <div className="css-bar-chart">
              {riesgoBars.map((item, idx) => (
                <div key={item.name} className="chart-item">
                  <div className="chart-item-header">
                    <span className="chart-item-label">{item.name}</span>
                    <span className="chart-item-meta">
                      <strong>{item.count.toLocaleString('es-ES')}</strong> registros ({item.pct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${idx === 1 ? 'accent-amber' : ''}`}
                      style={{ width: `${Math.max(item.pct, 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuadro Resumen Ejecutivo para Impresión PDF */}
        <div className="card" style={{ backgroundColor: 'var(--bg-card-alt)' }}>
          <span className="tag-label">Resumen de Auditoría</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Consolidado Institucional del Muestreo
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Informe generado automáticamente por el sistema <strong>DataAnalytics Suite</strong>. Se han evaluado{' '}
            <strong style={{ color: 'var(--text-main)' }}>{totalRecords.toLocaleString('es-ES')}</strong> registros tabulares procesados localmente sin alteración externa de datos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;