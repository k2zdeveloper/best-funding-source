import React, { useEffect, useState } from 'react';
import { Wallet, ArrowRight, Eye, Download, Building2, ChevronRight, Clock, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; 

// --- TYPES ---
interface OverviewProps {
  userData: any;
  // Upgraded to accept a second parameter: the specific Pitch ID
  onNavigate: (view: string, id?: string) => void;
}

// --- EXTRACTED UI COMPONENTS ---

const OverviewHero = ({ companyName, pitches, onNavigate }: { companyName: string, pitches: any[], onNavigate: (view: string) => void }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const totalRequested = pitches.reduce((sum, p) => sum + Number(p.facility_amount || 0), 0);
  const totalFunded = pitches.reduce((sum, p) => sum + Number(p.funded_amount || 0), 0);
  const overallProgress = totalRequested > 0 ? (totalFunded / totalRequested) * 100 : 0;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="mb-8">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 tracking-tight">
        {greeting}, <span className="text-[#1B6FA5]">{companyName || 'Partner'}</span>
      </h1>

      <div className="bg-gradient-to-br from-slate-900 via-[#124b70] to-[#1B6FA5] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#1B6FA5]/20 relative overflow-hidden group transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-[#21B0A6] text-[10px] font-bold uppercase tracking-widest mb-2">
              <Wallet className="w-3.5 h-3.5" /> Total Active Requests
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              {pitches.length > 0 ? formatCurrency(totalRequested) : '$0'}
            </h2>
          </div>
          
          <button 
            onClick={() => onNavigate('pitch')}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#21B0A6] text-white text-sm font-bold rounded-xl hover:bg-[#1B6FA5] transition-all shadow-lg shadow-[#21B0A6]/20 flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
          >
            Create New Pitch <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-[#21B0A6] uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Active Pitches</p>
            <p className="text-2xl font-bold text-white tracking-tight">{pitches.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#21B0A6] uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Data Room Views</p>
            <p className="text-2xl font-bold text-white tracking-tight">{pitches.length > 0 ? '12' : '0'}</p>
          </div>
          <div className="col-span-2 hidden md:block">
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-[10px] font-bold text-[#21B0A6] uppercase tracking-widest">Syndication Progress</p>
              <span className="text-xs font-bold text-white">{Math.floor(overallProgress)}% Funded</span>
            </div>
            <div className="bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-[#21B0A6] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(33,176,166,0.6)]" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivePitchesFeed = ({ pitches, onNavigate }: { pitches: any[], onNavigate: (view: string, id?: string) => void }) => {
  if (pitches.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Capital Requests</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">You haven't submitted any pitches to the underwriting team yet. Click "Create New Pitch" above to get started.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 pl-2">
        <Building2 className="w-4 h-4 text-[#1B6FA5]" /> Your Live & Pending Requests
      </h2>
      
      {pitches.map((pitch) => {
        const fundingPercentage = pitch.facility_amount > 0 ? (pitch.funded_amount / pitch.facility_amount) * 100 : 0;
        
        return (
          // ADDED: onClick handler, cursor-pointer, and group hover states
          <div 
            key={pitch.id} 
            onClick={() => onNavigate('pitch_detail', pitch.id)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#21B0A6]/50 hover:shadow-md transition-all cursor-pointer group"
          >
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1B6FA5] transition-colors">{formatCurrency(pitch.facility_amount)} Facility</h3>
                
                {pitch.status === 'pending_review' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-200">
                    <Clock className="w-3 h-3" /> Under Review
                  </span>
                )}
                {pitch.status === 'active' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Live in Market
                  </span>
                )}
                {pitch.status === 'draft' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200">
                    Draft
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                <span>{pitch.term_length_months} Months Term</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{pitch.yield_rate}% Proposed Yield</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>Submitted {new Date(pitch.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="w-full md:w-64 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Funded</span>
                <span className={fundingPercentage > 0 ? "text-[#1B6FA5]" : "text-slate-400"}>
                  {formatCurrency(pitch.funded_amount)} <span className="text-[10px] text-slate-400">({Math.floor(fundingPercentage)}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-[#1B6FA5] h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div>
              </div>
            </div>

            {/* ADDED: Visual indicator that this card is clickable */}
            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#1B6FA5]/10 group-hover:text-[#1B6FA5] transition-colors shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>

          </div>
        );
      })}
    </div>
  );
};

// --- MAIN CONTROLLER ---

export const BorrowerOverview: React.FC<OverviewProps> = ({ userData, onNavigate }) => {
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPitches = async () => {
      if (!userData?.id) return;
      try {
        const { data, error } = await supabase
          .from('loan_postings')
          .select('*')
          .eq('borrower_id', userData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPitches(data || []);
      } catch (err) {
        console.error("Error fetching pitches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, [userData?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
      <OverviewHero 
        companyName={userData?.company_name} 
        pitches={pitches}
        onNavigate={onNavigate} 
      />
      
      {/* Passed onNavigate down to the feed */}
      <ActivePitchesFeed pitches={pitches} onNavigate={onNavigate} />

      {pitches.length > 0 && (
        <div className="pt-4 opacity-50 grayscale pointer-events-none">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 pl-2">
            <Eye className="w-4 h-4" /> Incoming Term Sheets & Interest (Coming Soon)
          </h2>
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-slate-400">Lender interaction feeds will appear here once your pitch goes live.</p>
          </div>
        </div>
      )}
    </div>
  );
};