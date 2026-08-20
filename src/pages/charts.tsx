interface ChartsProps {
  data: Record<string, any>[];
}

export const ChartsPage = ({ data }: ChartsProps) => {
  // Agrupamiento por Departamento
  const deptMap: Record<string, number> = {};
  data.forEach((row) => {
    const dept = row.Departamento || row.departamento || 'Sin Especificar';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(deptMap), 1);

  return (
    <div className="dashboard-container">
      <button className="btn-primary" onClick={() => window.print()} style={{ marginBottom: 15 }}>
        📄 Generar Reporte PDF
      </button>

      <div className="dashboard-section" style={{ background: '#fff', padding: 20 }}>
        <h3>Resumen Gráfico</h3>
        <p style={{ color: '#64748b', marginBottom: 20 }}>
          Total de registros procesados: <strong>{data.length}</strong>
        </p>

        {/* Gráfico de barras en CSS Nativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(deptMap).map(([dept, count]) => {
            const percentage = Math.round((count / maxCount) * 100);
            return (
              <div key={dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}>
                  <span><strong>{dept}</strong></span>
                  <span>{count} empleados</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: 4, height: 16, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: '#2563eb',
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;