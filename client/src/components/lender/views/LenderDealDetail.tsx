import React, { useState, Suspense, lazy } from 'react';
import { Building2, TrendingUp, Clock, ShieldCheck, ArrowLeft, CheckCircle2, MapPin, Calendar, Users } from 'lucide-react';

// --- STRICT CODE SPLITTING ---
// These chunks are only fetched from the server when requested
const DealExecutionPanel = lazy(() => import('./deal-tabs/DealExecutionPanel').then(m => ({ default: m.DealExecutionPanel })));
const OverviewTab = lazy(() => import('./deal-tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));

// You can create these files using the same pattern as OverviewTab
// const DiligenceTab = lazy(() => import('./deal-tabs/DiligenceTab').then(m => ({ default: m.DiligenceTab })));
// const DiscussionTab = lazy(() => import('./deal-tabs/DiscussionTab').then(m => ({ default: m.DiscussionTab })));
// const ImageLightbox = lazy(() => import('../../shared/ImageLightbox').then(m => ({ default: m.ImageLightbox })));

interface LenderDealDetailProps {
  deal: any;
  onBack: () => void;
}

type TabState = 'overview' | 'diligence' | 'discussion';

export const LenderDealDetail: React.FC<LenderDealDetailProps> = ({ deal, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  
  // Lifted state for the execution panel
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [downloadedDocs, setDownloadedDocs] = useState<string[]>([]);
  
  const businessImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565610222536-f1c699564f0b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
  ];

  const handleDownload = (docId: string) => {
    if (downloadedDocs.includes(docId)) return; 
    setDownloadingDoc(docId);
    setTimeout(() => {
      setDownloadingDoc(null);
      setDownloadedDocs(prev => [...prev, docId]);
    }, 1500);
  };

  if (!deal) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* --- PAGE HEADER --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{deal.name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{deal.sector}</span>
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
          <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1">
            <Users className="w-3.5 h-3.5" /> Schedule Management Call
          </button>
        </div>
      </div>

      {/* --- PREMIUM METRICS BAR --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Facility Size</p>
          <p className="text-2xl font-semibold text-slate-900">{deal.target}</p>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Yield</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-2xl font-semibold text-emerald-600">{deal.yield}</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Term Length</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <p className="text-2xl font-semibold text-slate-900">{deal.term}</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-blue-300 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Risk Rating</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <p className="text-2xl font-semibold text-slate-900">A- <span className="text-sm text-slate-400 font-medium">(Low)</span></p>
          </div>
        </div>
      </div>

      {/* --- DETAILED BREAKDOWN (2 Columns) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Deep Analysis */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TABS NAVIGATION */}
          <div className="flex gap-6 border-b border-slate-200 mb-6">
            <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>Overview</button>
            <button onClick={() => setActiveTab('diligence')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'diligence' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>Due Diligence</button>
            <button onClick={() => setActiveTab('discussion')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'discussion' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>Discussion & Memos</button>
          </div>

          {/* DYNAMIC TAB RENDERING */}
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            {activeTab === 'overview' && <OverviewTab deal={deal} images={businessImages} openLightbox={() => {}} />}
            {/* {activeTab === 'diligence' && <DiligenceTab deal={deal} />} */}
            {/* {activeTab === 'discussion' && <DiscussionTab deal={deal} />} */}
          </Suspense>
        </div>

        {/* RIGHT COLUMN: Execution Panel */}
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