import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerificationBanner: React.FC = () => {
  const { isVerified, role } = useAuth();

  // If they are verified, show a super minimal, reassuring success state.
  if (isVerified) {
    return (
      <div className="mb-8 flex items-center gap-2.5 px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl animate-in fade-in">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">
          Account Verified. You have full access to all platform features.
        </p>
      </div>
    );
  }

  // Unverified State - Modern, urgent, but clean and professional.
  return (
    <div className="mb-8 bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2">
      {/* Subtle accent line on the left edge */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
      
      <div className="flex flex-col sm:flex-row gap-5 justify-between sm:items-center ml-2">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Action Required: Identity Verification
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              {role === 'borrower' 
                ? "To protect our network, please verify your business identity before requesting capital or accepting term sheets."
                : "To comply with financial regulations, please complete your institutional verification before funding loans."}
            </p>
          </div>
        </div>

        {/* High-conversion, dark mode button to draw the eye */}
        <button className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/10 w-full sm:w-auto">
          Verify Identity <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};