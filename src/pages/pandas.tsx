import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import './pandas.css';

interface PandasProps {
  data: Record<string, any>[];
  setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

export const PandasPage: React.FC<PandasProps> = ({ data, setData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Carga y Limpieza en un solo paso (Stream por Chunks) - Cero desperdicio de RAM
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentPage(1);
    setFeedback(null);

    const cleanRows: Record<string, any>[] = [];
    let totalRows = 0;

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      worker: true,
      chunk: (results) => {
        totalRows += results.data.length;
        // Bucle ultrarrápido de alto rendimiento sin Object.values
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          let isValid = true;
          for (const key in row) {
            const v = row[key];
            if (v === null || v === undefined || v === '' || (typeof v === 'string' && !v.trim())) {
              isValid = false; break;
            }
          }
          if (isValid) cleanRows.push(row);
        }
      },
      complete: () => {
        setData(cleanRows);
        setIsProcessing(false);
        const removed = totalRows - cleanRows.length;
        setFeedback(`Procesado: ${cleanRows.length.toLocaleString('es-ES')} filas válidas (${removed.toLocaleString('es-ES')} nulas eliminadas de ${totalRows.toLocaleString('es-ES')}).`);
      },
      error: () => { setFeedback('Error al leer el archivo CSV.'); setIsProcessing(false); }
    });
  };

  const columns = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const currentData = useMemo(() => data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [data, currentPage, rowsPerPage]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Ingesta &amp; Procesamiento Pandas (CSV)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Procesamiento directo en streaming para volúmenes de más de 1,000,000 de filas.</p>
      </div>

      <div className="dropzone">
        <input type="file" accept=".csv" onChange={handleUpload} disabled={isProcessing} />
        <div className="dropzone-title">{isProcessing ? 'Filtrando y procesando 1M+ filas...' : 'Haz clic o arrastra un archivo CSV aquí'}</div>
        <div className="dropzone-hint">Filtrado inmediato en lectura asíncrona multihilo (PapaParse Chunking).</div>
      </div>

      {feedback && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{feedback}</div>}

      {data.length > 0 && (
        <div>
          <div className="action-bar">
            <div>
              <span className="tag-label" style={{ marginBottom: 0 }}>Metadata Dataset</span>
              <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {data.length.toLocaleString('es-ES')} filas válidas &times; {columns.length} columnas
              </div>
            </div>
          </div>

          <div className="pagination-container">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Página <strong style={{ color: 'var(--text-main)' }}>{currentPage}</strong> de <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
            </div>
            <div className="pagination-controls">
              <button className="btn btn-sm btn-outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
              <button className="btn btn-sm btn-outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
              <select className="form-control" style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1); }}>
                <option value={50}>50 por pág.</option>
                <option value={100}>100 por pág.</option>
                <option value={500}>500 por pág.</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-index">#</th>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => {
                  const absoluteIdx = (currentPage - 1) * rowsPerPage + idx + 1;
                  return (
                    <tr key={absoluteIdx}>
                      <td className="row-index">{absoluteIdx}</td>
                      {columns.map(col => <td key={`${absoluteIdx}-${col}`}>{String(row[col] ?? '')}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PandasPage;