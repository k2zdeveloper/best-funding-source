import React from 'react';
import { Outlet } from 'react-router-dom';
// Use ./ to import from the same folder
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50 relative selection:bg-blue-200">
      <Navigation />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};