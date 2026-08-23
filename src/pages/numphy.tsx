import React, { useMemo } from 'react';
import './numphy.css';

function inferColumnType(values: any[]): string {
  interface NumericStats {
  type: 'numeric';
  count: number;
  sum: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
}

function computeNumericStats(values: number[]): NumericStats {
  const N = values.length;

  let suma = 0;
  let min = values[0];
  let max = values[0];

  for (let i = 0; i < N; i++) {
    const v = values[i];
    suma += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const mean = suma / N;

  let varianzaSum = 0;
  for (let i = 0; i < N; i++) {
    varianzaSum += Math.pow(values[i] - mean, 2);
  }
  const stdDev = Math.sqrt(varianzaSum / N);

  const sorted = [...values].sort((a, b) => a - b);
  const median = N % 2 === 0 ? (sorted[N / 2 - 1] + sorted[N / 2]) / 2 : sorted[Math.floor(N / 2)];

  return {
    type: 'numeric',
    count: N,
    sum: suma,
    mean,
    median,
    stdDev,
    min,
    max,
  };
}

  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'empty';

  const numericCount = nonNull.filter(v => !isNaN(parseFloat(v))).length;
  const ratio = numericCount / nonNull.length;

  if (ratio > 0.9) {
    return 'numeric';
  }
  return 'categorical';
}

interface NumpyProps {
  data: Record<string, any>[];
}

export const NumpyPage: React.FC<NumpyProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const montos: number[] = [];
    let sumScore = 0;
    let countScore = 0;
    let totalFraudes = 0;
    let countFraudeValid = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Extracción de valores numéricos principales (Monto/Salario/Transacción)
      const rawMonto = row.monto_transaccion_usd ?? row.monto ?? row.Salario ?? row.salario ?? row.monto_total;
      if (rawMonto !== undefined && rawMonto !== null) {
        const val = typeof rawMonto === 'number' ? rawMonto : parseFloat(rawMonto);
        if (!isNaN(val)) montos.push(val);
      }

      // Score de Riesgo
      const rawScore = row.score_riesgo_autenticacion ?? row.score_riesgo ?? row.score;
      if (rawScore !== undefined && rawScore !== null) {
        const val = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore);
        if (!isNaN(val)) {
          sumScore += val;
          countScore++;
        }
      }

      // Casos de Fraude / Alerta
      const rawFraude = row.es_fraude_confirmado ?? row.es_fraude ?? row.alerta;
      if (rawFraude !== undefined && rawFraude !== null) {
        const val = typeof rawFraude === 'number' ? rawFraude : parseFloat(rawFraude);
        if (!isNaN(val)) {
          countFraudeValid++;
          if (val === 1) totalFraudes++;
        }
      }
    }

    const N = montos.length;
    if (N === 0) return null;

    let suma = 0;
    let min = montos[0];
    let max = montos[0];

    for (let i = 0; i < N; i++) {
      const v = montos[i];
      suma += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const mean = suma / N;

    let varianzaSum = 0;
    for (let i = 0; i < N; i++) {
      varianzaSum += Math.pow(montos[i] - mean, 2);
    }
    const stdDev = Math.sqrt(varianzaSum / N);

    const sorted = [...montos].sort((a, b) => a - b);
    const median = N % 2 === 0 ? (sorted[N / 2 - 1] + sorted[N / 2]) / 2 : sorted[Math.floor(N / 2)];

    return {
      totalRegistros: N,
      sumaMontos: suma,
      mediaMonto: mean,
      medianaMonto: median,
      stdDevMonto: stdDev,
      minMonto: min,
      maxMonto: max,
      mediaScore: countScore > 0 ? sumScore / countScore : 0,
      totalFraudes,
      tasaFraudePct: countFraudeValid > 0 ? (totalFraudes / countFraudeValid) * 100 : 0,
    };
  }, [data]);

  const fmt = (val: number, decimals = 2) =>
    val.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  if (!stats) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Métricas Cuantitativas (NumPy Engine)
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Evaluación matemática y estadística calculada dinámicamente sobre la muestra.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="tag-label">Dataset Requerido</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No hay datos cargados en memoria
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            Por favor, dirígete a la pestaña <strong>Pandas (CSV)</strong> para seleccionar y cargar un archivo de datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          Métricas Cuantitativas (NumPy Engine)
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Resumen descriptivo y matriz estadística avanzada computada en O(N).
        </p>
      </div>

      {/* Grid de Tarjetas KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Muestra Procesada</div>
          <div className="kpi-value">{stats.totalRegistros.toLocaleString('es-ES')}</div>
          <div className="kpi-subtext">Registros numéricos analizados</div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-label">Promedio Central (Mean)</div>
          <div className="kpi-value">${fmt(stats.mediaMonto)}</div>
          <div className="kpi-subtext">Valor medio por transacción</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">Desviación Estándar</div>
          <div className="kpi-value">${fmt(stats.stdDevMonto)}</div>
          <div className="kpi-subtext">Volatilidad / Dispersión de muestra</div>
        </div>
      </div>

      {/* Matriz Cuantitativa Completa */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="tag-label">Matriz Analítica</span>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>
              Indicadores Cuantitativos Consolidados
            </h3>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table matrix-table">
            <thead>
              <tr>
                <th>Indicador / Métrica</th>
                <th>Valor de Obtención (NumPy)</th>
                <th>Descripción Técnica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Muestra Procesada (N)</strong></td>
                <td>{stats.totalRegistros.toLocaleString('es-ES')} registros</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Tamaño muestral con valores numéricos coherentes</span></td>
              </tr>
              <tr>
                <td><strong>Suma Acumulada (Sum)</strong></td>
                <td>${fmt(stats.sumaMontos)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Totalización lineal de la muestra agregada</span></td>
              </tr>
              <tr>
                <td><strong>Promedio Central (Mean)</strong></td>
                <td>${fmt(stats.mediaMonto)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Media aritmética muestral (\(\mu\))</span></td>
              </tr>
              <tr>
                <td><strong>Mediana Punto Medio (Median)</strong></td>
                <td>${fmt(stats.medianaMonto)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Percentil 50 libre de sesgos por valores atípicos</span></td>
              </tr>
              <tr>
                <td><strong>Desviación Estándar (Std Dev)</strong></td>
                <td>${fmt(stats.stdDevMonto)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Desviación cuadrática media de la distribución (\(\sigma\))</span></td>
              </tr>
              <tr>
                <td><strong>Mínimo Absoluto (Min)</strong></td>
                <td>${fmt(stats.minMonto)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Límite inferior registrado en la serie de datos</span></td>
              </tr>
              <tr>
                <td><strong>Máximo Absoluto (Max)</strong></td>
                <td>${fmt(stats.maxMonto)}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>Límite superior registrado en la serie de datos</span></td>
              </tr>
              {stats.mediaScore > 0 && (
                <tr>
                  <td><strong>Score Promedio de Riesgo</strong></td>
                  <td>{stats.mediaScore.toFixed(3)}</td>
                  <td><span style={{ color: 'var(--text-muted)' }}>Índice de riesgo escalar estandarizado (0.0 a 1.0)</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NumpyPage;