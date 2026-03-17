import React from 'react';
import { Camera } from 'lucide-react';

export const OverviewTab: React.FC<{ deal: any, images: string[], openLightbox: (idx: number) => void }> = ({ deal, images, openLightbox }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <section className="bg-white border border-slate-200 rounded-3xl p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 h-64 rounded-2xl overflow-hidden">
        <div onClick={() => openLightbox(0)} className="sm:col-span-2 relative group cursor-pointer bg-slate-100 overflow-hidden">
          <img src={images[0]} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 relative">
          <div onClick={() => openLightbox(1)} className="flex-1 relative group cursor-pointer bg-slate-100 overflow-hidden rounded-tr-2xl">
            <img src={images[1]} alt="Asset 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div onClick={() => openLightbox(2)} className="flex-1 relative group cursor-pointer bg-slate-100 overflow-hidden rounded-br-2xl">
            <img src={images[2]} alt="Asset 3" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5"><Camera className="w-4 h-4" /> +4 Photos</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">Executive Summary</h3>
      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {deal.name} is seeking a {deal.target} secured debt facility to fund the acquisition of strategic operational assets. The company has a proven track record of profitability and is offering a first-lien position on the newly acquired equipment.
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">
        Debt Service Coverage Ratio (DSCR) currently sits at a healthy 1.45x, providing significant downside protection for institutional lenders.
      </p>
    </section>

    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3">Financial Highlights (TTM)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
        <div><p className="text-xs text-slate-500 mb-1">Annual Revenue</p><p className="font-semibold text-slate-900 text-lg">$8,250,000</p></div>
        <div><p className="text-xs text-slate-500 mb-1">EBITDA</p><p className="font-semibold text-slate-900 text-lg">$1,120,000</p></div>
        <div><p className="text-xs text-slate-500 mb-1">Current Debt</p><p className="font-semibold text-slate-900 text-lg">$850,000</p></div>
        <div><p className="text-xs text-slate-500 mb-1">Debt/Equity</p><p className="font-semibold text-slate-900 text-lg">0.8x</p></div>
        <div><p className="text-xs text-slate-500 mb-1">Est. LTV</p><p className="font-semibold text-slate-900 text-lg">65%</p></div>
        <div><p className="text-xs text-slate-500 mb-1">Net Margin</p><p className="font-semibold text-slate-900 text-lg">13.5%</p></div>
      </div>
    </section>
  </div>
);