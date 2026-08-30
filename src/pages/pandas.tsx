import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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

  // Múltiples columnas seleccionadas & Filtro de texto
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Columnas disponibles en el dataset
  const availableColumns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  // Al cargar datos o cambiar de dataset, seleccionar todas por defecto
  useEffect(() => {
    if (availableColumns.length > 0) {
      setSelectedColumns(availableColumns);
    }
  }, [availableColumns]);

  // Cerrar el menú desplegable si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler para subir CSV
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentPage(1);
    setFeedback(null);
    setFilterQuery('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
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

  // Limpieza de nulos mediante Web Worker
  const cleanNulls = useCallback(() => {
    if (data.length === 0) return;

    setIsProcessing(true);
    setFeedback(null);

    const workerCode = `
      self.onmessage = function(e) {
        const dataset = e.data;
        const initialCount = dataset.length;
        
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
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

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
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.onerror = () => {
      setFeedback('Error durante la ejecución del filtrado.');
      setIsProcessing(false);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [data, setData]);

  // Lógica para marcar / desmarcar columnas individualmente
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((item) => item !== col) : [...prev, col]
    );
  };

  // Marcar o desmarcar TODAS las columnas
  const toggleAllColumns = () => {
    if (selectedColumns.length === availableColumns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(availableColumns);
    }
  };

  // Columnas visibles ordenadas según la estructura original
  const visibleColumns = useMemo(() => {
    return availableColumns.filter((col) => selectedColumns.includes(col));
  }, [availableColumns, selectedColumns]);

  // Filtrado de registros en tiempo real sobre las columnas activas
  const filteredData = useMemo(() => {
    if (!filterQuery.trim()) return data;
    const query = filterQuery.toLowerCase();

    return data.filter((row) => {
      return visibleColumns.some((col) =>
        String(row[col] ?? '').toLowerCase().includes(query)
      );
    });
  }, [data, filterQuery, visibleColumns]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          Ingesta &amp; Procesamiento Pandas (CSV)
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Carga de datos tabulares, filtrado dinámico multi-columna y exploración rápida.
        </p>
      </div>

      {/* Dropzone */}
      <div className="dropzone">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleUpload} disabled={isProcessing} />
        <div className="dropzone-title">
          {isProcessing ? 'Procesando archivo CSV...' : 'Haz clic o arrastra un archivo CSV aquí'}
        </div>
        <div className="dropzone-hint">
          Soporta estructuras de gran volumen mediante parsing asíncrono PapaParse.
        </div>
      </div>

      {/* Mensaje de Feedback */}
      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {feedback}
        </div>
      )}

      {/* Panel de Filtros con Desplegable Multi-Selección */}
      {data.length > 0 && (
        <div className="filter-panel">
          {/* Multi-Select de Columnas */}
          <div className="filter-group" ref={dropdownRef}>
            <label className="filter-label">Columnas Visibles:</label>
            <div className="custom-dropdown">
              <button
                type="button"
                className="form-control dropdown-trigger"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span>
                  {selectedColumns.length === 0
                    ? 'Ninguna seleccionada'
                    : selectedColumns.length === availableColumns.length
                    ? `Todas las columnas (${availableColumns.length})`
                    : `${selectedColumns.length} de ${availableColumns.length} seleccionadas`}
                </span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <label className="dropdown-item dropdown-item-header">
                    <input
                      type="checkbox"
                      checked={selectedColumns.length === availableColumns.length && availableColumns.length > 0}
                      onChange={toggleAllColumns}
                    />
                    <strong>Seleccionar Todas</strong>
                  </label>
                  <div className="dropdown-divider" />
                  {availableColumns.map((col) => (
                    <label key={col} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Búsqueda por Texto */}
          <div className="filter-group filter-input-container">
            <label className="filter-label">Buscar registro:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar en columnas seleccionadas..."
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Metadata & Acciones */}
      {data.length > 0 && (
        <div className="action-bar">
          <div>
            <span className="tag-label" style={{ marginBottom: 0 }}>
              Metadata Dataset
            </span>
            <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {filteredData.length.toLocaleString('es-ES')} de {data.length.toLocaleString('es-ES')} filas &times;{' '}
              {visibleColumns.length} columna(s) visible(s)
            </div>
          </div>

          <button className="btn btn-primary" onClick={cleanNulls} disabled={isProcessing}>
            {isProcessing ? 'Ejecutando Algoritmo...' : 'Ejecutar Limpieza de Nulos'}
          </button>
        </div>
      )}

      {/* Tabla */}
      {data.length > 0 && (
        <div>
          {/* Paginación */}
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

          {/* Tabla Responsive Adaptable */}
          <div className="table-wrapper-responsive">
            <table className="data-table-responsive">
              <thead>
                <tr>
                  <th className="row-index">#</th>
                  {visibleColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleColumns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={1}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}
                    >
                      Seleccione al menos una columna para mostrar datos.
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((row, idx) => {
                    const absoluteRowIndex = (currentPage - 1) * rowsPerPage + idx + 1;
                    return (
                      <tr key={absoluteRowIndex}>
                        <td className="row-index">{absoluteRowIndex}</td>
                        {visibleColumns.map((col) => (
                          <td key={`${absoluteRowIndex}-${col}`}>{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 1}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}
                    >
                      No se encontraron filas que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PandasPage;