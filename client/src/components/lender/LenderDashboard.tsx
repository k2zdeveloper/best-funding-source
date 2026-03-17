import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, LogOut, Briefcase, TrendingUp, 
  Search, ChevronRight, Loader2, DollarSign, 
  Building2, Bell, Wallet, ArrowUpRight, Filter,
  Settings2,
  Clock
} from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';
import type { LenderModalType } from './LenderModal';

// --- CODE SPLITTING: Lazy Load the Modal ---
const LenderModal = lazy(() => import('./LenderModal').then(module => ({ default: module.LenderModal })));

export const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  
  // Interactive State
  const [activeModal, setActiveModal] = useState<LenderModalType>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return navigate('/login', { replace: true });
        
        setUserData(user.user_metadata);
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  // Simulated Deal Flow Data (In production, this queries the verified pre_qualifications)
  const activeDeals = [
    { id: '1', name: 'Project Alpha', sector: 'Manufacturing', target: 2500000, yield: '11.5%', term: '24 mo', funded: 60 },
    { id: '2', name: 'Project Horizon', sector: 'Logistics', target: 750000, yield: '9.0%', term: '12 mo', funded: 85 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* GLOBAL MODAL RENDERER */}
      <Suspense fallback={null}>
        {activeModal && <LenderModal type={activeModal} onClose={() => setActiveModal(null)} />}
      </Suspense>

      {/* --- APP HEADER --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded-xl shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Enterprise<span className="text-emerald-600">Funding</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div 
            onClick={handleSignOut}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        
        {/* --- VERIFICATION GATE --- */}
        <VerificationBanner />

        {/* --- GREETING & HERO WEALTH CARD --- */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 animate-in fade-in slide-in-from-left-4">
            {greeting}, <span className="text-emerald-600">{userData?.company_name || 'Institutional Partner'}</span>
          </h1>

          {/* Deep Emerald/Slate Gradient for Wealth feeling */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
                  <Wallet className="w-4 h-4" /> Available to Deploy
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                  {/* Defaulting to $0 until they deposit funds */}
                  $0.00
                </h2>
              </div>
              
              <button 
                onClick={() => setActiveModal('deposit')}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                Add Funds <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-emerald-200 uppercase tracking-widest mb-1">Total Deployed</p>
                <p className="text-xl font-bold text-white">$0.00</p>
              </div>
              <div>
                <p className="text-xs text-emerald-200 uppercase tracking-widest mb-1">Declared AUM</p>
                <p className="text-xl font-bold text-white">{userData?.aum || 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500 fill-mode-both">
          <button onClick={() => setActiveModal('auto-invest')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
              <Settings2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Auto-Invest</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Portfolio</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-1">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Tax Docs</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-1">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Entity Setup</span>
          </button>
        </div>

        {/* --- DEAL FLOW MARKETPLACE --- */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 delay-300 duration-500 fill-mode-both">
          
          {/* Section Header & Filters */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2.5">
              <Search className="h-4 w-4 text-emerald-500" /> Deal Marketplace
            </h2>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="w-3 h-3" /> Filters
              </button>
            </div>
          </div>
          
          {/* Deal List */}
          <div className="divide-y divide-slate-100 p-2">
            {activeDeals.map((deal) => (
              <div 
                key={deal.id} 
                onClick={() => setActiveModal('deal-details')}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer rounded-2xl border border-transparent hover:border-slate-100 group"
              >
                
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{deal.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                        {deal.sector}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> {deal.yield} Target Yield</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {deal.term}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 sm:gap-10 w-full md:w-auto ml-16 md:ml-0">
                  <div className="flex-1 md:w-48">
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                      <span>Funded</span>
                      <span className="text-emerald-600">{deal.funded}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${deal.funded}%` }}></div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Facility</p>
                    <p className="font-bold text-slate-900 text-lg">{formatCurrency(deal.target)}</p>
                  </div>

                  <div className="hidden sm:flex bg-slate-900 text-white w-8 h-8 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};