import React, { useRef, useState, useEffect } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import '@tensorflow/tfjs';
import './TeacheableMachineAudio.css';

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/SZ_0u6V5r/';
const BAR_COUNT = 12;

const TeachableMachineAudio: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const audioRecognizer = useRef<speechCommands.SpeechCommandRecognizer | null>(null);
  const equalizerRef = useRef<HTMLDivElement>(null);

  // Crea las barras del ecualizador una sola vez
  useEffect(() => {
    const el = equalizerRef.current;
    if (!el) return;

    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('span');
      bar.style.height = `${20 + Math.random() * 60}%`;
      bar.style.animationDelay = `${Math.random() * 0.6}s`;
      el.appendChild(bar);
    }
  }, []);

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

  useEffect(() => {
    return () => stopListening();
  }, []);

  return (
    <div className="container">
      <section className="hero-section">
        <h1 className="hero-title">Detector de Audio</h1>
        <p className="hero-subtitle">
          Reconocimiento de sonidos en tiempo real usando tu micrófono.
        </p>

        {/* Barra de sonido */}
        <div className="equalizer" ref={equalizerRef} />

        <div className="hero-actions">
          {!isListening ? (
            <button className="btn btn-lg btn-primary" onClick={startListening} disabled={isLoading}>
              {isLoading ? 'Cargando modelo...' : 'Iniciar Escucha'}
            </button>
          ) : (
            <button className="btn btn-lg btn-outline" onClick={stopListening}>
              Detener
            </button>
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
      </section>
    </div>
  );
};

export default TeachableMachineAudio;