import React, { useState, useEffect } from 'react';
import { 
  Camera, PieChart, FileText, ArrowRight, CheckCircle2, 
  ShieldAlert, AlertCircle, Loader2, DollarSign, Percent, Clock 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // Adjust this path if necessary

interface PitchBuilderProps {
  userData: any;
  onNavigate?: (view: string) => void;
}

export const BorrowerPitchBuilder: React.FC<PitchBuilderProps> = ({ userData, onNavigate }) => {
  // --- UI STATE ---
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // --- COMPLIANCE STATE ---
  const [verifStatus, setVerifStatus] = useState<'checking' | 'none' | 'pending' | 'rejected'>('checking');

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    facilityAmount: '',
    termLength: '12',
    yieldRate: '',
    businessDescription: '',
    useOfFunds: '',
    mediaFiles: [] as File[], 
  });

  // --- SECURE COMPLIANCE CHECK ---
  useEffect(() => {
    // If they are already verified, or data isn't loaded, skip the DB check
    if (!userData || userData.is_verified) {
      setVerifStatus('none');
      return;
    }

    const checkComplianceStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('borrower_verifications')
          .select('status')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setVerifStatus(data.status as 'pending' | 'rejected');
        } else {
          setVerifStatus('none');
        }
      } catch (err) {
        console.error("Error checking compliance status", err);
        setVerifStatus('none');
      }
    };

    checkComplianceStatus();
  }, [userData]);

  // --- INPUT FORMATTING ---
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Strip non-digits
    const formatted = rawValue ? parseInt(rawValue, 10).toLocaleString('en-US') : '';
    setFormData({ ...formData, facilityAmount: formatted });
  };

  const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow digits and period
    setFormData({ ...formData, yieldRate: rawValue });
  };

  // --- VALIDATION & PROGRESSION ---
  const nextStep = (step: number) => {
    setError(null);
    if (step === 2) {
      if (!formData.facilityAmount || !formData.yieldRate) {
        setError('Please enter a target amount and proposed yield to continue.');
        return;
      }
    }
    if (step === 3) {
      if (!formData.businessDescription || !formData.useOfFunds) {
        setError('Please provide a business description and intended use of funds.');
        return;
      }
    }
    setActiveStep(step);
  };

  // --- DATABASE SUBMISSION ---
  const handlePublish = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Clean data for database insertion
      const cleanAmount = parseInt(formData.facilityAmount.replace(/,/g, ''), 10);
      const cleanYield = parseFloat(formData.yieldRate);

      if (isNaN(cleanAmount) || cleanAmount <= 0) throw new Error("Invalid facility amount.");
      if (isNaN(cleanYield) || cleanYield <= 0 || cleanYield > 100) throw new Error("Invalid yield rate.");

      // 2. Insert into Supabase (status defaults to 'pending_review' at the DB level)
      const { error: dbError } = await supabase
        .from('loan_postings')
        .insert({
          borrower_id: userData.id,
          facility_amount: cleanAmount,
          term_length_months: parseInt(formData.termLength, 10),
          yield_rate: cleanYield,
          business_description: formData.businessDescription,
          use_of_funds: formData.useOfFunds,
          status: 'pending_review' 
        });

      if (dbError) throw dbError;

      // 3. Trigger Success UI
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred while submitting your pitch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // RENDER BLOCKS (GUARDS & UI)
  // ==========================================

  // --- 🚨 1. STRICT COMPLIANCE GUARDRAIL ---
  if (!userData?.is_verified) {
    
    // State A: Checking Database
    if (verifStatus === 'checking') {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[10px]">Securing Connection...</p>
        </div>
      );
    }

    // State B: Already Submitted, Pending Review
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
            <button 
              onClick={() => onNavigate && onNavigate('overview')} 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // State C: Not verified (None) OR Rejected
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
          <button 
            onClick={() => onNavigate && onNavigate('verification')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Start Verification Process
          </button>
        </div>
      </div>
    );
  }

  // --- ✅ 2. SUCCESS SCREEN ---
  if (success) {
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
            onClick={() => {
              setSuccess(false);
              setActiveStep(1);
              setFormData({ facilityAmount: '', termLength: '12', yieldRate: '', businessDescription: '', useOfFunds: '', mediaFiles: [] });
              if (onNavigate) onNavigate('overview');
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- 📝 3. MAIN PITCH BUILDER UI ---
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Capital Pitch Builder</h1>
        <p className="text-sm text-slate-500">Construct a compelling narrative to attract institutional capital.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Progress Steps Header */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveStep(1)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          1. Facility Request
        </button>
        <button onClick={() => nextStep(2)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 2 ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          2. Executive Summary
        </button>
        <button onClick={() => nextStep(3)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeStep === 3 ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          3. Media & Assets
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* STEP 1: FINANCIALS */}
        {activeStep === 1 && (
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
                    onChange={handleAmountChange}
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
                    onChange={handleYieldChange}
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
                  onChange={(e) => setFormData({...formData, termLength: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button onClick={() => nextStep(2)} className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                Continue to Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: NARRATIVE */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Executive Narrative
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Business Description</label>
                <textarea 
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                  rows={4} 
                  placeholder="Describe your business model, target market, and historical performance..." 
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Use of Funds</label>
                <textarea 
                  value={formData.useOfFunds}
                  onChange={(e) => setFormData({...formData, useOfFunds: e.target.value})}
                  rows={4} 
                  placeholder="Exactly how will this capital be deployed to generate a return?" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <button onClick={() => setActiveStep(1)} className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-900 py-2">Back</button>
              <button onClick={() => nextStep(3)} className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                Continue to Media <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA */}
        {activeStep === 3 && (
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
              <button 
                onClick={() => setActiveStep(2)} 
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-900 py-2 disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={handlePublish}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                {isSubmitting ? 'Submitting to Underwriting...' : 'Publish Pitch'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};