import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { IntakeForm } from './pages/IntakeForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPortal } from './components/auth/AuthPortal';
import { LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

const TopNavigation = ({ title }: { title: string }) => {
  const { user, role } = useAuth();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Role: {role}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">{user?.email}</span>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
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

const LenderDashboard = () => (
  <div className="min-h-screen bg-slate-50">
    <TopNavigation title="Lender Command Center" />
    <main className="p-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Deal Pipeline</h2>
        <p className="text-slate-600">Review active applications and allocate capital securely.</p>
      </div>
    </main>
  </div>
);

const BorrowerDashboard = () => (
  <div className="min-h-screen bg-slate-50">
    <TopNavigation title="Borrower Portal" />
    <main className="p-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-2">My Applications</h2>
        <p className="text-slate-600">Track your funding requests and upload necessary financial documentation.</p>
      </div>
    </main>
  </div>
);

const AuthRedirector = () => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (user && role) {
    if (role === 'super_admin' || role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'lender') return <Navigate to="/lender-dashboard" replace />;
    if (role === 'borrower') return <Navigate to="/borrower-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Marketing Routes wrapped in existing MainLayout */}
       <Route element={<MainLayout />}>
  <Route path="/" element={<LandingPage />} />
  <Route path="/apply" element={<IntakeForm />} />
  
  {/* Auth Routes stay safely inside MainLayout */}
  <Route path="/login" element={<AuthPortal initialMode="login" />} />
  <Route path="/signup/borrower" element={<AuthPortal initialMode="signup" defaultRole="borrower" />} />
  <Route path="/signup/lender" element={<AuthPortal initialMode="signup" defaultRole="lender" />} />
</Route>


        {/* Secure Dashboard Redirector */}
        <Route path="/dashboard" element={<AuthRedirector />} />

        {/* Protected Dashboard Routes */}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}