import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import './charts.css';

interface ChartsProps {
  data: Record<string, any>[];
}

interface ThemeColors {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  bgCard: string;
  bgCardAlt: string;
  border: string;
  textMain: string;
  textMuted: string;
}

const FALLBACK_COLORS: ThemeColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  bgCard: '#131b2e',
  bgCardAlt: '#1a233a',
  border: '#24314c',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
};

// Lee la paleta corporativa directamente de las variables CSS del tema activo (claro/oscuro)
function readThemeColors(): ThemeColors {
  if (typeof window === 'undefined') return FALLBACK_COLORS;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    primary: read('--primary', FALLBACK_COLORS.primary),
    success: read('--success', FALLBACK_COLORS.success),
    warning: read('--warning', FALLBACK_COLORS.warning),
    danger: read('--danger', FALLBACK_COLORS.danger),
    bgCard: read('--bg-card', FALLBACK_COLORS.bgCard),
    bgCardAlt: read('--bg-card-alt', FALLBACK_COLORS.bgCardAlt),
    border: read('--border-color', FALLBACK_COLORS.border),
    textMain: read('--text-main', FALLBACK_COLORS.textMain),
    textMuted: read('--text-muted', FALLBACK_COLORS.textMuted),
  };
}

// Se re-sincroniza cada vez que el usuario alterna el toggle de tema claro/oscuro
function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(readThemeColors);

  useEffect(() => {
    const update = () => setColors(readThemeColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

interface DistItem {
  name: string;
  count: number;
  pct: number;
}

function buildTop(map: Record<string, number>, total: number, limit = 6): DistItem[] {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const ChartTooltip: React.FC<any> = ({ active, payload, colors }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload as DistItem;
  return (
    <div className="chart-tooltip" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
      <div className="chart-tooltip-name" style={{ color: colors.textMain }}>{item.name}</div>
      <div className="chart-tooltip-value" style={{ color: colors.textMain }}>
        <strong>{item.count.toLocaleString('es-ES')}</strong> registros
      </div>
      <div className="chart-tooltip-pct" style={{ color: colors.textMuted }}>{item.pct.toFixed(2)}% del total</div>
    </div>
  );
};

export const ChartsPage: React.FC<ChartsProps> = ({ data }) => {
  const colors = useThemeColors();
  const [activeSlice, setActiveSlice] = useState<number | undefined>(undefined);

  const palette = useMemo(
    () => [colors.primary, colors.success, colors.warning, colors.danger, '#8b5cf6', '#06b6d4'],
    [colors]
  );

  const { totalRecords, categoriaBars, canalBars, riesgoCount, normalCount } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalRecords: 0, categoriaBars: [] as DistItem[], canalBars: [] as DistItem[], riesgoCount: 0, normalCount: 0 };
    }

    const total = data.length;
    const catMap: Record<string, number> = {};
    const canalMap: Record<string, number> = {};
    let riesgo = 0;
    let normal = 0;

    for (let i = 0; i < total; i++) {
      const row = data[i];

      const cat = String(row.categoria_comercio ?? row.segmento_cliente ?? row.departamento ?? row.categoria ?? 'General');
      catMap[cat] = (catMap[cat] || 0) + 1;

      const canal = String(row.canal_transaccion ?? row.linea_negocio ?? row.sede ?? row.canal ?? 'Online');
      canalMap[canal] = (canalMap[canal] || 0) + 1;

      const rVal = row.es_fraude_confirmado ?? row.es_churn_confirmado ?? row.falla_critica_30d ?? row.riesgo;
      if (rVal !== undefined && rVal !== null) {
        if (Number(rVal) === 1 || String(rVal).toLowerCase() === 'alto') riesgo++;
        else normal++;
      }
    }

    return {
      totalRecords: total,
      categoriaBars: buildTop(catMap, total),
      canalBars: buildTop(canalMap, total),
      riesgoCount: riesgo,
      normalCount: normal,
    };
  }, [data]);

  const totalRiesgoEvaluado = riesgoCount + normalCount;
  const riesgoPct = totalRiesgoEvaluado > 0 ? (riesgoCount / totalRiesgoEvaluado) * 100 : 0;

  if (!data || data.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Reportes Ejecutivos &amp; Gráficos
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Generación de distribuciones gráficas interactivas y exportación a informe PDF.
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

  const topCategoria = categoriaBars[0];
  const topCanal = canalBars[0];

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

      {/* Fila de KPIs de contexto inmediato */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Registros</div>
          <div className="kpi-value">{totalRecords.toLocaleString('es-ES')}</div>
          <div className="kpi-subtext">Muestra evaluada en el informe</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Categoría Dominante</div>
          <div className="kpi-value" style={{ fontSize: '1.3rem' }}>{topCategoria?.name ?? '—'}</div>
          <div className="kpi-subtext">
            {topCategoria ? `${topCategoria.pct.toFixed(1)}% del total (${topCategoria.count.toLocaleString('es-ES')} reg.)` : 'Sin datos'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Canal Dominante</div>
          <div className="kpi-value" style={{ fontSize: '1.3rem' }}>{topCanal?.name ?? '—'}</div>
          <div className="kpi-subtext">
            {topCanal ? `${topCanal.pct.toFixed(1)}% del total (${topCanal.count.toLocaleString('es-ES')} reg.)` : 'Sin datos'}
          </div>
        </div>

        {totalRiesgoEvaluado > 0 && (
          <div className={`kpi-card ${riesgoPct > 5 ? 'warning' : 'success'}`}>
            <div className="kpi-label">Alertas de Riesgo</div>
            <div className="kpi-value">{riesgoPct.toFixed(2)}%</div>
            <div className="kpi-subtext">
              {riesgoCount.toLocaleString('es-ES')} de {totalRiesgoEvaluado.toLocaleString('es-ES')} evaluados
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="charts-grid">
          {/* Gráfico 1: Categorías / Segmentos — barras horizontales interactivas */}
          <div className="chart-card">
            <span className="tag-label">Distribución 01</span>
            <h3 className="chart-title">Distribución por Categoría / Segmento</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoriaBars} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: colors.textMuted, fontSize: 12 }}
                  axisLine={{ stroke: colors.border }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip colors={colors} />} cursor={{ fill: colors.bgCardAlt }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {categoriaBars.map((entry, idx) => (
                    <Cell key={entry.name} fill={palette[idx % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Distribución por Canal — dona interactiva con leyenda propia */}
          <div className="chart-card">
            <span className="tag-label">Distribución 02</span>
            <h3 className="chart-title">Distribución por Canal Transaccional</h3>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={canalBars}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={activeSlice === undefined ? 86 : 92}
                  paddingAngle={3}
                  onMouseEnter={(_, idx) => setActiveSlice(idx)}
                  onMouseLeave={() => setActiveSlice(undefined)}
                >
                  {canalBars.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={palette[idx % palette.length]}
                      stroke={colors.bgCard}
                      strokeWidth={activeSlice === idx ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip colors={colors} />} />
              </PieChart>
            </ResponsiveContainer>

            <ul className="chart-legend">
              {canalBars.map((item, idx) => (
                <li
                  key={item.name}
                  className={`chart-legend-item ${activeSlice === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSlice(idx)}
                  onMouseLeave={() => setActiveSlice(undefined)}
                >
                  <span className="chart-legend-dot" style={{ backgroundColor: palette[idx % palette.length] }} />
                  <span className="chart-legend-label">{item.name}</span>
                  <span className="chart-legend-value">{item.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gráfico 3: Matriz de Riesgo — gauge semicircular destacado */}
        {totalRiesgoEvaluado > 0 && (
          <div className="chart-card">
            <span className="tag-label">Distribución 03</span>
            <h3 className="chart-title">Estado de Riesgo &amp; Alertas Detectadas</h3>

            <div className="risk-gauge-wrapper">
              <div className="risk-gauge-chart">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Alertas de Alto Riesgo', count: riesgoCount, pct: riesgoPct, value: riesgoPct },
                        { name: 'Operaciones Normales', count: normalCount, pct: 100 - riesgoPct, value: 100 - riesgoPct },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      startAngle={180}
                      endAngle={0}
                      cx="50%"
                      cy="95%"
                      innerRadius={80}
                      outerRadius={112}
                      paddingAngle={2}
                    >
                      <Cell fill={colors.danger} />
                      <Cell fill={colors.bgCardAlt} />
                    </Pie>
                    <Tooltip content={<ChartTooltip colors={colors} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="risk-gauge-center">
                  <div className="risk-gauge-value" style={{ color: colors.danger }}>{riesgoPct.toFixed(2)}%</div>
                  <div className="risk-gauge-sub">en alerta de riesgo</div>
                </div>
              </div>

              <div className="risk-gauge-details">
                <div className="risk-gauge-detail-row">
                  <span className="chart-legend-dot" style={{ backgroundColor: colors.bgCardAlt, border: `1px solid ${colors.border}` }} />
                  <span>Operaciones Normales</span>
                  <strong>{normalCount.toLocaleString('es-ES')}</strong>
                </div>
                <div className="risk-gauge-detail-row">
                  <span className="chart-legend-dot" style={{ backgroundColor: colors.danger }} />
                  <span>Alertas de Alto Riesgo</span>
                  <strong>{riesgoCount.toLocaleString('es-ES')}</strong>
                </div>
              </div>
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
