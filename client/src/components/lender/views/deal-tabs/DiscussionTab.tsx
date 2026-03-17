import React, { useState } from 'react';
import { PenTool, MessageCircle, Loader2 } from 'lucide-react';

interface DiscussionTabProps {
  deal: any;
}

export const DiscussionTab: React.FC<DiscussionTabProps> = ({ deal }) => {
  // Local state scoped strictly to this tab
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [memoSaved, setMemoSaved] = useState(false);

  const handleSaveMemo = () => {
    if (!memo.trim()) return;
    
    setIsSaving(true);
    // Simulate database save
    setTimeout(() => {
      setIsSaving(false);
      setMemoSaved(true);
      setTimeout(() => setMemoSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- PRIVATE FIRM MEMO --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <PenTool className="w-4 h-4 text-blue-600" /> Private Investment Memo
          </h3>
          <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
            Firm Only
          </span>
        </div>
        
        <textarea 
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Enter internal notes, committee questions, or underwriting thoughts here. This is never shared with the borrower..."
          className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-shadow resize-none mb-4"
        />
        
        <div className="flex justify-end items-center gap-4">
          {memoSaved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">
              Successfully saved to deal file!
            </span>
          )}
          <button 
            onClick={handleSaveMemo} 
            disabled={isSaving || !memo.trim()}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Notes'}
          </button>
        </div>
      </section>

      {/* --- Q&A WITH MANAGEMENT --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageCircle className="w-4 h-4 text-emerald-600" /> Q&A with Management
        </h3>
        
        {/* Empty State Design */}
        <div className="py-10 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-700">No questions asked yet.</p>
          <p className="text-xs text-slate-500 mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
            Directly message the borrower's executive team regarding financials, operations, or projections.
          </p>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            Start New Thread
          </button>
        </div>
      </section>

    </div>
  );
};