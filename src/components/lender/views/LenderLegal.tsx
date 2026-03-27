import React from 'react';

export const LenderLegal: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-8">Legal & Privacy</h1>
      
      {/* Strictly Editorial layout for long form text */}
      <div className="prose prose-slate prose-sm max-w-none">
        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2 border-b border-slate-200 pb-2">Terms of Service</h3>
        <p className="text-slate-600 mb-6 leading-relaxed text-sm">
          Last updated: March 17, 2026. By accessing the EnterpriseFunding platform as an institutional partner or accredited investor, you agree to be bound by these Terms of Service. All capital deployments are subject to strict underwriting guidelines, but principal loss is possible. You agree to hold the platform harmless from market fluctuations and borrower defaults.
        </p>

        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2 border-b border-slate-200 pb-2">Privacy Policy</h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          We collect and process your corporate data, tax identification numbers, and operating account metrics strictly for the purposes of Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance. Your data is encrypted using AES-256 standards and is never sold to third-party marketers.
        </p>
      </div>
    </div>
  );
};