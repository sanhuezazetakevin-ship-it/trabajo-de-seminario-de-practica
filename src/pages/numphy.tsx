import React, { useMemo } from 'react';
import './numphy.css';

function inferColumnType(values: any[]): string {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'empty';

  const numericCount = nonNull.filter(v => !isNaN(parseFloat(v))).length;
  const ratio = numericCount / nonNull.length;

  if (ratio > 0.9) {
    return 'numeric';
  }
  return 'categorical';
}

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

interface BooleanStats {
  type: 'boolean';
  count: number;
  trueCount: number;
  truePct: number;
}

function computeBooleanStats(values: number[]): BooleanStats {
  let trueCount = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 1) trueCount++;
  }
  return {
    type: 'boolean',
    count: values.length,
    trueCount,
    truePct: (trueCount / values.length) * 100,
  };
}

interface CategoricalStats {
  type: 'categorical';
  count: number;
  uniqueValues: number;
  topValues: { value: string; count: number; pct: number }[];
}

function computeCategoricalStats(values: string[]): CategoricalStats {
  const counts: Record<string, number> = {};

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    counts[v] = (counts[v] || 0) + 1;
  }

  const entries = Object.entries(counts);
  entries.sort((a, b) => b[1] - a[1]);
  const top5 = entries.slice(0, 5);

  const topValues = top5.map(([value, count]) => ({
    value,
    count,
    pct: (count / values.length) * 100,
  }));

  return {
    type: 'categorical',
    count: values.length,
    uniqueValues: entries.length,
    topValues,
  };
}

function analyzeDataset(data: Record<string, any>[]) {
  if (!data || data.length === 0) return [];

  const columnNames = Object.keys(data[0]);
  const results = [];

  for (let c = 0; c < columnNames.length; c++) {
    const colName = columnNames[c];
    const rawValues = data.map(row => row[colName]);
    const type = inferColumnType(rawValues);

    if (type === 'numeric') {
      const numericValues = rawValues
        .filter(v => v !== null && v !== undefined && v !== '')
        .map(v => typeof v === 'number' ? v : parseFloat(v));

      const uniqueVals = new Set(numericValues);
      const isBoolean = uniqueVals.size <= 2 && [...uniqueVals].every(v => v === 0 || v === 1);

      if (isBoolean) {
        results.push({ column: colName, ...computeBooleanStats(numericValues) });
      } else {
        results.push({ column: colName, ...computeNumericStats(numericValues) });
      }
    } else if (type === 'categorical') {
      const stringValues = rawValues
        .filter(v => v !== null && v !== undefined && v !== '')
        .map(v => String(v));
      results.push({ column: colName, ...computeCategoricalStats(stringValues) });
    }
  }

  return results;
}

interface NumpyProps {
  data: Record<string, any>[];
}

export const NumpyPage: React.FC<NumpyProps> = ({ data }) => {
  const columnStats = useMemo(() => {
    return analyzeDataset(data);
  }, [data]);

  const fmt = (val: number, decimals = 2) =>
    val.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  if (columnStats.length === 0) {
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
        {columnStats
          .filter(s => s.type === 'numeric')
          .slice(0, 3)
          .map(s => (
            <div className="kpi-card" key={s.column}>
              <div className="kpi-label">{s.column}</div>
              <div className="kpi-value">{fmt(s.mean)}</div>
              <div className="kpi-subtext">Promedio ({s.count} registros)</div>
            </div>
          ))}
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
              {columnStats.map(s => {
                if (s.type === 'numeric') {
                  return (
                    <tr key={s.column}>
                      <td><strong>{s.column}</strong> (numérica)</td>
                      <td>Media: {fmt(s.mean)} | Mediana: {fmt(s.median)}</td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Min: {fmt(s.min)} · Max: {fmt(s.max)} · StdDev: {fmt(s.stdDev)}
                        </span>
                      </td>
                    </tr>
                  );
                }
                if (s.type === 'boolean') {
                  return (
                    <tr key={s.column}>
                      <td><strong>{s.column}</strong> (booleana)</td>
                      <td>{s.truePct.toFixed(1)}% en verdadero</td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {s.trueCount} de {s.count} registros
                        </span>
                      </td>
                    </tr>
                  );
                }
                if (s.type === 'categorical') {
                  return (
                    <tr key={s.column}>
                      <td><strong>{s.column}</strong> (categórica)</td>
                      <td>{s.uniqueValues} valores únicos</td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Top: {s.topValues.map(t => `${t.value} (${t.pct.toFixed(0)}%)`).join(', ')}
                        </span>
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NumpyPage;