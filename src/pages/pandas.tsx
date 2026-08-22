import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import './pandas.css';

interface PandasProps {
  data: Record<string, any>[];
  setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

export const PandasPage: React.FC<PandasProps> = ({ data, setData }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Carga optimizada mediante PapaParse Worker
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentPage(1);
    setFeedback(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // Filtra líneas vacías automáticas sin carga extra
      worker: true,
      complete: (res) => {
        const parsed = res.data as Record<string, any>[];
        setData(parsed);
        setIsProcessing(false);
        setFeedback(
          `Archivo "${file.name}" cargado exitosamente. ${parsed.length.toLocaleString('es-ES')} registros detectados.`
        );
      },
      error: () => {
        setFeedback('Error al leer el archivo CSV. Verifique el formato.');
        setIsProcessing(false);
      },
    });
  };

  // 2. Limpieza Ultra-Rápida con Web Worker Inline (No congela UI ni consume RAM)
  const cleanNulls = () => {
    if (data.length === 0) return;

    setIsProcessing(true);
    setFeedback(null);

    // Creamos un Web Worker al vuelo para ejecutar el filtrado fuera del Hilo Principal (Main Thread)
    const workerCode = `
      self.onmessage = function(e) {
        const dataset = e.data;
        const initialCount = dataset.length;
        
        // Iteración de alto rendimiento sin asignación excesiva de memoria
        const cleaned = dataset.filter((row) => {
          for (const key in row) {
            const val = row[key];
            if (val === null || val === undefined || val === '') return false;
            if (typeof val === 'string' && val.trim() === '') return false;
          }
          return true;
        });

        self.postMessage({
          cleaned,
          removedCount: initialCount - cleaned.length,
          initialCount
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.postMessage(data);

    worker.onmessage = (e) => {
      const { cleaned, removedCount, initialCount } = e.data;

      if (removedCount === 0) {
        setFeedback('Verificación completada: El conjunto de datos no contiene elementos nulos o vacíos.');
      } else {
        setFeedback(
          `Limpieza exitosa: Se eliminaron ${removedCount.toLocaleString('es-ES')} filas nulas de un total de ${initialCount.toLocaleString('es-ES')}.`
        );
        setData(cleaned);
        setCurrentPage(1);
      }

      setIsProcessing(false);
      worker.terminate(); // Liberar memoria del worker inmediatamente
      URL.revokeObjectURL(blob.toString());
    };

    worker.onerror = () => {
      setFeedback('Error durante la ejecución del filtrado.');
      setIsProcessing(false);
      worker.terminate();
    };
  };

  // Columnas dinámicas (Memoizado)
  const columns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  // Paginación (Memoizado)
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          Ingesta &amp; Procesamiento Pandas (CSV)
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Carga de datos tabulares, filtrado de anomalías y exploración de datos en entorno oscuro de alta precisión.
        </p>
      </div>

      {/* Dropzone de Carga CSV */}
      <div className="dropzone">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleUpload} disabled={isProcessing} />
        <div className="dropzone-title">
          {isProcessing ? 'Procesando archivo CSV...' : 'Haz clic o arrastra un archivo CSV aquí'}
        </div>
        <div className="dropzone-hint">
          Soporta estructuras de gran volumen mediante parsing asíncrono multihilo PapaParse.
        </div>
      </div>

      {/* Mensaje de Feedback */}
      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {feedback}
        </div>
      )}

      {/* Barra de Acción y Limpieza */}
      {data.length > 0 && (
        <div className="action-bar">
          <div>
            <span className="tag-label" style={{ marginBottom: 0 }}>
              Metadata Dataset
            </span>
            <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {data.length.toLocaleString('es-ES')} filas &times; {columns.length} columnas
            </div>
          </div>

          <button className="btn btn-primary" onClick={cleanNulls} disabled={isProcessing}>
            {isProcessing ? 'Ejecutando Algoritmo...' : 'Ejecutar Limpieza de Nulos'}
          </button>
        </div>
      )}

      {/* Tabla Estilizada en Modo Oscuro */}
      {data.length > 0 && (
        <div>
          {/* Controles de Paginación */}
          <div className="pagination-container">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Mostrando página <strong style={{ color: 'var(--text-main)' }}>{currentPage}</strong> de{' '}
              <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
            </div>

            <div className="pagination-controls">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isProcessing}
              >
                Anterior
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isProcessing}
              >
                Siguiente
              </button>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={50}>50 por pág.</option>
                <option value={100}>100 por pág.</option>
                <option value={500}>500 por pág.</option>
              </select>
            </div>
          </div>

          {/* Tabla de Datos */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-index">#</th>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => {
                  const absoluteRowIndex = (currentPage - 1) * rowsPerPage + idx + 1;
                  return (
                    <tr key={absoluteRowIndex}>
                      <td className="row-index">{absoluteRowIndex}</td>
                      {columns.map((col) => (
                        <td key={`${absoluteRowIndex}-${col}`}>{String(row[col] ?? '')}</td>
                      ))}
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