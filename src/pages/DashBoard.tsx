import React, { useState } from 'react';
import PandasPage from './pandas';
import NumpyPage from './numphy';
import ChartsPage from './charts';
import T_Machine from './TeachableMachine';
import T_MachineAudio from './TeachableMachineAudio';
import T_MachinePose from './TeachableMachinePose';
import './DashBoard.css';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pandas' | 'numpy' | 'charts' | 'T_Machine'|'T_MachineAudio' |'T_MachinePose'>('pandas');
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  
  // Estado para controlar el desplegable de los módulos en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper para cambiar de pestaña y cerrar el menú móvil automáticamente
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Botón para desplegar lista de módulos en Móvil */}
      <button 
        className="mobile-modules-toggle" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span>Módulo actual: <strong>{activeTab}</strong></span>
        <span>{isSidebarOpen ? '▲' : '▼'}</span>
      </button>

      {/* Menú Lateral (Sidebar) */}
      <aside className={`sidebar no-print ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <span className="sidebar-title">Navegación Módulos</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-button ${activeTab === 'pandas' ? 'active' : ''}`}
              onClick={() => handleTabChange('pandas')}
            >
              <span>Pandas (CSV)</span>
              {activeTab === 'pandas' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'numpy' ? 'active' : ''}`}
              onClick={() => handleTabChange('numpy')}
            >
              <span>NumPy (Métricas)</span>
              {activeTab === 'numpy' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => handleTabChange('charts')}
            >
              <span>Reportes &amp; Gráficos</span>
              {activeTab === 'charts' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'T_Machine' ? 'active' : ''}`}
              onClick={() => handleTabChange('T_Machine')}
            >
              <span>Teachable Machine</span>
              {activeTab === 'T_Machine' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'T_MachineAudio' ? 'active' : ''}`}
              onClick={() => handleTabChange('T_MachineAudio')}
            >
              <span>Teachable Machine Audio</span>
              {activeTab === 'T_MachineAudio' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
            <button
              className={`nav-button ${activeTab === 'T_MachinePose' ? 'active' : ''}`}
              onClick={() => handleTabChange('T_MachinePose')}
            >
              <span>Teachable Machine Pose</span>
              {activeTab === 'T_MachinePose' && <span style={{ fontSize: '0.7rem' }}>●</span>}
            </button>
          </nav>
        </div>

        {/* Widget Estado Dataset */}
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
        {activeTab === 'T_MachineAudio' && <T_MachineAudio/>}
        {activeTab === 'T_MachinePose' && <T_MachinePose/>}
      </main>
    </div>
  );
};

export default Dashboard;