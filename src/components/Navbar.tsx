import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../types/auth';
import './Navbar.css';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          DataAnalytics <span className="brand-badge">Suite</span>
        </div>

        <nav className="navbar-links">
          <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
            Inicio
          </NavLink>
          <NavLink to="/nosotros" className={({ isActive }) => (isActive ? 'active' : '')}>
            Nosotros
          </NavLink>
          <NavLink to="/servicios" className={({ isActive }) => (isActive ? 'active' : '')}>
            Servicios
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'active' : '')}>
            Contacto
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
        </nav>

        <div className="navbar-actions">
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