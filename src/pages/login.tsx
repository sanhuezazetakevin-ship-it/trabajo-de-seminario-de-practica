import React, { useState } from 'react';
import type { LoginCredentials, User } from '../types/auth';

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
    if (formData.email === 'admin@gmail' && formData.password === '123456') {
      onLoginSuccess({ email: formData.email, name: 'Administrador' });
    } else {
      setError('Credenciales incorrectas (Usa: admin@correo.com / 123456)');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@gmail"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="123456"
            />
          </div>

          <button type="submit" className="submit-btn">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;