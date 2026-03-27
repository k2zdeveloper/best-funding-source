import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AdminSidebar } from './layout/AdminSidebar';
import { MobileTopBar } from './layout/MobileTopBar';

// --- MINIMALIST SAAS FALLBACKS ---
const DashboardLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 animate-in fade-in">
    <Loader2 className="w-5 h-5 animate-spin text-slate-900 mb-4" />
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Loading Module</p>
  </div>
);

class ModuleErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() { return { hasError: true }; }
  
  render() {
    if (this.state.hasError) return (
      <div className="p-6 bg-white border border-red-200 rounded-none flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Module Error</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            This specific dashboard module encountered a critical error. The rest of the system remains operational.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-xs font-semibold bg-white text-slate-900 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-none transition-colors"
          >
            Reload View
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export const SuperAdminDashboard: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    // antialiased and tracking-tight create that "Smart SaaS" typography feel
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-blue-100 antialiased tracking-tight">
      
      {/* 1. Mobile Top Navigation */}
      <MobileTopBar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* 2. Secure Sidebar Navigation */}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        closeMobile={() => setIsMobileSidebarOpen(false)} 
      />

      {/* 3. Main Audit & Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 pt-16 md:pt-0 h-full relative" role="main">
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
          {/* Strict padding and max-width for readable content blocks */}
          <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-full flex flex-col">
            
            <ModuleErrorBoundary>
              <Suspense fallback={<DashboardLoader />}>
                <Outlet />
              </Suspense>
            </ModuleErrorBoundary>

          </div>
        </div>
      </main>
      
    </div>
  );
};