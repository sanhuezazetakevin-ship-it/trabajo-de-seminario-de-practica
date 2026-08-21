import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChartsProps {
  data: Record<string, any>[];
}

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
const RIESGO_COLORS = ['#22c55e', '#ef4444'];

export const ChartsPage = ({ data }: ChartsProps) => {
  // Procesamiento O(N) simplificado
  const { categoriaData, canalData, riesgoData } = useMemo(() => {
    if (!data || data.length === 0) return { categoriaData: [], canalData: [], riesgoData: [] };

    const catMap: Record<string, number> = {};
    const canalMap: Record<string, number> = {};
    let riesgo = 0;
    let normal = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Categoría / Segmento
      const cat = row.categoria_comercio ?? row.segmento_cliente ?? row.departamento ?? 'Sin Especificar';
      catMap[cat] = (catMap[cat] || 0) + 1;

      // Canal / Ubicación
      const canal = row.canal_transaccion ?? row.linea_negocio ?? row.sede ?? 'Otros';
      canalMap[canal] = (canalMap[canal] || 0) + 1;

      // Estado / Riesgo
      const rVal = row.es_fraude_confirmado ?? row.es_churn_confirmado ?? row.falla_critica_30d;
      if (rVal !== undefined && rVal !== null) {
        if (Number(rVal) === 1) riesgo++;
        else normal++;
      }
    }

    return {
      categoriaData: Object.entries(catMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
      canalData: Object.entries(canalMap).map(([name, total]) => ({ name, total })),
      riesgoData: [
        { name: 'Operación Normal', value: normal },
        { name: 'Alto Riesgo / Alerta', value: riesgo },
      ],
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <p style={{ padding: 20, color: '#64748b' }}>Carga un archivo CSV para visualizar el reporte.</p>;
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      {/* Botón Acción */}
      <div className="no-print" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Dashboard Ejecutivo</h2>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Área Imprimible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        
        {/* Gráfico 1: Barras Verticales */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
          <h4 style={{ marginTop: 0, color: '#334155' }}>Top Categorías / Segmentos</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoriaData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Barras por Canal */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
          <h4 style={{ marginTop: 0, color: '#334155' }}>Distribución por Canal</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={canalData} layout="vertical">
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="total" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Torta / Distribución de Riesgo */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, gridColumn: '1 / -1' }}>
          <h4 style={{ marginTop: 0, color: '#334155' }}>Estado de Riesgo / Retención</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riesgoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {riesgoData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={RIESGO_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Regla CSS para impresión en PDF */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
};

export default ChartsPage;