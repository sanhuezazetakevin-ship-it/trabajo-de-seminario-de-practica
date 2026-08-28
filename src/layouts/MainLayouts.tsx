import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { User } from '../types/auth';

interface MainLayoutsProps {
  user: User | null;
  onLogout: () => void;
  isLightTheme: boolean;
  onThemeToggle: () => void;
}

const MainLayouts: React.FC<MainLayoutsProps> = ({ user, onLogout, isLightTheme, onThemeToggle }) => {
  return (
    <div className="layout-container">
      <Navbar user={user} onLogout={onLogout} isLightTheme={isLightTheme} onThemeToggle={onThemeToggle} />
      
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayouts;
