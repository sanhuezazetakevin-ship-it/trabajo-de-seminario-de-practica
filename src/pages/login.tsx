import React, { useState } from 'react';
import type { LoginCredentials, User } from '../types/auth';
import './login.css';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Credenciales de prueba
    if (
      (formData.email === 'admin@gmail' || formData.email === 'admin@correo.com' || formData.email.includes('@')) &&
      formData.password === '123456'
    ) {
      onLoginSuccess({ email: formData.email, name: 'Administrador' });
    } else {
      setError('Credenciales incorrectas (Usa: admin@gmail / 123456)');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <span className="tag-label">Acceso Restringido</span>
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">DataAnalytics Suite Platform</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="text"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@gmail"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="123456"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;