import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayouts from '../layouts/MainLayouts';
import LoginForm from '../pages/login';
import DashBoard from '../pages/DashBoard';
import Home from '../pages/Home';
import About from '../pages/About';
import Service from '../pages/Service';
import Contact from '../pages/Contact';
import TeachableMachine from "../pages/TeachableMachine"
import TeachableMachineAudio from "../pages/TeachableMachineAudio"
import TeachableMachinePose from "../pages/TeachableMachinePose"

import type { User } from '../types/auth';

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null);
  const [isLightTheme, setIsLightTheme] = useState(() => localStorage.getItem('theme') === 'light');
  const navigate = useNavigate();
  useEffect(() => { document.documentElement.dataset.theme = isLightTheme ? 'light' : 'dark'; localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); }, [isLightTheme]);

  // Iniciar sesión
  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    navigate('/dashboard');
  };

  // Cerrar sesión
  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <Routes>
      {/* 1. Login */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginForm onLoginSuccess={handleLoginSuccess} />
        } 
      />

      {/* 2. Rutas Protegidas */}
      <Route element={user ? <MainLayouts user={user} onLogout={handleLogout} isLightTheme={isLightTheme} onThemeToggle={() => setIsLightTheme((value) => !value)} /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/servicios" element={<Service />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/TeachableMachine" element={<TeachableMachine/>}/>
        <Route path="/TeachableMachineAudio" element={<TeachableMachineAudio/>}/>
        <Route path="/TeachableMachinePose" element={<TeachableMachinePose/>}/>
      </Route>

      {/* 3. Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
