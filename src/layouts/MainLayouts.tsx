import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { User } from '../types/auth';

interface MainLayoutsProps {
  user: User | null;
  onLogout: () => void;
}

const MainLayouts: React.FC<MainLayoutsProps> = ({ user, onLogout }) => {
  return (
    <div className="layout-container">
      <Navbar user={user} onLogout={onLogout} />
      
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayouts;