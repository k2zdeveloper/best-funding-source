import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'borrower' | 'lender' | 'admin' | 'super_admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // ADDED: React Router navigation

  // Defensive state: prevents flashing the "Access Denied" screen if the context 
  // takes a split second to hydrate the role after the user object is ready.
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Small debounce to ensure role hydration catches up to user hydration
      const timer = setTimeout(() => setIsHydrating(false), 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || isHydrating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Verifying secure connection...</h3>
        <p className="text-sm text-slate-500 mt-2">Retrieving enterprise access credentials</p>
      </div>
    );
  }

  // 1. Not logged in at all -> Kick to login and remember where they tried to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in, but wrong role -> Show strictly handled Access Denied
  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Your current authorization tier ({role ? role.toUpperCase() : 'UNASSIGNED'}) does not permit access to this module. 
            If you believe this is an error, contact your platform administrator.
          </p>
          <button 
            onClick={() => navigate('/dashboard', { replace: true })} // FIXED: Native SPA routing
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors text-sm uppercase tracking-wide"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. Logged in, correct role -> Render the protected content
  return <>{children}</>;
};