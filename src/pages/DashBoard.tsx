import React, { useState } from 'react';
import PandasPage from './pandas';
import NumpyPage from './numphy';
import ChartsPage from './charts';
import T_Machine from './TeachableMachine';
import './DashBoard.css';

export const Dashboard: React.FC = () => {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<'pandas' | 'numpy' | 'charts' | 'T_Machine'>('pandas')  ;

  // Estado global de los datos subidos para compartir entre Pandas, NumPy y Gráficos
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);

  return (
    <div className="dashboard-layout">
      {/* Menú Lateral (Sidebar) */}
      <aside className="sidebar no-print">
        <div>
          <div className="sidebar-header">
            <span className="sidebar-title">Navegación Módulos</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-button ${activeTab === 'pandas' ? 'active' : ''}`}
              onClick={() => setActiveTab('pandas')}
            >
              <span>Pandas (CSV)</span>
              {activeTab === 'pandas' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'numpy' ? 'active' : ''}`}
              onClick={() => setActiveTab('numpy')}
            >
              <span>NumPy (Métricas)</span>
              {activeTab === 'numpy' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              <span>Reportes &amp; Gráficos</span>
              {activeTab === 'charts' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'T_Machine' ? 'active' : ''}`}
              onClick={() => setActiveTab('T_Machine')}
            >
              <span>Teachable Machine</span>
              {activeTab === 'T_Machine' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
          </nav>
        </div>

        {/* Widget en Tiempo Real del Estado del Dataset */}
        <div className="dataset-widget">
          <div className="widget-label">Estado Dataset</div>
          <div className="widget-status">
            <span className={`status-dot ${csvData.length > 0 ? 'loaded' : ''}`}></span>
            <span>
              {csvData.length > 0
                ? `${csvData.length.toLocaleString('es-ES')} Registros`
                : 'Sin Dataset'}
            </span>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="dashboard-content">
        {activeTab === 'pandas' && <PandasPage data={csvData} setData={setCsvData} />}
        {activeTab === 'numpy' && <NumpyPage data={csvData} />}
        {activeTab === 'charts' && <ChartsPage data={csvData} />}
        {activeTab === 'T_Machine' && <T_Machine/>}
      </main>
    </div>
  );
};

export default Dashboard;