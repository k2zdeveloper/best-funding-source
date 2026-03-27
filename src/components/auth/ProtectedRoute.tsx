import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// TYPE SAFETY: Using NonNullable<Role> extracts the exact strings from your context
// ensuring you can't accidentally pass typos into your allowedRoles array.
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: NonNullable<Role>[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Loading State: Displayed while AuthContext securely resolves the session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Securing Connection</h3>
        <p className="text-sm text-slate-500 mt-2">Verifying enterprise credentials...</p>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login, preserving their intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Unauthorized: Logged in, but lacks the specific required role
  // Because our AuthContext normalizes the role, we don't need string manipulation here!
  if (!role || !allowedRoles.includes(role)) {
    
    // ESCAPE HATCH: Allow users to reset their session if permissions conflict
    const handleEmergencyLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            Your current authorization tier <span className="font-bold text-slate-800 px-1.5 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">({role ? role.toUpperCase() : 'UNASSIGNED'})</span> does not permit access to this sector. 
            If you require access, please contact your platform administrator.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </button>
            
            <button 
              onClick={handleEmergencyLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: Render the protected view
  return <>{children}</>;
};