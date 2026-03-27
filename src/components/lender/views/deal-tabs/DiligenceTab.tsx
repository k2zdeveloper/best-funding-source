import React from 'react';
import { PieChart, AlertTriangle, ShieldCheck, Target, Users, CheckCircle2 } from 'lucide-react';

interface DiligenceTabProps {
  deal: any;
}

export const DiligenceTab: React.FC<DiligenceTabProps> = ({ deal }) => {
  
  // Utility for currency formatting
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  // Safely parse JSONB data with fallbacks
  const useOfFunds = deal?.use_of_funds_breakdown?.length > 0 
    ? deal.use_of_funds_breakdown 
    : [{ category: 'General Working Capital', amount: deal?.facility_amount || 0, percentage: 100, color: 'blue' }];

  const mitigants = deal?.key_mitigants?.length > 0 
    ? deal.key_mitigants 
    : [{ title: 'Standard Review', description: 'Underwriting is currently pending standard risk assessment.', icon: 'shield' }];

  const capTable = deal?.cap_table || { founders: 100, investors: 0 };

  // Helper to render icons based on text
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'target': return <Target className={className} />;
      case 'shield': return <ShieldCheck className={className} />;
      default: return <CheckCircle2 className={className} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- USE OF FUNDS --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <PieChart className="w-4 h-4 text-blue-600" /> Use of Funds Breakdown
        </h3>
        
        <div className="space-y-5">
          {useOfFunds.map((fund: any, idx: number) => (
            <div key={idx}>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                <span>{fund.category}</span>
                <span className="text-slate-900">
                  {formatCurrency(fund.amount)} <span className="text-slate-400 font-normal ml-1">({fund.percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${fund.color === 'emerald' ? 'bg-emerald-500' : fund.color === 'amber' ? 'bg-amber-400' : 'bg-blue-600'}`} 
                  style={{ width: `${fund.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- RISK MITIGANTS --- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Risk Mitigants
        </h3>
        
        <div className="space-y-3">
          {mitigants.map((mitigant: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {renderIcon(mitigant.icon, "w-5 h-5 text-emerald-600 shrink-0 mt-0.5")}
              <div>
                <p className="text-sm font-bold text-slate-900">{mitigant.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {mitigant.description}
                </p>
              </div>
            </div>
          ))}
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
            <p className="text-2xl font-light text-slate-900">{capTable.founders || 0}%</p>
          </div>
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 mb-1">External Investors</p>
            <p className="text-2xl font-light text-slate-900">{capTable.investors || 0}%</p>
          </div>
        </div>
      </section>

    </div>
  );
};