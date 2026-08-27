import React, { useRef, useState, useEffect } from 'react';
import * as tmImage from '@teachablemachine/image';
import './TeachableMachine.css';

// Registro de los diferentes modelos
const MODELS = [
  { id: 'persona-celular', name: 'Detección Persona/Celular', url: 'https://teachablemachine.withgoogle.com/models/xxPLarTDf/' },
  { id: 'posturas', name: 'Detector de Posturas', url: 'https://teachablemachine.withgoogle.com/models/TU_OTRO_MODELO_1/' },
  { id: 'objetos', name: 'Clasificador de Objetos', url: 'https://teachablemachine.withgoogle.com/models/TU_OTRO_MODELO_2/' }
];

export default function Classifier() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const webcamRef = useRef<HTMLDivElement>(null);
  const webcamInstance = useRef<tmImage.Webcam | null>(null);
  const animationId = useRef<number | null>(null);

  // Detener la cámara activa actual
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

  // Iniciar modelo seleccionado
  const startModel = async (modelConfig = selectedModel) => {
    stopCurrentCamera();
    setIsLoading(true);

    try {
      const modelURL = modelConfig.url + 'model.json';
      const metadataURL = modelConfig.url + 'metadata.json';

      const model = await tmImage.load(modelURL, metadataURL);
      const webcam = new tmImage.Webcam(400, 400, true);
      
      await webcam.setup();
      await webcam.play();
      webcamInstance.current = webcam;

      if (webcamRef.current) {
        webcamRef.current.innerHTML = '';
        webcamRef.current.appendChild(webcam.canvas);
      }

      const loop = async () => {
        webcam.update();
        const prediction = await model.predict(webcam.canvas);
        setPredictions(prediction);
        animationId.current = requestAnimationFrame(loop);
      };

      loop();
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error al cargar el modelo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar de modelo dinámicamente
  const handleSelectModel = (modelConfig: typeof MODELS[0]) => {
    setSelectedModel(modelConfig);
    if (isCameraActive) {
      startModel(modelConfig);
    }
  };

  useEffect(() => {
    return () => stopCurrentCamera();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Reconocimiento e Inteligencia Artificial</h2>

      {/* Menú de pestañas/botones para cambiar de modelo */}
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
        {/* Panel Izquierdo: Cámara */}
        <div className="video-card">
          {!isCameraActive && (
            <button
              className="action-btn"
              onClick={() => startModel()}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando Modelo...' : `Iniciar ${selectedModel.name}`}
            </button>
          )}

          <div ref={webcamRef} className="webcam-box" />
        </div>

        {/* Panel Derecho: Resultados con Barras de Porcentaje */}
        <div className="metrics-card">
          <h3 className="metrics-title">Resultados en Tiempo Real</h3>

          {predictions.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Inicia la cámara para ver el análisis de datos.
            </p>
          ) : (
            predictions.map((p) => {
              const percentage = (p.probability * 100).toFixed(1);
              return (
                <div key={p.className} className="prediction-item">
                  <div className="prediction-header">
                    <span className="prediction-name">{p.className}</span>
                    <span className="prediction-value">{percentage}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}