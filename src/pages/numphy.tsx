import React, { useMemo } from 'react';
import './numphy.css';

// ---------------------------------------------------------------------------
// Formateador reutilizado (Intl.NumberFormat es costoso de instanciar;
// crearlo una sola vez y reusarlo evita recrearlo en cada celda de la tabla)
// ---------------------------------------------------------------------------
const numberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt = (val: number) => numberFormatter.format(val);

// ---------------------------------------------------------------------------
// Escaneo de columna en UNA sola pasada: clasifica y parsea a la vez,
// en vez de filtrar y volver a mapear (como hacía el original).
// ---------------------------------------------------------------------------
interface ColumnScan {
  nonNullCount: number;
  numericCount: number;
  numericValues: Float64Array;
  rawNonNull: any[];
}

function scanColumn(data: Record<string, any>[], colName: string): ColumnScan {
  const n = data.length;
  const numericBuffer = new Float64Array(n);
  const rawNonNull: any[] = [];
  let numericLen = 0;
  let nonNullCount = 0;
  let numericCount = 0;

  for (let i = 0; i < n; i++) {
    const v = data[i][colName];
    if (v === null || v === undefined || v === '') continue;

    nonNullCount++;
    rawNonNull.push(v);

    const num = typeof v === 'number' ? v : parseFloat(v);
    if (!isNaN(num)) {
      numericBuffer[numericLen++] = num;
      numericCount++;
    }
  }

  return {
    nonNullCount,
    numericCount,
    numericValues: numericBuffer.subarray(0, numericLen),
    rawNonNull,
  };
}

// ---------------------------------------------------------------------------
// Estadísticas numéricas: media + varianza en una sola pasada (Welford),
// en vez de dos bucles separados como en el original.
// ---------------------------------------------------------------------------
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

function quickSelect(arr: Float64Array, k: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo < hi) {
    const pivot = arr[(lo + hi) >> 1];
    let i = lo;
    let j = hi;

    while (i <= j) {
      while (arr[i] < pivot) i++;
      while (arr[j] > pivot) j--;
      if (i <= j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
      }
    }

    if (k <= j) hi = j;
    else if (k >= i) lo = i;
    else break;
  }

  return arr[k];
}

function computeMedian(values: Float64Array): number {
  const N = values.length;
  const copy = values.slice(); // quickSelect muta el array; trabajamos sobre copia

  if (N % 2 === 1) {
    return quickSelect(copy, (N - 1) / 2);
  }

  const mid = N / 2;
  const upper = quickSelect(copy, mid);
  let lower = -Infinity;
  for (let i = 0; i < mid; i++) {
    if (copy[i] > lower) lower = copy[i];
  }
  return (lower + upper) / 2;
}

function computeNumericStats(values: Float64Array): NumericStats {
  const N = values.length;
  let sum = 0;
  let mean = 0;
  let m2 = 0; // acumulador de Welford para la varianza
  let min = values[0];
  let max = values[0];

  for (let i = 0; i < N; i++) {
    const v = values[i];
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;

    const delta = v - mean;
    mean += delta / (i + 1);
    const delta2 = v - mean;
    m2 += delta * delta2;
  }

  const stdDev = Math.sqrt(m2 / N);
  const median = computeMedian(values);

  return { type: 'numeric', count: N, sum, mean, median, stdDev, min, max };
}

// ---------------------------------------------------------------------------
// Booleanas: detección con salida temprana en vez de construir un Set
// completo de valores únicos.
// ---------------------------------------------------------------------------
interface BooleanStats {
  type: 'boolean';
  count: number;
  trueCount: number;
  truePct: number;
}

function detectBoolean(values: Float64Array): boolean {
  let sawZeroOrOne = false;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === 0 || v === 1) {
      sawZeroOrOne = true;
    } else {
      return false; // salida temprana: ya no puede ser booleana
    }
  }
  return sawZeroOrOne;
}

function computeBooleanStats(values: Float64Array): BooleanStats {
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

// ---------------------------------------------------------------------------
// Categóricas: Map en vez de objeto plano, y selección parcial de top-5
// en vez de ordenar TODAS las categorías.
// ---------------------------------------------------------------------------
interface CategoricalStats {
  type: 'categorical';
  count: number;
  uniqueValues: number;
  topValues: { value: string; count: number; pct: number }[];
}

function computeCategoricalStats(values: string[]): CategoricalStats {
  const counts = new Map<string, number>();
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    counts.set(v, (counts.get(v) || 0) + 1);
  }

  const top5: [string, number][] = [];
  for (const entry of counts) {
    if (top5.length < 5) {
      top5.push(entry);
      if (top5.length === 5) top5.sort((a, b) => a[1] - b[1]);
    } else if (entry[1] > top5[0][1]) {
      top5[0] = entry;
      top5.sort((a, b) => a[1] - b[1]);
    }
  }
  top5.sort((a, b) => b[1] - a[1]);

  const topValues = top5.map(([value, count]) => ({
    value,
    count,
    pct: (count / values.length) * 100,
  }));

  return {
    type: 'categorical',
    count: values.length,
    uniqueValues: counts.size,
    topValues,
  };
}

// ---------------------------------------------------------------------------
// Orquestación: una sola pasada por columna en vez de las 3-4 del original.
// ---------------------------------------------------------------------------
function analyzeDataset(data: Record<string, any>[]) {
  if (!data || data.length === 0) return [];

  const columnNames = Object.keys(data[0]);
  const results = [];

  for (let c = 0; c < columnNames.length; c++) {
    const colName = columnNames[c];
    const { nonNullCount, numericCount, numericValues, rawNonNull } = scanColumn(data, colName);

    if (nonNullCount === 0) continue;

    const ratio = numericCount / nonNullCount;

    if (ratio > 0.9) {
      if (detectBoolean(numericValues)) {
        results.push({ column: colName, ...computeBooleanStats(numericValues) });
      } else {
        results.push({ column: colName, ...computeNumericStats(numericValues) });
      }
    } else {
      const stringValues = new Array(rawNonNull.length);
      for (let i = 0; i < rawNonNull.length; i++) {
        stringValues[i] = String(rawNonNull[i]);
      }
      results.push({ column: colName, ...computeCategoricalStats(stringValues) });
    }
  }

  return results;
}

// El componente React (NumpyPage) queda igual que el original,
// solo usa el `fmt` reutilizable de arriba en vez de toLocaleString directo.

interface NumpyProps {
  data: Record<string, any>[];
}

export const NumpyPage: React.FC<NumpyProps> = ({ data }) => {
  const columnStats = useMemo(() => {
    return analyzeDataset(data);
  }, [data]);

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