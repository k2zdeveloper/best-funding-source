import React, { Suspense, lazy, Component, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { AuthPortal } from './components/auth/AuthPortal';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { IntakeForm } from './pages/IntakeForm';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

// ==========================================
// 1. ENTERPRISE CODE SPLITTING (LAZY IMPORTS)
// ==========================================

// Dashboards
const BorrowerDashboard = lazy(() => import('./components/borrower/BorrowerDashboard').then(m => ({ default: m.BorrowerDashboard })));
const LenderDashboard = lazy(() => import('./components/lender/LenderDashboard').then(m => ({ default: m.LenderDashboard })));
const SuperAdminDashboard = lazy(() => import('./components/super_admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));

// Admin Views
const AdminOverview = lazy(() => import('./components/super_admin/views/AdminOverview').then(m => ({ default: m.AdminOverview })));
const AdminUsers = lazy(() => import('./components/super_admin/views/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminUserDetail = lazy(() => import('./components/super_admin/views/AdminUserDetail').then(m => ({ default: m.AdminUserDetail })));
const AdminVerifications = lazy(() => import('./components/super_admin/views/AdminVerifications').then(m => ({ default: m.AdminVerifications })));
const AdminAudits = lazy(() => import('./components/super_admin/views/AdminAudits').then(m => ({ default: m.AdminAudits })));

// ==========================================
// 2. GLOBAL SYSTEM COMPONENTS
// ==========================================

export const GlobalLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="bg-blue-600 p-3 rounded-2xl mb-4 animate-pulse shadow-lg shadow-blue-600/20">
      <ShieldCheck className="h-8 w-8 text-white" />
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Authenticating Session...</p>
  </div>
);

// Catches unhandled JavaScript crashes to prevent the "White Screen of Death"
class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">System Error Detected</h1>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            An unexpected error occurred in the application hierarchy. Please reload the application. If the issue persists, contact technical support.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// 3. AUTHENTICATION ROUTING LOGIC
// ==========================================

const AuthRedirector = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <GlobalLoader />;

  if (user) {
    if (!role) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-sm font-bold">Verifying security clearances...</p>
          </div>
        </div>
      );
    }

    const safeRole = String(role).toLowerCase().trim();

    const roleRoutes: Record<string, string> = {
      super_admin: '/admin-dashboard',
      admin: '/admin-dashboard',
      lender: '/lender-dashboard',
      borrower: '/borrower-dashboard'
    };

    const target = roleRoutes[safeRole] || '/borrower-dashboard';
    return <Navigate to={target} replace />;
  }

  return <Navigate to="/login" replace />;
};

// ==========================================
// 4. MAIN APPLICATION ROUTER
// ==========================================

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            
            {/* --- PUBLIC ROUTES --- */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/apply" element={<IntakeForm />} />
              </Route>
              <Route path="/login" element={<AuthPortal initialMode="login" />} />
              <Route path="/signup/borrower" element={<AuthPortal initialMode="signup" defaultRole="borrower" />} />
              <Route path="/signup/lender" element={<AuthPortal initialMode="signup" defaultRole="lender" />} />
            </Route>

            {/* --- SECURE ROUTES --- */}
            <Route path="/dashboard" element={<AuthRedirector />} />

            {/* --- ADMIN PORTAL --- */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="verifications" element={<AdminVerifications />} />
              <Route path="loans" element={<AdminAudits />} />
              <Route path="reports" element={<AdminAudits />} />
              
              {/* Placeholders for pending configurations */}
              <Route path="restrictions" element={<div className="p-6 font-bold text-slate-500">Access Control Module Pending</div>} />
              <Route path="support" element={<div className="p-6 font-bold text-slate-500">Support Desk Pending</div>} />
              <Route path="settings" element={<div className="p-6 font-bold text-slate-500">System Settings Pending</div>} />
            </Route>

            {/* --- LENDER PORTAL --- */}
            <Route 
              path="/lender-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['lender']}>
                  <LenderDashboard />
                </ProtectedRoute>
              } 
            />

            {/* --- BORROWER PORTAL --- */}
            <Route 
              path="/borrower-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <BorrowerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}