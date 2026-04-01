import React, { useState, useEffect } from 'react';
import { Lock, FileText, Download, Loader2, Bookmark, BookmarkCheck, ShieldAlert } from 'lucide-react';
import { supabase } from '../../../../lib/supabase'; 

interface DealExecutionPanelProps {
  deal: any;
  downloadedDocs: string[];
  downloadingDoc: string | null;
  onDownload: (docId: string, filePath: string) => void;
  currentUserId: string; 
}

export const DealExecutionPanel: React.FC<DealExecutionPanelProps> = ({ 
  deal, 
  downloadedDocs = [], 
  downloadingDoc, 
  onDownload, 
  currentUserId 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); 
  
  // NEW: State to hold the documents fetched directly by this component
  const [liveDocuments, setLiveDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const fetchDealData = async () => {
      if (!deal?.id) return;

      // 1. Check Watchlist Status
      if (currentUserId) {
        const { data: savedData } = await supabase.from('saved_deals').select('id').eq('lender_id', currentUserId).eq('loan_id', deal.id).maybeSingle();
        if (savedData) setIsSaved(true);
      }

      // 2. FETCH DOCUMENTS DIRECTLY (Bypassing the parent component)
      try {
        const { data } = await supabase
          .from('loan_postings')
          .select('documents, media_urls')
          .eq('id', deal.id)
          .single();

        let sourceData = data?.documents || data?.media_urls || deal?.documents;
        let rawDocuments: any[] = [];

        // Parse through double-stringification
        let safetyCounter = 0;
        while (typeof sourceData === 'string' && safetyCounter < 3) {
          try { sourceData = JSON.parse(sourceData); } catch (e) { break; }
          safetyCounter++;
        }

        if (Array.isArray(sourceData)) {
          rawDocuments = sourceData;
        } else if (sourceData) {
          rawDocuments = [sourceData];
        }

        // Normalize data
        const normalized = rawDocuments.map((doc: any, index: number) => {
          if (typeof doc === 'object' && doc !== null && doc.file_path) return doc;
          if (typeof doc === 'string' && doc.trim() !== '') {
            const fileName = doc.split('/').pop() || `Document_${index + 1}`;
            return { id: `doc_${index}`, title: fileName, file_path: doc, meta: 'Verified Data Room File' };
          }
          return null;
        }).filter(Boolean);

        setLiveDocuments(normalized);
      } catch (err) {
        console.error("Error fetching live documents:", err);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDealData();
  }, [currentUserId, deal?.id]);

  const handleSaveToWatchlist = async () => {
    if (!currentUserId || isSaved) return;
    setIsSaving(true);
    try {
      await supabase.from('saved_deals').insert([{ lender_id: currentUserId, loan_id: deal.id }]);
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const facilityAmount = deal?.facility_amount || 0;
  const fundedAmount = deal?.funded_amount || 0;
  const fundingPercentage = facilityAmount > 0 ? Math.min((fundedAmount / facilityAmount) * 100, 100) : 0;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-md sticky top-24 overflow-hidden">
      
      {/* Tracking Overview */}
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Deal Status</h3>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${fundingPercentage >= 100 ? 'text-emerald-700 bg-emerald-100' : 'text-[#1B6FA5] bg-[#1B6FA5]/10'}`}>
            {fundingPercentage >= 100 ? 'Fully Committed' : 'Active Listing'}
          </span>
        </div>
        
        {/* PROGRESS BAR UI */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Committed Capital</span>
            <span className={fundingPercentage >= 100 ? "text-emerald-600" : "text-[#1B6FA5]"}>
              {Math.floor(fundingPercentage)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${fundingPercentage >= 100 ? 'bg-emerald-500' : 'bg-[#21B0A6]'}`} style={{ width: `${fundingPercentage}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
            <span>{formatCurrency(fundedAmount)}</span>
            <span>{formatCurrency(facilityAmount)}</span>
          </div>
        </div>

        {/* VISUAL SMART CONTRACT CONDITION */}
        {fundingPercentage < 100 ? (
          <div className="mb-6 p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2 shadow-sm">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Funding Locked:</strong> Capital commitment is disabled until a formal Term Sheet is mutually executed by both parties.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-800 leading-relaxed">
              <strong className="text-emerald-900">Conditions Met:</strong> Term Sheet legally executed. Capital is fully committed and awaiting final settlement.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={handleSaveToWatchlist}
            disabled={isSaving || isSaved}
            className={`w-full py-3 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border ${
              isSaved ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-default' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved to Watchlist' : 'Save to Watchlist'}
          </button>
        </div>
      </div>

      {/* Secure Data Room */}
      <div className="p-6 sm:p-8 bg-white">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Lock className="w-3.5 h-3.5 text-[#1B6FA5]" /> Secure Data Room
        </h3>
        <p className="text-xs text-slate-500 mb-4">Review required financials before issuing a formal Term Sheet.</p>
        
        {loadingDocs ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#1B6FA5]" />
          </div>
        ) : liveDocuments.length > 0 ? (
          <div className="space-y-2">
            {liveDocuments.map((doc: any) => (
              <button 
                key={doc.id}
                onClick={() => doc.file_path ? onDownload(doc.id, doc.file_path) : null}
                disabled={!doc.file_path || downloadingDoc === doc.id}
                className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all group ${!doc.file_path ? 'bg-slate-50 opacity-70 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-[#1B6FA5]/50 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <span className="block text-xs font-bold text-slate-900 truncate" title={doc.title}>
                      {doc.title}
                    </span>
                    <span className="block text-[10px] text-slate-400">{doc.meta}</span>
                  </div>
                </div>
                {downloadingDoc === doc.id ? (
                    <Loader2 className="w-4 h-4 text-[#1B6FA5] animate-spin shrink-0" />
                ) : (
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#1B6FA5] transition-colors shrink-0" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
            <p className="text-xs text-slate-500 italic">No verified documents available in the vault yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};