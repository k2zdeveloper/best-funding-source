import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Make sure path is correct
import { Loader2 } from 'lucide-react';

export const PublicOnlyRoute: React.FC = () => {
  // 1. Pull the role out of the context as well
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 2. If authenticated, bounce them DIRECTLY to their specific dashboard
  if (user) {
    let targetPath = '/dashboard'; // Safe fallback
    
    if (role) {
      const safeRole = String(role).toLowerCase().trim();
      if (safeRole === 'lender') targetPath = '/lender-dashboard';
      else if (safeRole === 'borrower') targetPath = '/borrower-dashboard';
      else if (safeRole === 'admin' || safeRole === 'super_admin') targetPath = '/admin-dashboard';
    }

    // The 'replace' keyword is what fixes the Chrome Back Button issue.
    // It overwrites the history state so they can't get stuck in a redirect loop.
    return <Navigate to={targetPath} replace />;
  }

  // 3. If NOT logged in, allow them to view the Landing Page, Login, and Signup
  return <Outlet />;
};