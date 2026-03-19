import React from 'react';
import { Wallet, ArrowRight, Eye, Download, Building2, ChevronRight } from 'lucide-react';
import type { BorrowerViewState } from '../BorrowerDashboard';

// --- TYPES ---
interface OverviewProps {
  userData: any;
  onNavigate: (view: BorrowerViewState) => void;
}

interface InstitutionalInteraction {
  id: string;
  name: string;
  actionType: 'term_sheet' | 'download' | 'view';
  actionText: string;
  timestamp: string;
}

// --- EXTRACTED UI COMPONENTS ---

const OverviewHero = ({ companyName, onNavigate }: { companyName: string, onNavigate: (view: BorrowerViewState) => void }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-8">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 tracking-tight">
        {greeting}, <span className="text-blue-600">{companyName || 'Partner'}</span>
      </h1>

      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden group transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Wallet className="w-3.5 h-3.5" /> Max Approved Facility
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              $1,500,000
            </h2>
          </div>
          
          <button 
            onClick={() => onNavigate('pitch')}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            aria-label="Update Capital Pitch"
          >
            Update Capital Pitch <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Market Traction Stats */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Profile Views</p>
            <p className="text-2xl font-bold text-white tracking-tight">24</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Doc Downloads</p>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">8</p>
          </div>
          <div className="col-span-2 hidden md:block">
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Syndication Progress</p>
              <span className="text-xs font-bold text-white">60% Funded</span>
            </div>
            <div className="bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-emerald-400 h-full rounded-full w-[60%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EngagementFeed = ({ interactions, onNavigate }: { interactions: InstitutionalInteraction[], onNavigate: (view: BorrowerViewState) => void }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Building2 className="w-4 h-4 text-blue-600" /> Active Institutional Interest
      </h2>
      
      <div className="space-y-3">
        {interactions.map((interaction) => (
          <div 
            key={interaction.id}
            onClick={() => onNavigate('messages')}
            className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-2xl group hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition-all cursor-pointer"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-200 transition-colors">
                <Building2 className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {interaction.name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className={`${
                    interaction.actionType === 'term_sheet' ? 'text-emerald-600' : 
                    interaction.actionType === 'download' ? 'text-blue-600' : 'text-slate-600'
                  } font-bold`}>
                    {interaction.actionText}
                  </span>
                  <span className="text-slate-300">•</span>
                  {interaction.timestamp}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 group-hover:text-blue-600 bg-white border border-slate-200 group-hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
              Reply <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}

        {interactions.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-sm font-medium text-slate-500">No institutional interactions yet.</p>
            <p className="text-xs text-slate-400 mt-1">Updates will appear here when lenders view your pitch.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---

export const BorrowerOverview: React.FC<OverviewProps> = ({ userData, onNavigate }) => {
  
  // Mock Data (To be replaced with Supabase fetch logic)
  const recentInteractions: InstitutionalInteraction[] = [
    {
      id: '1',
      name: 'Apex Institutional Capital',
      actionType: 'term_sheet',
      actionText: 'Term Sheet Issued',
      timestamp: 'Reviewed Financials'
    },
    {
      id: '2',
      name: 'Crestview Capital Management',
      actionType: 'download',
      actionText: 'Downloaded Cap Table',
      timestamp: '2 hours ago'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <OverviewHero 
        companyName={userData?.company_name} 
        onNavigate={onNavigate} 
      />
      
      <EngagementFeed 
        interactions={recentInteractions} 
        onNavigate={onNavigate} 
      />
    </div>
  );
};