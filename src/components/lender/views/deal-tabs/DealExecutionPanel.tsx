import React, { useState, useEffect } from 'react';
import { Lock, FileText, Download, Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
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

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!currentUserId || !deal?.id) return;
      const { data } = await supabase.from('saved_deals').select('id').eq('lender_id', currentUserId).eq('loan_id', deal.id).maybeSingle();
      if (data) setIsSaved(true);
    };
    checkSavedStatus();
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
  
  const documents = deal?.documents?.length > 0 ? deal.documents : [
    { id: 'pending-1', title: 'Financials (TTM)', meta: 'Awaiting Upload', color: 'blue', file_path: null },
    { id: 'pending-2', title: 'Cap Table Overview', meta: 'Awaiting Upload', color: 'emerald', file_path: null },
    { id: 'pending-3', title: 'UCC-1 Filings', meta: 'Awaiting Upload', color: 'purple', file_path: null },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-md sticky top-24 overflow-hidden">
      
      {/* Tracking Overview */}
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Deal Status</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-[#1B6FA5] bg-[#1B6FA5]/10">
            Active Listing
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Facility Funded</span>
            <span className="text-[#1B6FA5]">{Math.floor(fundingPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#21B0A6] h-2.5 rounded-full" style={{ width: `${fundingPercentage}%` }}></div>
          </div>
        </div>

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
        
        <div className="space-y-2">
          {documents.map((doc: any) => (
            <button 
              key={doc.id}
              onClick={() => doc.file_path ? onDownload(doc.id, doc.file_path) : null}
              disabled={!doc.file_path}
              className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all group ${!doc.file_path ? 'bg-slate-50 opacity-70 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-[#1B6FA5]/50 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-100 text-slate-600`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-900">{doc.title}</span>
                  <span className="block text-[10px] text-slate-400">{doc.meta}</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-[#1B6FA5] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};