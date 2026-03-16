import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPortal } from './components/auth/AuthPortal';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { IntakeForm } from './pages/IntakeForm';
import { LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- ENTERPRISE BEST PRACTICE: CODE SPLITTING ---
// Dashboards are dynamically imported. Unauthenticated users will never download this code.
// Note: Assuming named exports based on your original imports.
const BorrowerDashboard = lazy(() => import('./components/borrower/BorrowerDashboard').then(m => ({ default: m.BorrowerDashboard })));
const LenderDashboard = lazy(() => import('./components/lender/LenderDashboard').then(m => ({ default: m.LenderDashboard })));

// --- Shared Components (Extract these to separate files ASAP) ---
const TopNavigation = ({ title }: { title: string }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
          Role: {role || 'Unassigned'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600 hidden sm:block">
          {user?.email}
        </span>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" /> 
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

const AdminDashboard = () => (
  <div className="min-h-screen bg-slate-50">
    <TopNavigation title="Enterprise Administration" />
    <main className="p-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-2">System Overview</h2>
        <p className="text-slate-600">Advanced metrics and full database controls are available here.</p>
      </div>
    </main>
  </div>
);

// --- Core Auth Logic ---
const GlobalLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="bg-blue-600 p-3 rounded-2xl mb-4 animate-pulse shadow-lg shadow-blue-600/20">
      <ShieldCheck className="h-8 w-8 text-white" />
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Authenticating Session...</p>
  </div>
);

const AuthRedirector = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <GlobalLoader />;

  if (user) {
    if (!role) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-xs font-medium">Verifying permissions...</p>
          </div>
        </div>
      );
    }

    // Strict exact-match routing mapping
    const roleRoutes: Record<string, string> = {
      super_admin: '/admin-dashboard',
      admin: '/admin-dashboard',
      lender: '/lender-dashboard',
      borrower: '/borrower-dashboard'
    };

    const target = roleRoutes[role];
    if (target) return <Navigate to={target} replace />;
  }

  return <Navigate to="/login" replace />;
};

const FallbackRoute = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
};

// --- Main Application Routing ---
export default function App() {
  return (
    <AuthProvider>
      {/* Suspense boundary catches the lazy-loaded dashboard components */}
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          
          {/* --- Public Marketing Routes --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/apply" element={<IntakeForm />} />
          </Route>

          {/* --- Fullscreen Auth Portals --- */}
          {/* CRITICAL FIX: Removed key={location.pathname} so React re-uses the component instance, allowing your CSS transitions to actually execute. */}
          <Route path="/login" element={<AuthPortal initialMode="login" />} />
          <Route path="/signup/borrower" element={<AuthPortal initialMode="signup" defaultRole="borrower" />} />
          <Route path="/signup/lender" element={<AuthPortal initialMode="signup" defaultRole="lender" />} />

          {/* --- Secure Dashboard Redirector --- */}
          <Route path="/dashboard" element={<AuthRedirector />} />

          {/* --- Protected Dashboard Routes --- */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lender-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['lender']}>
                <LenderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrower-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['borrower']}>
                <BorrowerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}