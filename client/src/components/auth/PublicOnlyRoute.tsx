import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const PublicOnlyRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // If an authenticated user tries to access this route, bounce them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no user exists, render the public components (Landing Page, Intake Form)
  return <Outlet />;
};