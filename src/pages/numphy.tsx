
import React, { useMemo } from 'react';

interface NumpyProps {
  data: Record<string, any>[];
}

export const NumpyPage = ({ data }: NumpyProps) => {
  // 1. Memorización de métricas para evitar recalcular en renders innecesarios
  // 2. Unificación en una sola pasada (O(N)) en lugar de recorrer el array múltiples veces con .map() y .filter()
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const montos: number[] = [];
    let sumScore = 0;
    let countScore = 0;
    let totalFraudes = 0;
    let countFraudeValid = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Extracción optimizada de Monto
      const rawMonto = row.monto_transaccion_usd ?? row.monto ?? row.Salario ?? row.salario;
      if (rawMonto !== undefined && rawMonto !== null) {
        const val = typeof rawMonto === 'number' ? rawMonto : parseFloat(rawMonto);
        if (!isNaN(val)) montos.push(val);
      }

      // Extracción optimizada de Score de Riesgo
      const rawScore = row.score_riesgo_autenticacion ?? row.score_riesgo;
      if (rawScore !== undefined && rawScore !== null) {
        const val = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore);
        if (!isNaN(val)) {
          sumScore += val;
          countScore++;
        }
      }

      // Extracción optimizada de Fraudes
      const rawFraude = row.es_fraude_confirmado ?? row.es_fraude;
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

    // Cálculo estadístico optimizado
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

    // Cálculo de varianza/stdDev en una sola pasada adicional
    let varianzaSum = 0;
    for (let i = 0; i < N; i++) {
      varianzaSum += Math.pow(montos[i] - mean, 2);
    }
    const stdDev = Math.sqrt(varianzaSum / N);

    // Mediana rápida
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

  if (!stats) {
    return (
      <div className="dashboard-container">
        <section className="dashboard-section">
          <h3>Métricas Relevantes (NumPy)</h3>
          <p style={{ color: '#64748b' }}>
            Carga el archivo CSV para calcular las métricas estadísticas.
          </p>
        </section>
      </div>
    );
  }

  // Formateador reutilizable para alto rendimiento
  const fmt = (val: number, decimals = 2) =>
    val.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="dashboard-container">
      <section className="dashboard-section">
        <h3>Análisis Numérico de Transacciones y Riesgo de Fraude</h3>
        <p style={{ color: '#64748b', marginBottom: 15 }}>
          Métricas calculadas dinámicamente sobre el conjunto de datos cargado:
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicador / Métrica</th>
                <th>Valor de Obtención (NumPy)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Registros Válidos Procesados (N)</strong></td>
                <td>{stats.totalRegistros.toLocaleString('es-ES')} transacciones</td>
              </tr>
              <tr>
                <td><strong>Monto Total Procesado (Sum)</strong></td>
                <td>${fmt(stats.sumaMontos)}</td>
              </tr>
              <tr>
                <td><strong>Monto Promedio (Mean)</strong></td>
                <td>${fmt(stats.mediaMonto)}</td>
              </tr>
              <tr>
                <td><strong>Monto Punto Medio (Mediana)</strong></td>
                <td>${fmt(stats.medianaMonto)}</td>
              </tr>
              <tr>
                <td><strong>Volatilidad del Monto (Std Dev)</strong></td>
                <td>${fmt(stats.stdDevMonto)}</td>
              </tr>
              <tr>
                <td><strong>Monto Mínimo / Máximo (Min - Max)</strong></td>
                <td>${fmt(stats.minMonto)} - ${fmt(stats.maxMonto)}</td>
              </tr>
              <tr>
                <td><strong>Score Promedio de Riesgo de Autenticación</strong></td>
                <td>{stats.mediaScore.toFixed(3)} (Escala 0.000 - 1.000)</td>
              </tr>
              <tr>
                <td><strong>Volumen y Tasa de Fraude Confirmado</strong></td>
                <td>{stats.totalFraudes.toLocaleString('es-ES')} casos ({stats.tasaFraudePct.toFixed(2)}%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default NumpyPage;