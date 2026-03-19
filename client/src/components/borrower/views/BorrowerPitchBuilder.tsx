import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { useComplianceGuard } from '../hooks/useComplianceGuard';
import { usePitchForm } from './usePitchForm';
import { Step1Financials, Step2Narrative, Step3Media } from './PitchSteps';

interface PitchBuilderProps {
  userData: any;
  onNavigate?: (view: string) => void;
}

export const BorrowerPitchBuilder: React.FC<PitchBuilderProps> = ({ userData, onNavigate }) => {
  // 1. Core Logic Hooks
  const { status: verifStatus } = useComplianceGuard(userData);
  const pitchForm = usePitchForm(userData?.id);

  // ==========================================
  // RENDER GUARDS (Compliance checks)
  // ==========================================
  if (verifStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[10px]">Securing Connection...</p>
      </div>
    );
  }

  if (verifStatus === 'pending') {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-blue-50 p-4 rounded-full mb-6 relative">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verification Under Review</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            Your business compliance documents are currently being reviewed by our underwriting team. You will be able to post a capital request as soon as you are approved.
          </p>
          <button onClick={() => onNavigate?.('overview')} className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (verifStatus === 'none' || verifStatus === 'rejected') {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-red-50 p-4 rounded-full mb-6 relative">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            {verifStatus === 'rejected' ? 'Verification Rejected' : 'Verification Required'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            {verifStatus === 'rejected' 
              ? "Your previous verification attempt was unsuccessful. Please review your documents and try again to maintain a secure marketplace."
              : "To maintain a secure marketplace, all borrowers must complete our Know Your Business (KYB) compliance check before requesting capital."}
          </p>
          <button onClick={() => onNavigate?.('verification')} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            Start Verification Process
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI RENDER
  // ==========================================
  
  // SUCCESS SCREEN
  if (pitchForm.success) {
    return (
      <div className="animate-in zoom-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-emerald-50 p-4 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Pitch Submitted Successfully</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            Your capital request has been sent to our underwriting team. Once reviewed and approved, it will be published to the institutional marketplace.
          </p>
          <button 
            onClick={() => { pitchForm.resetForm(); onNavigate?.('overview'); }}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // PITCH BUILDER SCREEN
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Capital Pitch Builder</h1>
        <p className="text-sm text-slate-500">Construct a compelling narrative to attract institutional capital.</p>
      </div>

      {pitchForm.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{pitchForm.error}</p>
        </div>
      )}

      {/* Progress Steps Header */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {[
          { step: 1, label: '1. Facility Request' },
          { step: 2, label: '2. Executive Summary' },
          { step: 3, label: '3. Media & Assets' }
        ].map(({ step, label }) => (
          <button 
            key={step}
            onClick={() => pitchForm.goToStep(step)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              pitchForm.activeStep === step ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step Render Engine */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {pitchForm.activeStep === 1 && (
          <Step1Financials 
            formData={pitchForm.formData} 
            updateField={pitchForm.updateField}
            handleAmountChange={pitchForm.handleAmountChange}
            handleYieldChange={pitchForm.handleYieldChange}
            onNext={() => pitchForm.goToStep(2)} 
          />
        )}
        
        {pitchForm.activeStep === 2 && (
          <Step2Narrative 
            formData={pitchForm.formData} 
            updateField={pitchForm.updateField}
            onBack={() => pitchForm.goToStep(1)}
            onNext={() => pitchForm.goToStep(3)} 
          />
        )}
        
        {pitchForm.activeStep === 3 && (
          <Step3Media 
            isSubmitting={pitchForm.isSubmitting}
            onBack={() => pitchForm.goToStep(2)}
            onSubmit={pitchForm.submitPitch} 
          />
        )}
      </div>
    </div>
  );
};