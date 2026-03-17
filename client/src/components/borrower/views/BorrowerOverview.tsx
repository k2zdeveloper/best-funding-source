import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight, Eye, Download, Building2, ChevronRight } from 'lucide-react';
import type { BorrowerViewState } from '../BorrowerDashboard';

interface OverviewProps {
  userData: any;
  onNavigate: (view: BorrowerViewState) => void;
}

export const BorrowerOverview: React.FC<OverviewProps> = ({ userData, onNavigate }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* GREETING & HERO WALLET CARD */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
          {greeting}, <span className="text-blue-600">{userData?.company_name || 'Partner'}</span>
        </h1>

        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Wallet className="w-4 h-4" /> Max Approved Facility
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                $1,500,000
              </h2>
            </div>
            
            <button 
              onClick={() => onNavigate('pitch')}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              Update Capital Pitch <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Market Traction Stats */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Profile Views</p>
              <p className="text-xl font-bold text-white">24</p>
            </div>
            <div>
              <p className="text-xs text-emerald-200 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Doc Downloads</p>
              <p className="text-xl font-bold text-emerald-400">8</p>
            </div>
            <div className="col-span-2 hidden md:block">
              <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">Syndication Progress</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full w-[60%]"></div></div>
                <span className="text-sm font-bold text-white">60% Funded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LENDER ENGAGEMENT FEED */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-blue-600" /> Active Institutional Interest
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Apex Institutional Capital</p>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-600 font-bold">Term Sheet Issued</span> • Reviewed Financials
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate('messages')} className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              Reply <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Crestview Capital Management</p>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                  <span className="text-blue-600 font-bold">Downloaded Cap Table</span> • 2 hours ago
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate('messages')} className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              Message <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};