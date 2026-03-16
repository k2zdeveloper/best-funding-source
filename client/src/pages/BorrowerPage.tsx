import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, FolderLock, FileText, Activity, 
  Wallet, Users, Settings, Bell, Search, Menu, 
  X, ChevronRight, Download, UploadCloud, AlertCircle 
} from 'lucide-react';

// --- SHARED COMPONENTS ---

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

// --- BORROWER DASHBOARD ---
// Focuses on application status, required actions, and easy document upload.

const BorrowerOverview = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-slate-500">Manage your active facilities and outstanding requirements.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all">
          <UploadCloud className="w-4 h-4" /> Upload Financials
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-l-4 border-l-blue-600">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Facility</p>
          <h3 className="text-3xl font-bold text-slate-900">$2,500,000</h3>
          <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Revolving Line of Credit
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Payment</p>
          <h3 className="text-3xl font-bold text-slate-900">$42,150</h3>
          <p className="text-xs text-slate-500 mt-2">Due on April 1st, 2026</p>
        </GlassCard>
        <GlassCard className="p-6 bg-amber-50/50 border-amber-200/60">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Action Required</p>
          <h3 className="text-lg font-bold text-slate-900">Q1 2026 Balance Sheet</h3>
          <button className="text-xs text-amber-700 font-bold mt-2 hover:underline flex items-center gap-1">
            Submit now <ChevronRight className="w-3 h-3" />
          </button>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">Recent Document Vault Activity</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">2025_Corporate_Tax_Return.pdf</p>
                  <p className="text-xs text-slate-500">Uploaded by Admin • 2 days ago</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                Verified
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// --- LENDER DASHBOARD ---
// Focuses on portfolio analytics, pipeline management, and risk alerts.

const LenderOverview = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Portfolio Command Center</h2>
          <p className="text-sm text-slate-500">Real-time analytics across deployed capital and active pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Deployed</p>
          <h3 className="text-2xl font-bold text-slate-900">$142.5M</h3>
          <p className="text-[10px] text-green-600 font-bold mt-1">+2.4% this quarter</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Deals</p>
          <h3 className="text-2xl font-bold text-slate-900">24</h3>
          <p className="text-[10px] text-slate-500 mt-1">Across 4 sectors</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pipeline Volume</p>
          <h3 className="text-2xl font-bold text-slate-900">$38.2M</h3>
          <p className="text-[10px] text-slate-500 mt-1">12 deals in review</p>
        </GlassCard>
        <GlassCard className="p-5 bg-red-50/50 border-red-200/60">
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Risk Alerts</p>
          <h3 className="text-2xl font-bold text-red-700">2</h3>
          <p className="text-[10px] text-red-600 font-medium mt-1">Covenant breaches</p>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">Pipeline Deal Flow</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Acme Logistics LLC</td>
                <td className="px-6 py-4">$5,000,000</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">Underwriting</span></td>
                <td className="px-6 py-4"><span className="text-green-600 font-bold">A-</span></td>
                <td className="px-6 py-4 text-right"><button className="text-blue-600 font-bold text-xs hover:underline">Review</button></td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Starlight Tech</td>
                <td className="px-6 py-4">$1,200,000</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold">Docs Pending</span></td>
                <td className="px-6 py-4"><span className="text-amber-600 font-bold">B+</span></td>
                <td className="px-6 py-4 text-right"><button className="text-blue-600 font-bold text-xs hover:underline">Review</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};


// --- MAIN DASHBOARD LAYOUT SHELL ---

export const DashboardLayout = ({ role = 'borrower' }: { role: 'borrower' | 'lender' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation based on the user's role
  const navigation = role === 'borrower' ? [
    { name: 'Overview', icon: LayoutDashboard, active: true },
    { name: 'My Applications', icon: FileText, active: false },
    { name: 'Document Vault', icon: FolderLock, active: false },
    { name: 'Repayments', icon: Activity, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ] : [
    { name: 'Portfolio Overview', icon: LayoutDashboard, active: true },
    { name: 'Deal Pipeline', icon: Activity, active: false },
    { name: 'Risk & Compliance', icon: AlertCircle, active: false },
    { name: 'Capital Ledger', icon: Wallet, active: false },
    { name: 'Syndicate', icon: Users, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex text-slate-900 font-sans">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col border-r border-slate-800">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <span className="font-bold text-xl text-white tracking-tight">
              Enterprise<span className="text-blue-500">Funding</span>
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="px-2 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {role === 'borrower' ? 'Borrower Portal' : 'Lender Command'}
              </p>
            </div>
            {navigation.map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.active ? 'text-blue-500' : 'text-slate-500'}`} />
                {item.name}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white">
                JS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">John Smith</p>
                <p className="text-xs text-slate-500 truncate">john@acmecorp.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search entities, documents, or deals..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <button className="text-sm font-bold text-slate-600 hover:text-slate-900 hidden sm:block">
              Help & Support
            </button>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {role === 'borrower' ? <BorrowerOverview /> : <LenderOverview />}
          </div>
        </div>
      </main>

    </div>
  );
};

// Default export for testing purposes
export default DashboardLayout;