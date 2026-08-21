import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';

interface PandasProps {
  data: Record<string, any>[];
  setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

export const PandasPage = ({ data, setData }: PandasProps) => { 
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 1. Carga por Stream/Worker para archivos gigantes sin bloquear la UI
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentPage(1);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true, // Procesa en un Web Worker en segundo plano
      complete: (res) => {
        setData(res.data as Record<string, any>[]);
        setIsProcessing(false);
      },
      error: () => {
        alert('Error al leer el archivo CSV');
        setIsProcessing(false);
      }
    });
  };

  // 2. Limpieza optimizada
  const cleanNulls = () => {
    setIsProcessing(true);

    // setTimeout permite que la UI muestre el estado de "Cargando..." antes del cálculo
    setTimeout(() => {
      const initialCount = data.length;
      
      const cleaned = data.filter((row) =>
        Object.values(row).every((val) => 
          val !== null && val !== undefined && val !== '' && String(val).trim() !== ''
        )
      );

      const removedCount = initialCount - cleaned.length;

      if (removedCount === 0) {
        alert('La lista no contiene elementos nulos o vacíos.');
      } else {
        alert(`Se han eliminado ${removedCount} filas de ${initialCount} registros.`);
        setData(cleaned);
        setCurrentPage(1);
      }
      setIsProcessing(false);
    }, 50);
  };

  // Memoización de columnas
  const columns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  // 3. Paginación: Solo se renderizan las filas visibles en pantalla (ej. 100)
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  return (
    <div className="dashboard-container">
      <section className="dashboard-section">
        <h3>1. Cargar Archivo CSV</h3>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleUpload} 
          disabled={isProcessing} 
        />
        {isProcessing && <p>Procesando datos en segundo plano...</p>}
      </section>

      {data.length > 0 && (
        <section className="dashboard-section">
          <h3>2. Limpieza de Datos</h3>
          <button 
            className="btn-primary" 
            onClick={cleanNulls} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Limpiando...' : 'Limpiar Nulos'}
          </button>
        </section>
      )}

      {data.length > 0 && (
        <section className="dashboard-section">
          <h3>3. Datos Cargados ({data.length.toLocaleString()} filas)</h3>
          
          {/* Controles de Paginación */}
          <div className="pagination-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
            <button 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1 || isProcessing}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || isProcessing}
            >
              Siguiente
            </button>
            <select 
              value={rowsPerPage} 
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
              <option value={500}>500 por pág.</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>{String(row[col] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default PandasPage;