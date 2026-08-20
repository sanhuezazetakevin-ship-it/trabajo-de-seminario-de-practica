interface NumpyProps {
  data: Record<string, any>[];
}

export const NumpyPage = ({ data }: NumpyProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-container">
        <section className="dashboard-section">
          <h3>Métricas Relevantes (NumPy)</h3>
          <p style={{ color: '#64748b' }}>
            Carga un archivo CSV en la sección <strong>Pandas</strong> para calcular las métricas estadísticas.
          </p>
        </section>
      </div>
    );
  }

  // Extracción vectorial de columna numéricas (Salario)
  const salarios = data
    .map((row) => parseFloat(row.Salario || row.salario))
    .filter((val) => !isNaN(val));

  const total = salarios.length;
  const suma = salarios.reduce((acc, curr) => acc + curr, 0);
  const media = total > 0 ? suma / total : 0;
  const min = total > 0 ? Math.min(...salarios) : 0;
  const max = total > 0 ? Math.max(...salarios) : 0;

  // Mediana
  const sorted = [...salarios].sort((a, b) => a - b);
  const mediana =
    total % 2 === 0 && total > 0
      ? (sorted[total / 2 - 1] + sorted[total / 2]) / 2
      : sorted[Math.floor(total / 2)] || 0;

  // Desviación estándar
  const varianza = total > 0 ? salarios.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / total : 0;
  const stdDev = Math.sqrt(varianza);

  return (
    <div className="dashboard-container">
      <section className="dashboard-section">
        <h3>Análisis Numérico de Alto Valor</h3>
        <p style={{ color: '#64748b', marginBottom: 15 }}>
          Métricas clave calculadas sobre el dataset procesado:
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicador / Métrica</th>
                <th>Valor Obtencion (NumPy)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Muestra Procesada (N)</strong></td>
                <td>{total} registros válidos</td>
              </tr>
              <tr>
                <td><strong>Inversión/Monto Total (Sum)</strong></td>
                <td>${suma.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Promedio Central (Mean)</strong></td>
                <td>${media.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Punto Medio (Mediana)</strong></td>
                <td>${mediana.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Dispersión / Volatilidad (Std Dev)</strong></td>
                <td>${stdDev.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Rango Máximo (Max)</strong></td>
                <td>${max.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Rango Mínimo (Min)</strong></td>
                <td>${min.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default NumpyPage;