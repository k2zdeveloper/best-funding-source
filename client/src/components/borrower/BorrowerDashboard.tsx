import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, LogOut, Clock, FileText, ChevronRight, 
  AlertCircle, CheckCircle2, TrendingUp, DollarSign, 
  ShieldCheck, Briefcase
} from 'lucide-react';

// --- Interfaces ---
interface UserMetadata {
  company_name?: string;
  industry?: string;
  revenue?: string;
  loan_amount?: string;
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
  
  // Simulated Lender Matches (You would fetch these from an 'offers' table)
  const [matches, setMatches] = useState<LenderMatch[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get Session & Metadata
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          navigate('/login', { replace: true });
          return;
        }
        setUserData(user.user_metadata);

        // 2. Fetch Active Applications (Pre-qualifications)
        const { data: preQuals, error: dbError } = await supabase
          .from('pre_qualifications')
          .select('id, status, requested_amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!dbError && preQuals) {
          setApplications(preQuals as Application[]);
        }

        // 3. Simulate fetching lender matches for demonstration
        // In reality: .from('lender_offers').select('*').eq('application_id', preQuals[0].id)
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

  // --- Helper Functions ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Estimate borrowing capacity based on a rough 20% of high-end revenue string (Mock logic for conversion UI)
  const calculateBorrowingPower = (revenueStr: string = '') => {
    if (!revenueStr) return '$0';
    if (revenueStr.includes('10M')) return formatCurrency(2000000); // Ex: $5M - $10M -> $2M cap
    if (revenueStr.includes('5M')) return formatCurrency(1000000);
    return formatCurrency(500000); // Default fallback
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Lender Matched</span>;
      case 'underwriting':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full">In Underwriting</span>;
      default:
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Pending Review</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Securing your financial portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            BestFunding<span className="text-blue-600">Source</span>
          </span>
        </div>
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* --- HEADER & BORROWING POWER (The "Hook") --- */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2 relative z-10">
              Welcome back, {userData?.company_name || 'Partner'}
            </h1>
            <p className="text-slate-500 mb-6 relative z-10 max-w-lg">
              Your profile is currently <span className="font-bold text-orange-500">60% complete</span>. Finish uploading your financial documents to expedite the underwriting process.
            </p>
            <div className="flex gap-4 relative z-10">
              <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                Upload Documents
              </button>
            </div>
          </div>

          <div className="lg:w-1/3 bg-blue-950 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-blue-900 to-blue-950 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">
                <TrendingUp className="w-4 h-4" />
                Est. Borrowing Capacity
              </div>
              <p className="text-4xl md:text-5xl font-bold font-serif text-white tracking-tight mb-2 drop-shadow-md">
                {calculateBorrowingPower(userData?.revenue)}
              </p>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Based on your stated annual revenue of {userData?.revenue || 'N/A'}. Final terms depend on verification of cash flow and corporate credit.
              </p>
            </div>
          </div>
        </div>

        {/* --- MAIN DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Pipelines & Matches */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Applications */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Active Capital Requests</h2>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">New Request +</button>
              </div>
              
              <div className="p-0">
                {applications.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-lg font-bold text-slate-900 mb-1">{formatCurrency(app.requested_amount)} Facility</p>
                          <p className="text-xs text-slate-500 font-medium">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(app.status)}
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700 mb-1">No Active Requests</p>
                    <p className="text-xs text-slate-500 mb-4">You haven't submitted a formal pre-qualification yet.</p>
                    <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                      Start Application
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Lender Matches (High Conversion Feature) */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" /> Lender Matches
                </h2>
              </div>
              <div className="p-6">
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match) => (
                      <div key={match.id} className={`p-5 rounded-xl border ${match.status === 'offered' ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</p>
                            <p className="font-bold text-slate-900">{match.lender_name}</p>
                          </div>
                          {match.status === 'offered' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-wider rounded">Offer Received</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">Reviewing</span>
                          )}
                        </div>
                        {match.status === 'offered' && (
                          <div className="pt-4 border-t border-slate-200/60 mt-2">
                            <p className="text-xs text-slate-500 mb-1">Proposed Facility</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-green-700">{formatCurrency(match.proposed_amount)}</span>
                              <span className="text-sm font-medium text-slate-600">@ {match.proposed_rate}</span>
                            </div>
                            <button className="mt-4 w-full py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                              View Term Sheet
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Complete your application to start receiving term sheets.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Action Center */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> Action Required
              </h2>
              
              <div className="space-y-3">
                {/* Task 1 */}
                <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Sign Pre-Qualification</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">Digitally sign the initial disclosure to authorize soft credit pulls.</p>
                    </div>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Connect Bank Accounts</p>
                      <p className="text-xs text-slate-500 mt-1">Link your operating accounts via Plaid for instant cash-flow analysis.</p>
                    </div>
                  </div>
                </div>

                {/* Completed Task */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 opacity-60">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 line-through">Account Verification</p>
                      <p className="text-xs text-slate-500 mt-1">Email and business details confirmed.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  Need help? Contact your dedicated funding advisor at <br/>
                  <a href="mailto:support@bestfundingsource.com" className="font-bold text-blue-600 hover:underline">support@bestfundingsource.com</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};