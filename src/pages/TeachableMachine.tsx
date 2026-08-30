import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
  {
    id: 'persona-celular',
    name: 'Detección gafas / audífonos / lapiceros',
    url: 'https://teachablemachine.withgoogle.com/models/G9buTvJWE/',
  },
];

const ITEMS_PER_PAGE = 20;

const getConfidenceColor = (prob: number) => {
  if (prob >= 0.8) return 'var(--accent-emerald)';
  if (prob >= 0.5) return '#f59e0b';
  return 'var(--accent-rose)';
};

// Componente reutilizable para barras de progreso
function PredictionList({ predictions }: { predictions: Prediction[] }) {
  return (
    <>
      {predictions.map((p) => {
        const percentage = (p.probability * 100).toFixed(1);
        const color = getConfidenceColor(p.probability);
        return (
          <div key={p.className} className="prediction-item">
            <div className="prediction-header">
              <span>{p.className}</span>
              <span style={{ color }}>{percentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function Classifier() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[0]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<CapturedPhoto[]>(() => {
    try {
      const stored = localStorage.getItem('tm_saved_photos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState<CapturedPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const webcamRef = useRef<HTMLDivElement>(null);
  const webcamInstance = useRef<tmImage.Webcam | null>(null);
  const animationId = useRef<number | null>(null);
  const currentModelInstance = useRef<tmImage.CustomMobileNet | null>(null);
  const lastPredictionTime = useRef<number>(0);

  // Guardar fotos en localStorage (limitado a 30)
  useEffect(() => {
    try {
      localStorage.setItem('tm_saved_photos', JSON.stringify(savedPhotos.slice(0, 30)));
    } catch (e) {
      console.warn('Error al guardar en localStorage:', e);
    }
  }, [savedPhotos]);

  const stopCurrentCamera = useCallback(() => {
    if (animationId.current) cancelAnimationFrame(animationId.current);
    if (webcamInstance.current) webcamInstance.current.stop();
    if (webcamRef.current) webcamRef.current.innerHTML = '';
    
    animationId.current = null;
    webcamInstance.current = null;
    setIsCameraActive(false);
  }, []);

  const startModel = async (modelConfig = selectedModel) => {
    stopCurrentCamera();
    setIsLoading(true);

    try {
      const loadedModel = await tmImage.load(
        `${modelConfig.url}model.json`,
        `${modelConfig.url}metadata.json`
      );
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
          const pred = await loadedModel.predict(webcam.canvas);
          setPredictions(pred);
          lastPredictionTime.current = now;
        }

        animationId.current = requestAnimationFrame(loop);
      };

      loop();
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error al cargar modelo/cámara:', error);
      alert('Error al acceder a la cámara o cargar el modelo. Verifica los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!webcamInstance.current || predictions.length === 0) return;

    const imageDataUrl = webcamInstance.current.canvas.toDataURL('image/png');
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      imageDataUrl,
      modelName: selectedModel.name,
      topClass: sorted[0].className,
      topProbability: sorted[0].probability,
      allPredictions: predictions,
    };

    setSavedPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar el historial de capturas?')) {
      setSavedPhotos([]);
      localStorage.removeItem('tm_saved_photos');
    }
  };

  const handleSelectModel = (modelConfig: ModelConfig) => {
    setSelectedModel(modelConfig);
    if (isCameraActive) startModel(modelConfig);
  };

  useEffect(() => () => stopCurrentCamera(), [stopCurrentCamera]);

  // Paginación calculada mediante Memo
  const totalPages = useMemo(() => Math.ceil(savedPhotos.length / ITEMS_PER_PAGE) || 1, [savedPhotos.length]);
  const currentPhotos = useMemo(
    () => savedPhotos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [savedPhotos, currentPage]
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Reconocimiento e IA</h2>
      </header>

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
            <button className="action-btn" onClick={() => startModel()} disabled={isLoading}>
              {isLoading ? 'Cargando Modelo...' : `Iniciar ${selectedModel.name}`}
            </button>
          ) : (
            <button className="action-btn capture-btn" onClick={capturePhoto}>
              📸 Capturar Fotografía
            </button>
          )}
          <div ref={webcamRef} className="webcam-box" />
        </div>

        <div className="metrics-card">
          <h3 className="metrics-title">Análisis en Tiempo Real</h3>
          {predictions.length === 0 ? (
            <p className="empty-state-text">Inicia la cámara para comenzar el análisis.</p>
          ) : (
            <PredictionList predictions={predictions} />
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-container">
          <h3 className="metrics-title">Historial de Capturas</h3>
          {savedPhotos.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="total-badge">{savedPhotos.length} fotos</span>
              <button className="clear-btn" onClick={handleClearAll}>
                🗑️ Limpiar Historial
              </button>
            </div>
          )}
        </div>

        {savedPhotos.length === 0 ? (
          <p className="empty-state-text">No hay capturas guardadas en esta sesión.</p>
        ) : (
          <>
            <table className="captures-table">
              <thead>
                <tr>
                  <th>Vista Previa</th>
                  <th>Hora</th>
                  <th>Modelo</th>
                  <th>Predicción Principal</th>
                  <th>Confianza</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentPhotos.map((photo) => {
                  const probColor = getConfidenceColor(photo.topProbability);
                  return (
                    <tr key={photo.id} onClick={() => setActiveModalPhoto(photo)} className="clickable-row">
                      <td>
                        <img src={photo.imageDataUrl} alt="Captura" className="table-img" />
                      </td>
                      <td>{photo.timestamp}</td>
                      <td>{photo.modelName}</td>
                      <td><strong>{photo.topClass}</strong></td>
                      <td>
                        <span
                          className="total-badge"
                          style={{
                            backgroundColor: `${probColor}18`,
                            color: probColor,
                            borderColor: `${probColor}44`,
                          }}
                        >
                          {(photo.topProbability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <button className="delete-row-btn" onClick={(e) => handleDeletePhoto(photo.id, e)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination-container">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Página {currentPage} de {totalPages} ({savedPhotos.length} registros)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeModalPhoto && (
        <div className="modal-overlay" onClick={() => setActiveModalPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalPhoto(null)}>
              ✕
            </button>
            <h3 className="metrics-title">Detalle de Captura</h3>

            <div className="modal-body">
              <img src={activeModalPhoto.imageDataUrl} alt="Ampliada" className="modal-img" />

              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <strong>Hora:</strong> {activeModalPhoto.timestamp}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  <strong>Modelo:</strong> {activeModalPhoto.modelName}
                </p>

                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Clasificación:</h4>
                <PredictionList predictions={activeModalPhoto.allPredictions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 