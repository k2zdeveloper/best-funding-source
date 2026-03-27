import React, { useState } from 'react';
import { X, Building2, Loader2, CheckCircle2, TrendingUp, Settings2 } from 'lucide-react';

export type LenderModalType = 'deposit' | 'auto-invest' | 'deal-details' | null;

interface LenderModalProps {
  type: LenderModalType;
  onClose: () => void;
}

export const LenderModal: React.FC<LenderModalProps> = ({ type, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!type) return null;

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(onClose, 2000);
    }, 1500);
  };

  const renderContent = () => {
    if (isSuccess) {
      return (
        <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Success!</h3>
          <p className="text-sm text-slate-500">Your preferences have been securely updated.</p>
        </div>
      );
    }

    switch (type) {
      case 'deposit':
        return (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Transfer Capital</h3>
            <p className="text-sm text-slate-500 mb-6">Move funds from your connected institution to your deployment wallet.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deposit Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="100,000" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
            </div>

            <button onClick={handleAction} disabled={isProcessing} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Initiate Transfer'}
            </button>
          </>
        );

      case 'auto-invest':
        return (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Auto-Invest Rules</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Configure AI-driven deployment to automatically fund deals matching your risk profile.</p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex justify-between items-center cursor-pointer">
                  <span className="text-sm font-bold text-slate-700">Target Yield (Min)</span>
                  <select className="bg-white border border-slate-200 rounded-lg text-sm p-1">
                    <option>8.0%</option>
                    <option>10.0%</option>
                    <option>12.0%</option>
                  </select>
                </label>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex justify-between items-center cursor-pointer">
                  <span className="text-sm font-bold text-slate-700">Max Allocation per Deal</span>
                  <select className="bg-white border border-slate-200 rounded-lg text-sm p-1">
                    <option>$50,000</option>
                    <option>$100,000</option>
                    <option>$250,000</option>
                  </select>
                </label>
              </div>
            </div>

            <button onClick={handleAction} disabled={isProcessing} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Algorithm'}
            </button>
          </>
        );
        
      default:
        return (
          <div className="py-8 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Deal Room Processing</h3>
            <p className="text-sm text-slate-500 mt-2">Loading secure data room...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={!isProcessing ? onClose : undefined}></div>
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <button onClick={onClose} disabled={isProcessing} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};