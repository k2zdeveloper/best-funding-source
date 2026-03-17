import React from 'react';
import { PieChart, AlertTriangle, ShieldCheck, Target, Users } from 'lucide-react';

interface DiligenceTabProps {
  deal: any;
}

export const DiligenceTab: React.FC<DiligenceTabProps> = ({ deal }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- USE OF FUNDS --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <PieChart className="w-4 h-4 text-blue-600" /> Use of Funds Breakdown
        </h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
              <span>Equipment Acquisition</span>
              <span className="text-slate-900">$1,500,000 <span className="text-slate-400 font-normal ml-1">(60%)</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-[60%]"></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
              <span>Facility Expansion</span>
              <span className="text-slate-900">$750,000 <span className="text-slate-400 font-normal ml-1">(30%)</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full w-[30%]"></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
              <span>Working Capital</span>
              <span className="text-slate-900">$250,000 <span className="text-slate-400 font-normal ml-1">(10%)</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-400 h-2 rounded-full w-[10%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- RISK MITIGANTS --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Risk Mitigants
        </h3>
        
        <div className="space-y-3">
          <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">First-Lien Position</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The facility is secured by a first-priority lien on all newly acquired manufacturing assets, appraised at 120% of the loan value.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">Personal Guarantee</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Founders have signed unconditional personal guarantees covering 100% of the principal, backed by verified liquid assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CAP TABLE --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-purple-600" /> Ownership Structure
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 mb-1">Founders / Management</p>
            <p className="text-2xl font-light text-slate-900">75.0%</p>
          </div>
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 mb-1">Seed Investors</p>
            <p className="text-2xl font-light text-slate-900">25.0%</p>
          </div>
        </div>
      </section>

    </div>
  );
};