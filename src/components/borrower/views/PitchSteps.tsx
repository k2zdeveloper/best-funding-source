import React from 'react';
import { PieChart, FileText, Camera, ArrowRight, DollarSign, Percent, Loader2, CheckCircle2 } from 'lucide-react';
import type { PitchFormData } from './usePitchForm';

interface StepProps {
  formData: PitchFormData;
  updateField: (field: keyof PitchFormData, value: any) => void;
}

export const Step1Financials: React.FC<StepProps & { 
  handleAmountChange: (v: string) => void; 
  handleYieldChange: (v: string) => void;
  onNext: () => void; 
}> = ({ formData, updateField, handleAmountChange, handleYieldChange, onNext }) => {
  
  // --- LIVE CALCULATION ENGINE ---
  // Safely convert strings to numbers for math
  const principal = parseInt(formData.facilityAmount.replace(/,/g, '') || '0', 10);
  const yieldRate = parseFloat(formData.yieldRate || '0');
  const months = parseInt(formData.termLength.toString() || '0', 10);

  // Calculate simple interest: (Principal * Rate * Years)
  const years = months / 12;
  const totalInterest = principal * (yieldRate / 100) * years;
  const totalPayback = principal + totalInterest;
  const estimatedMonthly = totalPayback / (months || 1);

  // Formatters
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-[#1B6FA5]" /> Capital Requirements
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Target Facility Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={formData.facilityAmount} 
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1,500,000" 
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 text-lg font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Proposed Yield Rate</label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.yieldRate} 
              onChange={(e) => handleYieldChange(e.target.value)}
              placeholder="11.5" 
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all" 
            />
            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Desired Term Length</label>
          <select 
            value={formData.termLength} 
            onChange={(e) => updateField('termLength', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {[6, 12, 18, 24, 36, 48, 60].map(m => (
              <option key={m} value={m}>{m} Months</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* LIVE COST PREVIEW CARD */}
      {principal > 0 && yieldRate > 0 && (
        <div className="mt-6 bg-[#1B6FA5]/5 border border-[#1B6FA5]/20 rounded-2xl p-5 animate-in fade-in duration-500">
          <h4 className="text-xs font-bold text-[#1B6FA5] uppercase tracking-wider mb-3 flex items-center gap-2">
            Estimated Cost of Capital
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payback</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalPayback)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Monthly</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(estimatedMonthly)}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 italic">
            *This is an estimate based on simple interest. Final terms will be dictated by institutional underwriting and syndication.
          </p>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button onClick={onNext} className="w-full sm:w-auto px-6 py-3 bg-[#1B6FA5] text-white text-sm font-bold rounded-xl hover:bg-[#21B0A6] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-sm">
          Continue to Summary <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const Step2Narrative: React.FC<StepProps & { onNext: () => void; onBack: () => void; }> = ({ formData, updateField, onNext, onBack }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
      {/* Icon updated to Primary Blue */}
      <FileText className="w-4 h-4 text-[#1B6FA5]" /> Executive Narrative
    </h3>
    
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Business Description</label>
        <textarea 
          value={formData.businessDescription} 
          onChange={(e) => updateField('businessDescription', e.target.value)}
          rows={4} 
          placeholder="Describe your business model, target market, and historical performance..." 
          // Focus ring updated to Accent Teal
          className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all resize-none leading-relaxed"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Use of Funds</label>
        <textarea 
          value={formData.useOfFunds} 
          onChange={(e) => updateField('useOfFunds', e.target.value)}
          rows={4} 
          placeholder="Exactly how will this capital be deployed to generate a return?" 
          // Focus ring updated to Accent Teal
          className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all resize-none leading-relaxed"
        />
      </div>
    </div>

    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
      <button onClick={onBack} className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-[#1B6FA5] py-2 transition-colors">Back</button>
      {/* Intermediate next button using Primary Blue to Teal transition */}
      <button onClick={onNext} className="w-full sm:w-auto px-6 py-3 bg-[#1B6FA5] text-white text-sm font-bold rounded-xl hover:bg-[#21B0A6] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-sm">
        Continue to Media <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const Step3Media: React.FC<{ 
  formData: PitchFormData;
  updateField: (field: keyof PitchFormData, value: any) => void;
  isSubmitting: boolean; 
  onSubmit: () => void; 
  onBack: () => void; 
}> = ({ formData, updateField, isSubmitting, onSubmit, onBack }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
      <FileText className="w-4 h-4 text-[#1B6FA5]" /> Secure Data Room Uploads
    </h3>
    
    <p className="text-xs text-slate-600 mb-4 bg-[#1B6FA5]/5 p-3 rounded-lg border border-[#1B6FA5]/20">
      <strong className="text-[#1B6FA5]">Required Documents:</strong> Please upload your institutional-grade documents. These will be encrypted and stored in your secure data room.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Financials Upload */}
      <div className="relative">
        <input 
          type="file" 
          accept=".pdf,.xlsx"
          onChange={(e) => updateField('financialsFile', e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${formData.financialsFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-[#21B0A6] hover:bg-[#21B0A6]/5'}`}>
          {formData.financialsFile ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" /> : <FileText className="w-6 h-6 text-blue-500 mb-2" />}
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Financials (TTM)</span>
          <span className="text-[10px] text-slate-400 truncate w-full px-2">{formData.financialsFile ? formData.financialsFile.name : 'Click or Drag PDF'}</span>
        </div>
      </div>

      {/* Cap Table Upload */}
      <div className="relative">
        <input 
          type="file" 
          accept=".pdf,.xlsx"
          onChange={(e) => updateField('capTableFile', e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${formData.capTableFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-[#21B0A6] hover:bg-[#21B0A6]/5'}`}>
          {formData.capTableFile ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" /> : <FileText className="w-6 h-6 text-emerald-500 mb-2" />}
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cap Table</span>
          <span className="text-[10px] text-slate-400 truncate w-full px-2">{formData.capTableFile ? formData.capTableFile.name : 'Click or Drag PDF'}</span>
        </div>
      </div>

      {/* UCC-1 Upload */}
      <div className="relative">
        <input 
          type="file" 
          accept=".pdf"
          onChange={(e) => updateField('uccFile', e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${formData.uccFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-[#21B0A6] hover:bg-[#21B0A6]/5'}`}>
          {formData.uccFile ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" /> : <FileText className="w-6 h-6 text-purple-500 mb-2" />}
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">UCC-1 Filings</span>
          <span className="text-[10px] text-slate-400 truncate w-full px-2">{formData.uccFile ? formData.uccFile.name : 'Click or Drag PDF'}</span>
        </div>
      </div>

    </div>

    <div className="pt-8 mt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
      <button onClick={onBack} disabled={isSubmitting} className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-[#1B6FA5] py-2 disabled:opacity-50 transition-colors">Back</button>
      
      <button onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 bg-[#21B0A6] text-white text-sm font-bold rounded-xl hover:bg-[#1B6FA5] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
        {isSubmitting ? 'Uploading & Submitting...' : 'Submit to Underwriting'}
      </button>
    </div>
  </div>
);