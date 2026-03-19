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
}> = ({ formData, updateField, handleAmountChange, handleYieldChange, onNext }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
      <PieChart className="w-4 h-4 text-blue-600" /> Capital Requirements
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
            className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 text-lg font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
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
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
          />
          <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Desired Term Length</label>
        <select 
          value={formData.termLength} 
          onChange={(e) => updateField('termLength', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
        >
          {[6, 12, 18, 24, 36, 48, 60].map(months => (
            <option key={months} value={months}>{months} Months</option>
          ))}
        </select>
      </div>
    </div>
    
    <div className="pt-4 flex justify-end">
      <button onClick={onNext} className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
        Continue to Summary <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const Step2Narrative: React.FC<StepProps & { onNext: () => void; onBack: () => void; }> = ({ formData, updateField, onNext, onBack }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
      <FileText className="w-4 h-4 text-blue-600" /> Executive Narrative
    </h3>
    
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Business Description</label>
        <textarea 
          value={formData.businessDescription} 
          onChange={(e) => updateField('businessDescription', e.target.value)}
          rows={4} 
          placeholder="Describe your business model, target market, and historical performance..." 
          className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Use of Funds</label>
        <textarea 
          value={formData.useOfFunds} 
          onChange={(e) => updateField('useOfFunds', e.target.value)}
          rows={4} 
          placeholder="Exactly how will this capital be deployed to generate a return?" 
          className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
        />
      </div>
    </div>

    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
      <button onClick={onBack} className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-900 py-2">Back</button>
      <button onClick={onNext} className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
        Continue to Media <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const Step3Media: React.FC<{ isSubmitting: boolean; onSubmit: () => void; onBack: () => void; }> = ({ isSubmitting, onSubmit, onBack }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
      <Camera className="w-4 h-4 text-blue-600" /> Asset & Facility Gallery
    </h3>
    
    <p className="text-xs text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
      <strong className="text-blue-700">Pro Tip:</strong> Lenders are 3x more likely to fund profiles with high-quality facility imagery or product decks.
    </p>
    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((slot) => (
        <div key={slot} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
          <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600">Upload Image</span>
        </div>
      ))}
    </div>

    <div className="pt-8 mt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
      <button onClick={onBack} disabled={isSubmitting} className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-900 py-2 disabled:opacity-50">Back</button>
      <button onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
        {isSubmitting ? 'Submitting to Underwriting...' : 'Publish Pitch'}
      </button>
    </div>
  </div>
);