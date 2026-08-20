import React from 'react';
import Papa from 'papaparse';

// 1. Declarar la interfaz para definir las props
interface PandasProps {
  data: Record<string, any>[];
  setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

// 2. Pasar las props al componente
export const PandasPage = ({ data, setData }: PandasProps) => {

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => setData(res.data as Record<string, any>[]),
      });
    }
  };

  const cleanNulls = () => {
    const initialCount = data.length;
    const cleaned = data.filter((row) =>
      Object.values(row).every((val) => val !== null && val !== undefined && String(val).trim() !== '')
    );
    const removedCount = initialCount - cleaned.length;

    if (removedCount === 0) {
      alert('La lista no contiene elementos nulos o vacíos.');
    } else {
      alert(`Se han eliminado ${removedCount} filas con elementos nulos o vacíos.`);
      setData(cleaned);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="dashboard-container">
      <section className="dashboard-section">
        <h3>1. Cargar Archivo CSV</h3>
        <input type="file" accept=".csv" onChange={handleUpload} />
      </section>

      {data.length > 0 && (
        <section className="dashboard-section">
          <h3>2. Limpieza de Datos</h3>
          <button className="btn-primary" onClick={cleanNulls}>
            Limpiar Nulos
          </button>
        </section>
      )}

      {data.length > 0 && (
        <section className="dashboard-section">
          <h3>3. Datos Cargados ({data.length} filas)</h3>
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
                {data.map((row, i) => (
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