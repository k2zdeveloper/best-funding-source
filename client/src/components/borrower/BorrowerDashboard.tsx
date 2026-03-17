import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  LogOut, ChevronRight, CheckCircle2, 
  TrendingUp, ShieldCheck, Briefcase,
  Wallet, UploadCloud, Landmark, 
  ArrowRight, Bell, Clock, FileCheck, Building2
} from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';
import type { ModalType } from './DashboardModal';

// --- CODE SPLITTING: Lazy Load the Modal ---
const DashboardModal = lazy(() => import('./DashboardModal').then(module => ({ default: module.DashboardModal })));

// --- Interfaces ---
interface UserMetadata {
  company_name?: string;
  industry?: string;
  revenue?: string;
}

interface Application {
  id: string;
  status: 'pending_review' | 'underwriting' | 'matched' | 'funded';
  requested_amount: number;
  created_at: string;
}

interface LenderMatch {
  id: string;
  lender_name: string;
  proposed_amount: number;
  proposed_rate: string;
  status: 'reviewing' | 'offered';
}

export const BorrowerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<LenderMatch[]>([]);
  const [greeting, setGreeting] = useState('');
  
  // Interactive State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return navigate('/login', { replace: true });
        
        setUserData(user.user_metadata);

        const { data: preQuals } = await supabase
          .from('pre_qualifications')
          .select('id, status, requested_amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (preQuals) setApplications(preQuals as Application[]);

        setMatches([
          { id: '1', lender_name: 'Apex Institutional', proposed_amount: 1200000, proposed_rate: '8.5%', status: 'offered' },
          { id: '2', lender_name: 'Crestview Capital', proposed_amount: 0, proposed_rate: 'TBD', status: 'reviewing' }
        ]);

      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  
  const calculateBorrowingPower = (revenueStr: string = '') => {
    if (!revenueStr) return '$0';
    if (revenueStr.includes('10M')) return formatCurrency(2000000); 
    if (revenueStr.includes('5M')) return formatCurrency(1000000);
    return formatCurrency(500000); 
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      matched: 'bg-emerald-100 text-emerald-700',
      underwriting: 'bg-blue-100 text-blue-700',
      default: 'bg-amber-100 text-amber-700'
    };
    const style = styles[status] || styles.default;
    const label = status.replace('_', ' ');
    return <span className={`px-2.5 py-1 ${style} text-[10px] font-bold uppercase tracking-wider rounded-full`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* GLOBAL MODAL RENDERER */}
      <Suspense fallback={null}>
        {activeModal && <DashboardModal type={activeModal} onClose={() => setActiveModal(null)} />}
      </Suspense>

      {/* --- APP HEADER --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-xl shadow-sm shadow-blue-600/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Best<span className="text-blue-600">Funding</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        
        <VerificationBanner />

        {/* --- GREETING & HERO WALLET CARD --- */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 animate-in fade-in slide-in-from-left-4">
            {greeting}, <span className="text-blue-600">{userData?.company_name || 'Partner'}</span>
          </h1>

          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                  <Wallet className="w-4 h-4" /> Est. Borrowing Limit
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                  {calculateBorrowingPower(userData?.revenue)}
                </h2>
              </div>
              
              <button 
                onClick={() => setActiveModal('draw')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                Request Draw <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-blue-200">Profile Completion</span>
                <span className="text-sm font-bold text-white">60%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-400 h-2.5 rounded-full w-[60%] shadow-[0_0_10px_rgba(52,211,153,0.3)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500 fill-mode-both">
          <button onClick={() => setActiveModal('upload')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-95">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Upload<br/>Docs</span>
          </button>
          <button onClick={() => setActiveModal('bank')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-95">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1">
              <Landmark className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Link<br/>Bank</span>
          </button>
          <button onClick={() => setActiveModal('terms')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-95">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 text-center">Credit<br/>Boost</span>
          </button>
        </div>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-500 fill-mode-both">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">To-Do List</h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2">
                <div className="space-y-1">
                  <div onClick={() => setActiveModal('sign')} className="group flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Sign Disclosure Agreement</p>
                      <p className="text-xs text-slate-500 mt-0.5">Required to view lender offers.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div className="group flex items-center gap-4 p-3 opacity-60 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 line-through">Verify Corporate Email</p>
                      <p className="text-xs text-slate-500 mt-0.5">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-3 ml-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Your Offers</h3>
              </div>
              
              <div className="space-y-4">
                {matches.length > 0 ? matches.map((match) => (
                  <div key={match.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    {match.status === 'offered' && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Pre-Approved</div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{match.lender_name}</p>
                        <p className="text-xs text-slate-500 font-medium">Commercial Facility</p>
                      </div>
                    </div>

                    {match.status === 'offered' ? (
                      <>
                        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Approved Amount</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(match.proposed_amount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rate</p>
                            <p className="text-lg font-bold text-slate-700">{match.proposed_rate}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveModal('terms')} className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md active:scale-[0.98]">
                          Review Terms
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-sm font-medium text-slate-600">Underwriting in progress...</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
                    <p className="text-sm text-slate-500">Complete your application to receive offers.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Applications</h3>
                <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="New Request">
                  <span className="text-lg font-light leading-none mb-0.5">+</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {applications.length > 0 ? applications.map((app) => (
                  <div key={app.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900">{formatCurrency(app.requested_amount)}</p>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Submitted {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">No Active Requests</p>
                    <p className="text-xs text-slate-500 mt-1">Start a new application to see it here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};