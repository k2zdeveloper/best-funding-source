import React, { useState } from 'react';
import { Camera, PieChart, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const BorrowerPitchBuilder: React.FC<{ userData: any }> = ({ userData }) => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Capital Pitch Builder</h1>
        <p className="text-sm text-slate-500">Construct a compelling narrative to attract institutional capital.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveStep(1)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 1 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
          1. Facility Request
        </button>
        <button onClick={() => setActiveStep(2)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 2 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
          2. Executive Summary
        </button>
        <button onClick={() => setActiveStep(3)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 3 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
          3. Media & Assets
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {activeStep === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" /> Capital Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Target Facility Amount</label>
                <input type="text" placeholder="$1,500,000" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Desired Term Length</label>
                <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option>12 Months</option>
                  <option>24 Months</option>
                  <option>36 Months</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button onClick={() => setActiveStep(2)} className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2">
                Continue to Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Executive Narrative
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Business Description & Use of Funds</label>
              <textarea 
                rows={6} 
                placeholder="Describe your business model and exactly how this capital will be deployed to generate a return..." 
                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button onClick={() => setActiveStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-900">Back</button>
              <button onClick={() => setActiveStep(3)} className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2">
                Continue to Media <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" /> Asset & Facility Gallery
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">Lenders are 3x more likely to fund profiles with high-quality facility imagery.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Upload Slots */}
              {[1, 2, 3, 4, 5, 6].map((slot) => (
                <div key={slot} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors group">
                  <Camera className="w-6 h-6 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Photo {slot}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-between items-center border-t border-slate-100">
              <button onClick={() => setActiveStep(2)} className="text-sm font-bold text-slate-500 hover:text-slate-900">Back</button>
              <button className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Publish Pitch to Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};