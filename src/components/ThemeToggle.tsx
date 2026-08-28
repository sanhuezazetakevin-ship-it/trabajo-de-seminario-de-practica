import React from 'react';
import './ThemeToggle.css';
interface ThemeToggleProps { isLight: boolean; onToggle: () => void; }
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isLight, onToggle }) => (
  <button type="button" className={`theme-toggle ${isLight ? 'is-light' : ''}`} onClick={onToggle} aria-label={isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'} aria-pressed={isLight} title={isLight ? 'Tema claro (cambiar a oscuro)' : 'Tema oscuro (cambiar a claro)'}>
    <span className="theme-toggle-track"><span className="theme-toggle-stars" aria-hidden="true">✦</span><span className="theme-toggle-thumb" aria-hidden="true"><span className="theme-toggle-sun-rays" /></span></span>
  </button>
);
export default ThemeToggle;
