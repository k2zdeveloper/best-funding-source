import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Building2, TrendingUp, Clock, ShieldCheck, ArrowLeft, 
  CheckCircle2, MapPin, Calendar, Users, Lock, Loader2 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// --- STRICT CODE SPLITTING ---
const DealExecutionPanel = lazy(() => import('./deal-tabs/DealExecutionPanel').then(m => ({ default: m.DealExecutionPanel })));
const OverviewTab = lazy(() => import('./deal-tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));

interface LenderDealDetailProps {
  deal: any;
  userData: any; 
  onBack: () => void;
}

type TabState = 'overview' | 'diligence' | 'discussion';

export const LenderDealDetail: React.FC<LenderDealDetailProps> = ({ deal, userData, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [downloadedDocs, setDownloadedDocs] = useState<string[]>([]);
  
  const businessImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565610222536-f1c699564f0b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
  ];

  // DYNAMIC STATUS CHECK (Security Failsafe)
  useEffect(() => {
    const fetchLiveStatus = async () => {
      if (!userData?.id) {
        setCheckingStatus(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', userData.id)
          .single();
          
        if (error) throw error;
        setIsVerified(data?.is_verified || false);
      } catch (err) {
        setIsVerified(userData?.is_verified === true);
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchLiveStatus();
  }, [userData?.id]);

  const handleDownload = (docId: string) => {
    if (downloadedDocs.includes(docId)) return; 
    setDownloadingDoc(docId);
    setTimeout(() => {
      setDownloadingDoc(null);
      setDownloadedDocs(prev => [...prev, docId]);
    }, 1500);
  };

  if (!deal) return null;

  // --- LOADING STATE ---
  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Securing data room...</p>
      </div>
    );
  }

  // --- ZERO-TRUST FAILSAFE BLOCK ---
  if (!isVerified) {
    return (
      <div className="animate-in fade-in duration-500 pb-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
        </button>
        <div className="max-w-xl mx-auto mt-10 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Deal Room Restricted</h2>
          <p className="text-sm text-slate-500 mb-6">
            You are attempting to access a secured data room. Your institutional status must be fully verified by our compliance team before accessing proprietary deal information and diligence materials.
          </p>
          <button 
            onClick={onBack}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-md"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD DEAL ROOM UI ---
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{deal.name || deal.profiles?.company_name || 'Confidential Listing'}</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {deal.sector || 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> California, USA</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Est. 2018</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Underwriting Approved</span>
          </div>
          <button className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 mt-1">
            <Users className="w-3.5 h-3.5" /> Schedule Management Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Facility Size</p>
          <p className="text-2xl font-semibold text-slate-900">{deal.target || `$${deal.facility_amount?.toLocaleString()}`}</p>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Yield</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-2xl font-semibold text-emerald-600">{deal.yield || `${deal.yield_rate}%`}</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Term Length</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <p className="text-2xl font-semibold text-slate-900">{deal.term || `${deal.term_length_months} mo`}</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Risk Rating</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            <p className="text-2xl font-semibold text-slate-900">A- <span className="text-sm text-slate-400 font-medium">(Low)</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex gap-6 border-b border-slate-200 mb-6">
            <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-900'}`}>Overview</button>
            <button onClick={() => setActiveTab('diligence')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'diligence' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-900'}`}>Due Diligence</button>
            <button onClick={() => setActiveTab('discussion')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'discussion' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-900'}`}>Discussion & Memos</button>
          </div>

          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>}>
            {activeTab === 'overview' && <OverviewTab deal={deal} images={businessImages} openLightbox={() => {}} />}
          </Suspense>
        </div>

        <div className="lg:col-span-5">
          <Suspense fallback={<div className="h-96 bg-slate-50 rounded-3xl animate-pulse"></div>}>
            <DealExecutionPanel 
              deal={deal} 
              downloadedDocs={downloadedDocs} 
              downloadingDoc={downloadingDoc} 
              onDownload={handleDownload} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};