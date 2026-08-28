import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import './Navbar.css';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => { navigate('/home'); closeMenu(); }} style={{ cursor: 'pointer' }}>
          DataAnalytics <span className="brand-badge">Suite</span>
        </div>

        {/* Botón Hamburguesa (solo visible en móviles) */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Menú de enlaces con clase dinámica */}
        <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/home" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            Inicio
          </NavLink>
          <NavLink to="/nosotros" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            Nosotros
          </NavLink>
          <NavLink to="/servicios" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            Servicios
          </NavLink>
          <NavLink to="/contacto" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            Contacto
          </NavLink>
          <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          
          {/* Bloque de usuario/cierre de sesión dentro del menú desplegable en móviles */}
          <div className="mobile-actions">
            {user && <span className="user-badge">{user.name || user.email}</span>}
            <button className="btn btn-sm btn-outline" onClick={() => { onLogout(); closeMenu(); }}>
              Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* Acciones principales (Visibles solo en escritorio) */}
        <div className="navbar-actions desktop-actions">
          {user && <span className="user-badge">{user.name || user.email}</span>}
          <button className="btn btn-sm btn-outline" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;