import React from 'react';
import { Camera } from 'lucide-react';

export const OverviewTab: React.FC<{ deal: any, images: string[], openLightbox: (idx: number) => void }> = ({ deal, images, openLightbox }) => {
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ... keep the image grid exactly the same ... */}

      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">Executive Summary</h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          <strong className="text-slate-900">{deal.profiles?.company_name || 'This company'}</strong> is seeking a <strong className="text-slate-900">{formatCurrency(deal.facility_amount)}</strong> secured debt facility. 
        </p>
        <p className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
          {deal.business_description || 'No business description provided.'}
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">Financial Highlights (Target)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
          <div><p className="text-xs text-slate-500 mb-1">Target Yield</p><p className="font-semibold text-emerald-600 text-lg">{deal.yield_rate || 0}%</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Term Length</p><p className="font-semibold text-slate-900 text-lg">{deal.term_length_months || 0} Months</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Facility Size</p><p className="font-semibold text-slate-900 text-lg">{formatCurrency(deal.facility_amount)}</p></div>
          
          {/* These require new columns in your Supabase table. Left dynamic with fallbacks. */}
          <div><p className="text-xs text-slate-500 mb-1">Annual Revenue</p><p className="font-semibold text-slate-900 text-lg">{deal.annual_revenue ? formatCurrency(deal.annual_revenue) : 'TBD'}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Est. LTV</p><p className="font-semibold text-slate-900 text-lg">{deal.ltv_percentage ? `${deal.ltv_percentage}%` : 'TBD'}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Debt/Equity</p><p className="font-semibold text-slate-900 text-lg">{deal.debt_to_equity || 'TBD'}</p></div>
        </div>
      </section>
    </div>
  );
}