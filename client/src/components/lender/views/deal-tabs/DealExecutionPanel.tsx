import React from 'react';
import { ChevronRight, Lock, Info, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';

interface DealExecutionPanelProps {
  deal: any;
  downloadedDocs: string[];
  downloadingDoc: string | null;
  onDownload: (docId: string) => void;
}

export const DealExecutionPanel: React.FC<DealExecutionPanelProps> = ({ deal, downloadedDocs, downloadingDoc, onDownload }) => {
  const documents = [
    { id: 'financials', title: 'Financials (TTM)', meta: 'PDF • 2.4 MB', color: 'blue' },
    { id: 'captable', title: 'Cap Table Overview', meta: 'XLSX • 1.1 MB', color: 'emerald' },
    { id: 'ucc1', title: 'UCC-1 Filings', meta: 'PDF • 850 KB', color: 'purple' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-md sticky top-24 overflow-hidden">
      {/* Execution Actions */}
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Execution Panel</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
            14 Days Left
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Facility Funded</span>
            <span className="text-blue-600">{deal.funded}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${deal.funded}%` }}></div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2">
            Commit Capital <ChevronRight className="w-4 h-4" />
          </button>
          <button className="w-full py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Save to Watchlist
          </button>
        </div>
      </div>

      {/* Secure Data Room */}
      <div className="p-6 sm:p-8 bg-white">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-600" /> Secure Data Room
          </h3>
        </div>
        
        <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
            Downloading files signals active intent. <strong className="text-blue-700">The borrower will be notified</strong> of your review.
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          {documents.map((doc) => (
            <button 
              key={doc.id}
              onClick={() => onDownload(doc.id)}
              className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all group ${downloadedDocs.includes(doc.id) ? 'bg-slate-50 border-slate-200 cursor-default' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${downloadedDocs.includes(doc.id) ? 'bg-slate-200' : `bg-${doc.color}-50 text-${doc.color}-600`}`}><FileText className="w-4 h-4" /></div>
                <div className="text-left">
                  <span className={`block text-xs font-bold ${downloadedDocs.includes(doc.id) ? 'text-slate-500' : 'text-slate-900'}`}>{doc.title}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{doc.meta}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                {downloadingDoc === doc.id ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> : downloadedDocs.includes(doc.id) ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />}
              </div>
            </button>
          ))}
        </div>

        <button className="w-full py-2.5 bg-slate-50 border border-dashed border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
          + Request Additional Document
        </button>
      </div>
    </div>
  );
};