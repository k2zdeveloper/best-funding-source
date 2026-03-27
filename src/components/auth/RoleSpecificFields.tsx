import React from 'react';
import { Building2, DollarSign } from 'lucide-react';

interface RoleSpecificFieldsProps {
  state: any;
  setters: any;
}

export const RoleSpecificFields: React.FC<RoleSpecificFieldsProps> = ({ state, setters }) => {
  // Format numbers with commas (e.g., 1000000 -> 1,000,000)
  const handleCurrencyInput = (value: string, setter: (val: string) => void) => {
    const rawVal = value.replace(/\D/g, '');
    setter(rawVal ? parseInt(rawVal, 10).toLocaleString() : '');
  };

  return (
    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-500">
      
      {/* Universal Legal Entity Field */}
      <div className="relative">
        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input 
          type="text" required 
          value={state.companyName} 
          onChange={(e) => setters.setCompanyName(e.target.value)} 
          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
          placeholder="Legal Entity Name" 
          disabled={state.loading} 
        />
      </div>

      {/* Borrower Specifics */}
      {state.currentRole === 'borrower' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" required 
              value={state.revenue} 
              onChange={(e) => handleCurrencyInput(e.target.value, setters.setRevenue)} 
              className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
              placeholder="Annual Rev" 
              disabled={state.loading} 
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" required 
              value={state.loanAmount} 
              onChange={(e) => handleCurrencyInput(e.target.value, setters.setLoanAmount)} 
              className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
              placeholder="Target Loan" 
              disabled={state.loading} 
            />
          </div>
        </div>
      )}

      {/* Lender Specifics */}
      {state.currentRole === 'lender' && (
        <>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" required 
              value={state.aum} 
              onChange={(e) => handleCurrencyInput(e.target.value, setters.setAum)} 
              className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
              placeholder="Estimated AUM" 
              disabled={state.loading} 
            />
          </div>
          <div className="flex items-start gap-2 mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <input 
              type="checkbox" id="accredited" required 
              checked={state.accredited} 
              onChange={(e) => setters.setAccredited(e.target.checked)} 
              className="mt-1 cursor-pointer" 
              disabled={state.loading} 
            />
            <label htmlFor="accredited" className="text-[10px] font-bold text-slate-600 leading-tight cursor-pointer">
              I certify this entity is an Accredited Investor under SEC definitions.
            </label>
          </div>
        </>
      )}

      {/* Universal Terms Agreement */}
      <div className="flex items-start gap-2 mt-2 pt-2">
        <input 
          type="checkbox" id="terms" required 
          checked={state.agreeTerms} 
          onChange={(e) => setters.setAgreeTerms(e.target.checked)} 
          className="mt-0.5 cursor-pointer" 
          disabled={state.loading} 
        />
        <label htmlFor="terms" className="text-[10px] font-medium text-slate-500 leading-tight cursor-pointer hover:text-slate-800 transition-colors">
          I agree to the Enterprise Terms of Service and Privacy Policy.
        </label>
      </div>
    </div>
  );
};