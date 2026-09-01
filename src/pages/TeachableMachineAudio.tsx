import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import '@tensorflow/tfjs';
import './TeachableMachineAudio.css';

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/SZ_0u6V5r/';
const ITEMS_PER_PAGE = 20;

interface Prediction {
  className: string;
  probability: number;
}

interface AudioCapture {
  id: string;
  time: string;
  topClass: string;
  topProbability: number;
  allPredictions: Prediction[];
}

const getConfidenceColor = (prob: number) => {
  if (prob >= 0.8) return '#10b981';
  if (prob >= 0.5) return '#f59e0b';
  return '#f43f5e';
};

const TeachableMachineAudio: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Historial de evidencias capturadas (paridad con los módulos de Imagen y Pose)
  const [captures, setCaptures] = useState<AudioCapture[]>(() => {
    try {
      const stored = localStorage.getItem('audio_saved_captures');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const audioRecognizer = useRef<speechCommands.SpeechCommandRecognizer | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('audio_saved_captures', JSON.stringify(captures.slice(0, 30)));
    } catch (e) {
      console.warn('Error al guardar en localStorage:', e);
    }
  }, [captures]);

  const startListening = async () => {
    setIsLoading(true);
    try {
      const modelURL = MODEL_URL + 'model.json';
      const metadataURL = MODEL_URL + 'metadata.json';

      const recognizer = speechCommands.create(
        'BROWSER_FFT',
        undefined,
        modelURL,
        metadataURL
      );

      await recognizer.ensureModelLoaded();
      audioRecognizer.current = recognizer;

      const classLabels = recognizer.wordLabels();

      await recognizer.listen(
        async (result: speechCommands.SpeechCommandRecognizerResult) => {
          const scores = result.scores as Float32Array;
          const preds = classLabels.map((className, i) => ({
            className,
            probability: scores[i]
          }));
          setPredictions(preds);
        },
        {
          includeSpectrogram: false,
          probabilityThreshold: 0.75,
          invokeCallbackOnNoiseAndUnknown: true,
          overlapFactor: 0.5
        }
      );

      setIsListening(true);
    } catch (error) {
      console.error('Error al cargar el modelo de audio:', error);
      alert('Error al acceder al micrófono o cargar el modelo. Verifica los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopListening = () => {
    if (audioRecognizer.current && audioRecognizer.current.isListening()) {
      audioRecognizer.current.stopListening();
    }
    audioRecognizer.current = null;
    setIsListening(false);
  };

  // Guarda la predicción actual como evidencia (igual que "Capturar Fotografía" en Imagen/Pose)
  const captureEvidence = () => {
    if (predictions.length === 0) return;
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

    const newCapture: AudioCapture = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      topClass: sorted[0].className,
      topProbability: sorted[0].probability,
      allPredictions: predictions,
    };

    setCaptures((prev) => [newCapture, ...prev]);
    setCurrentPage(1);
  };

  const handleDeleteCapture = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar el historial de capturas?')) {
      setCaptures([]);
      localStorage.removeItem('audio_saved_captures');
    }
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  const totalPages = useMemo(() => Math.ceil(captures.length / ITEMS_PER_PAGE) || 1, [captures.length]);
  const currentCaptures = useMemo(
    () => captures.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [captures, currentPage]
  );

  return (
    <div className="container">
      <section className="hero-section">
        <h1 className="hero-title">Detector de Audio</h1>
        <p className="hero-subtitle">
          Reconocimiento de sonidos en tiempo real usando tu micrófono.
        </p>

        <div className="hero-actions">
          {!isListening ? (
            <button className="btn btn-lg btn-primary" onClick={startListening} disabled={isLoading}>
              {isLoading ? 'Cargando modelo...' : 'Iniciar Escucha'}
            </button>
          ) : (
            <>
              <button className="btn btn-lg btn-outline" onClick={stopListening}>
                Detener
              </button>
              <button
                className="btn btn-lg btn-primary"
                onClick={captureEvidence}
                disabled={predictions.length === 0}
              >
                Capturar Evidencia
              </button>
            </>
          )}
        </div>
      </section>

      <section className="metrics-card">
        <h3 className="metrics-title">Resultados en Tiempo Real</h3>

        {predictions.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Inicia la escucha para ver el análisis de audio.
          </p>
        ) : (
          predictions.map((p) => {
            const percentage = (p.probability * 100).toFixed(1);
            const color = getConfidenceColor(p.probability);
            return (
              <div key={p.className} className="prediction-item">
                <div className="prediction-header">
                  <span className="prediction-name">{p.className}</span>
                  <span className="prediction-value" style={{ color }}>{percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="table-card">
        <div className="table-header-container">
          <h3 className="metrics-title" style={{ margin: 0 }}>Historial de Capturas</h3>
          {captures.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="total-badge">{captures.length} capturas</span>
              <button className="clear-btn" onClick={handleClearAll}>
                Limpiar Historial
              </button>
            </div>
          )}
        </div>

        {captures.length === 0 ? (
          <p className="empty-state-text">No hay capturas de audio guardadas en esta sesión.</p>
        ) : (
          <>
            <table className="captures-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Predicción Principal</th>
                  <th>Confianza</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentCaptures.map((capture) => {
                  const probColor = getConfidenceColor(capture.topProbability);
                  return (
                    <tr key={capture.id}>
                      <td>{capture.time}</td>
                      <td><strong>{capture.topClass}</strong></td>
                      <td>
                        <span
                          className="total-badge"
                          style={{
                            backgroundColor: `${probColor}18`,
                            color: probColor,
                            borderColor: `${probColor}44`,
                          }}
                        >
                          {(capture.topProbability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <button className="delete-row-btn" onClick={(e) => handleDeleteCapture(capture.id, e)}>
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
                Página {currentPage} de {totalPages} ({captures.length} registros)
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
      </section>
    </div>
  );
};

export default TeachableMachineAudio;
