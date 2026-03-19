import React, { useState } from 'react';
import { X, UploadCloud, Landmark, FileCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export type ModalType = 'upload' | 'bank' | 'draw' | 'sign' | 'terms' | null;

interface DashboardModalProps {
  type: ModalType;
  onClose: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ type, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!type) return null;

  // Simulate an API call when a user takes action inside the modal
  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(onClose, 2000); // Auto-close after showing success
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
          <p className="text-sm text-slate-500">Your request has been securely processed.</p>
        </div>
      );
    }

    switch (type) {
      case 'upload':
        return (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Financial Documents</h3>
            <p className="text-sm text-slate-500 mb-6">Securely upload your recent bank statements or tax returns to expedite underwriting.</p>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Click to browse or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (Max 10MB)</p>
            </div>

            <button onClick={handleAction} disabled={isProcessing} className="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Upload'}
            </button>
          </>
        );

      case 'bank':
        return (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Operating Account</h3>
            <p className="text-sm text-slate-500 mb-6">Link your primary business bank account for instant cash-flow verification and faster funding.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 mb-6">
              <Landmark className="w-8 h-8 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-900">Secure connection via Plaid</p>
                <p className="text-xs text-slate-500">Your credentials are never stored on our servers.</p>
              </div>
            </div>

            <button onClick={handleAction} disabled={isProcessing} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue to Institution'}
            </button>
          </>
        );

      case 'draw':
        return (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Capital Draw</h3>
            <p className="text-sm text-slate-500 mb-6">Specify the amount you wish to draw from your available approved facility.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Draw Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="50,000" className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
            </div>

            <button onClick={handleAction} disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Draw Request'} <ArrowRight className="w-4 h-4" />
            </button>
          </>
        );
        
      default:
        return (
          <div className="py-8 text-center">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Feature in Development</h3>
            <p className="text-sm text-slate-500">This action will be available shortly.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      {/* Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={!isProcessing ? onClose : undefined}
      ></div>
      
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};