import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { IntakeForm } from './pages/IntakeForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPortal } from './components/auth/AuthPortal';
import { LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Import the new dedicated enterprise dashboards ---
import { BorrowerDashboard } from './components/borrower/BorrowerDashboard';
import { LenderDashboard } from './components/lender/LenderDashboard';

// --- Shared Components (Kept strictly intact for Admin) ---
const TopNavigation = ({ title }: { title: string }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate(); // Enterprise routing
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login', { replace: true }); // Clean redirect without page reload
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

// --- Dashboard Layouts (Admin kept inline as requested) ---
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

// --- Auth Handling ---
const AuthRedirector = () => {
  const { user, role, loading } = useAuth();

  // Enterprise-grade smooth loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-blue-600 p-3 rounded-2xl mb-4 animate-pulse shadow-lg shadow-blue-600/20">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Authenticating Session...</p>
      </div>
    );
  }

  // Exact RBAC matching kept perfectly intact
  if (user && role) {
    if (role === 'super_admin' || role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'lender') return <Navigate to="/lender-dashboard" replace />;
    if (role === 'borrower') return <Navigate to="/borrower-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// --- Dynamic Fallback Route ---
// Directs authenticated users to their dashboard, unauthenticated users to the homepage
const FallbackRoute = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// --- Main Application Routing ---
export default function App() {
  // We use the current URL path as a unique key for our Auth routes
  const location = useLocation();

  return (
    <AuthProvider>
      <Routes>
        
        {/* --- Public Marketing Routes --- */}
        {/* MainLayout provides global Header/Footer only to marketing pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<IntakeForm />} />
        </Route>

        {/* --- Fullscreen Auth Portals --- */}
        {/* Moved OUTSIDE of MainLayout so the split-screen design takes up 100% of the viewport */}
        <Route 
          path="/login" 
          element={<AuthPortal key={location.pathname} initialMode="login" />} 
        />
        <Route 
          path="/signup/borrower" 
          element={<AuthPortal key={location.pathname} initialMode="signup" defaultRole="borrower" />} 
        />
        <Route 
          path="/signup/lender" 
          element={<AuthPortal key={location.pathname} initialMode="signup" defaultRole="lender" />} 
        />

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
              {/* Uses the imported dedicated component */}
              <LenderDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/borrower-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['borrower']}>
              {/* Uses the imported dedicated component */}
              <BorrowerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </AuthProvider>
  );
}