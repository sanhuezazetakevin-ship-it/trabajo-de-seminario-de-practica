import React from 'react';
import { NavLink } from 'react-router-dom';
import type { User } from '../types/auth';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="navbar">
      <h2>MiApp</h2>

      <nav className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/nosotros">Nosotros</NavLink>
        <NavLink to="/servicios">Servicios</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
      </nav>

      <div className="navbar-user">
        {user && <span>{user.name || user.email}</span>}
        <button onClick={onLogout}>Cerrar Sesión</button>
      </div>
    </header>
  );
};

export default Navbar;