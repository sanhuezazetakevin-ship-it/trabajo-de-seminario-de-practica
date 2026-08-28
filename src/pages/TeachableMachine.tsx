import { useRef, useState, useEffect } from 'react';
import * as tmImage from '@teachablemachine/image';
import './TeachableMachine.css';

interface ModelConfig {
  id: string;
  name: string;
  url: string;
}

interface Prediction {
  className: string;
  probability: number;
}

interface CapturedPhoto {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  modelName: string;
  topClass: string;
  topProbability: number;
  allPredictions: Prediction[];
}

const MODELS: ModelConfig[] = [
  { id: 'persona-celular', name: 'Detección gafas/sin gafas/ audífonos/ lapiceros', url: 'https://teachablemachine.withgoogle.com/models/G9buTvJWE/' },
];

export default function Classifier() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[0]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<CapturedPhoto[]>([]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState<CapturedPhoto | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const webcamRef = useRef<HTMLDivElement>(null);
  const webcamInstance = useRef<tmImage.Webcam | null>(null);
  const animationId = useRef<number | null>(null);
  const currentModelInstance = useRef<tmImage.CustomMobileNet | null>(null);
  const lastPredictionTime = useRef<number>(0);

  // 1. Cargar localStorage solo en el cliente (evita errores de hidratación/SSR en Vercel)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tm_saved_photos');
      if (stored) {
        setSavedPhotos(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
  }, []);

  // 2. Guardar en localStorage limitando a 30 elementos para evitar QuotaExceededError
  useEffect(() => {
    if (savedPhotos.length === 0) return;
    try {
      // Guardamos solo los últimos 30 registros para no exceder los 5MB de quota con Base64
      const trimmed = savedPhotos.slice(0, 30);
      localStorage.setItem('tm_saved_photos', JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Límite de localStorage alcanzado:', e);
    }
  }, [savedPhotos]);

  const stopCurrentCamera = () => {
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
    if (webcamInstance.current) {
      webcamInstance.current.stop();
      webcamInstance.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.innerHTML = '';
    }
    setIsCameraActive(false);
  };

  const startModel = async (modelConfig = selectedModel) => {
    stopCurrentCamera();
    setIsLoading(true);

    try {
      const modelURL = modelConfig.url + 'model.json';
      const metadataURL = modelConfig.url + 'metadata.json';

      const loadedModel = await tmImage.load(modelURL, metadataURL);
      currentModelInstance.current = loadedModel;

      const webcam = new tmImage.Webcam(400, 400, true);
      await webcam.setup();
      await webcam.play();
      webcamInstance.current = webcam;

      if (webcamRef.current) {
        webcamRef.current.innerHTML = '';
        webcamRef.current.appendChild(webcam.canvas);
      }

      const loop = async () => {
        if (!webcamInstance.current) return;

        webcam.update();
        const now = Date.now();

        if (now - lastPredictionTime.current > 150) {
          const prediction = await loadedModel.predict(webcam.canvas);
          setPredictions(prediction);
          lastPredictionTime.current = now;
        }

        animationId.current = requestAnimationFrame(loop);
      };

      loop();
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error al cargar el modelo:', error);
      alert('Error al acceder a la cámara o cargar el modelo. Verifica los permisos HTTPS.');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!webcamInstance.current || predictions.length === 0) return;

    const canvas = webcamInstance.current.canvas;
    const imageDataUrl = canvas.toDataURL('image/png');

    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
    const topPrediction = sortedPredictions[0];

    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      imageDataUrl,
      modelName: selectedModel.name,
      topClass: topPrediction.className,
      topProbability: topPrediction.probability,
      allPredictions: predictions
    };

    setSavedPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas eliminar todo el historial?')) {
      setSavedPhotos([]);
      localStorage.removeItem('tm_saved_photos');
    }
  };

  const handleSelectModel = (modelConfig: ModelConfig) => {
    setSelectedModel(modelConfig);
    if (isCameraActive) {
      startModel(modelConfig);
    }
  };

  useEffect(() => {
    return () => stopCurrentCamera();
  }, []);

  const getConfidenceColor = (probability: number) => {
    if (probability >= 0.8) return '#10b981';
    if (probability >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const totalPages = Math.ceil(savedPhotos.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPhotos = savedPhotos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Reconocimiento e Inteligencia Artificial</h2>

      <div className="model-selector">
        {MODELS.map((m) => (
          <button
            key={m.id}
            className={`selector-btn ${selectedModel.id === m.id ? 'active' : ''}`}
            onClick={() => handleSelectModel(m)}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="classifier-grid">
        <div className="video-card">
          {!isCameraActive ? (
            <button
              className="action-btn"
              onClick={() => startModel()}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando Modelo...' : `Iniciar ${selectedModel.name}`}
            </button>
          ) : (
            <button className="action-btn capture-btn" onClick={capturePhoto}>
              📸 Tomar Foto
            </button>
          )}

          <div ref={webcamRef} className="webcam-box" />
        </div>

        <div className="metrics-card">
          <h3 className="metrics-title">Resultados en Tiempo Real</h3>

          {predictions.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Inicia la cámara para ver el análisis de datos.
            </p>
          ) : (
            predictions.map((p) => {
              const percentage = (p.probability * 100).toFixed(1);
              const barColor = getConfidenceColor(p.probability);

              return (
                <div key={p.className} className="prediction-item">
                  <div className="prediction-header">
                    <span className="prediction-name">{p.className}</span>
                    <span className="prediction-value" style={{ color: barColor }}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${percentage}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-container">
          <h3 className="metrics-title" style={{ margin: 0 }}>Historial de Fotos Capturadas</h3>
          {savedPhotos.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="total-badge">Total: {savedPhotos.length} fotos</span>
              <button className="clear-btn" onClick={handleClearAll}>
                🗑️ Limpiar Todo
              </button>
            </div>
          )}
        </div>

        {savedPhotos.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '12px' }}>
            No se han capturado fotos aún. Haz clic en "Tomar Foto" mientras la cámara está activa.
          </p>
        ) : (
          <>
            <table className="captures-table">
              <thead>
                <tr>
                  <th>Vista Previa</th>
                  <th>Hora</th>
                  <th>Modelo Usado</th>
                  <th>Detección Principal</th>
                  <th>Confianza</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPhotos.map((photo) => (
                  <tr key={photo.id} onClick={() => setActiveModalPhoto(photo)} className="clickable-row">
                    <td>
                      <img src={photo.imageDataUrl} alt="Captura" className="table-img" />
                    </td>
                    <td>{photo.timestamp}</td>
                    <td>{photo.modelName}</td>
                    <td><strong>{photo.topClass}</strong></td>
                    <td>
                      <span className="confidence-pill" style={{ backgroundColor: `${getConfidenceColor(photo.topProbability)}22`, color: getConfidenceColor(photo.topProbability) }}>
                        {(photo.topProbability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <button className="delete-row-btn" onClick={(e) => handleDeletePhoto(photo.id, e)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-container">
              <span className="pagination-info">
                Página {currentPage} de {totalPages} (Mostrando {currentPhotos.length} de {savedPhotos.length})
              </span>
              <div className="pagination-buttons">
                <button className="pagination-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  ◀ Anterior
                </button>
                <button className="pagination-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>
                  Siguiente ▶
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeModalPhoto && (
        <div className="modal-overlay" onClick={() => setActiveModalPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalPhoto(null)}>✕</button>
            <h3 className="metrics-title">Detalle de Captura</h3>
            
            <div className="modal-body">
              <img src={activeModalPhoto.imageDataUrl} alt="Ampliada" className="modal-img" />
              
              <div className="modal-details">
                <p><strong>Hora:</strong> {activeModalPhoto.timestamp}</p>
                <p><strong>Modelo:</strong> {activeModalPhoto.modelName}</p>
                <hr style={{ borderColor: '#1f2937', margin: '12px 0' }} />
                
                <h4 style={{ color: '#e5e7eb', marginBottom: '8px' }}>Desglose de Clases:</h4>
                {activeModalPhoto.allPredictions.map((p) => (
                  <div key={p.className} className="prediction-item">
                    <div className="prediction-header">
                      <span>{p.className}</span>
                      <span>{(p.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${p.probability * 100}%`,
                          backgroundColor: getConfidenceColor(p.probability)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}