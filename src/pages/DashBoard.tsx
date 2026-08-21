import { useState } from 'react';
import PandasPage from './pandas';
import NumpyPage from './numphy';
import ChartsPage from './charts';
import '../DashBoard.css';

export const Dashboard = () => {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<'pandas' | 'numpy' | 'charts'>('pandas');

  // Estado global de los datos subidos para compartir entre Pandas, NumPy y Gráficos
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);

  return (
    <div className="app-layout">
      {/* Menú Lateral (Sidebar) */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeTab === 'pandas' ? 'active' : ''}`}
            onClick={() => setActiveTab('pandas')}
          >
            Pandas (CSV)
          </button>
          <button
            className={`nav-button ${activeTab === 'numpy' ? 'active' : ''}`}
            onClick={() => setActiveTab('numpy')}
          >
            NumPy (Métricas)
          </button>
          <button
            className={`nav-button ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            Gráficos y Reporte
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        {activeTab === 'pandas' && <PandasPage data={csvData} setData={setCsvData} />}
        {activeTab === 'numpy' && <NumpyPage data={csvData} />}
        {activeTab === 'charts' && <ChartsPage data={csvData} />}
      </main>
    </div>
  );
};

export default Dashboard;