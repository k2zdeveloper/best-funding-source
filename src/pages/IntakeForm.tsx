import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, DollarSign, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useIntakeForm } from '../hooks/useIntakeForm';
import { DocumentUploadRow } from '../components/intake/DocumentUploadRow';

export const IntakeForm: React.FC = () => {
  const {
    step,
    isSubmitting,
    submitStatus,
    errorMessage,
    animateDirection,
    formData,
    docs,
    uploadErrors,
    handleTextChange,
    handleDocSelect,
    removeDoc,
    nextStep,
    prevStep,
    submitForm
  } = useIntakeForm();

  // --- SUCCESS STATE ---
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-md w-full mx-auto p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-slate-100 text-center transform transition-all duration-700 ease-out opacity-100 translate-y-0">
          {/* Changed to brand Teal */}
          <CheckCircle className="w-16 h-16 text-[#21B0A6] mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-[#0A2235] mb-3">Transmission Secured</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">Enterprise financial data and documents have been encrypted and routed directly to underwriting. Expect correspondence within 24 hours.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6FA5] border-b-2 border-[#1B6FA5] pb-1 hover:text-[#21B0A6] hover:border-[#21B0A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-4 rounded-sm">
            Return to Homepage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  const animationClass = animateDirection === 'forward' 
    ? 'animate-[slideInRight_0.4s_ease-out_forwards]' 
    : 'animate-[slideInLeft_0.4s_ease-out_forwards]';

  const totalSteps = 4;

  return (
    // ADDED: pt-28 md:pt-36 to clear the fixed navbar on all devices
    <div className="max-w-6xl mx-auto pt-28 md:pt-36 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 px-4 sm:px-6">
      
      {/* --- SIDEBAR / INFO --- */}
      <div className="lg:col-span-5 flex flex-col justify-start">
        <div className="lg:sticky lg:top-32">
          <div className="mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1B6FA5] mb-4 tracking-tight">Enterprise Vault</h2>
            <p className="text-slate-500 leading-relaxed font-light text-base md:text-lg">
              Submit your operational metrics via our encrypted pipeline. Our framework requires zero hard credit pulls and guarantees complete data sovereignty.
            </p>
          </div>
          
          {/* Adjusted image height for mobile (h-48) and desktop (md:h-64) */}
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-xl group border border-[#1B6FA5]/10">
            {/* FIXED: Replaced broken Unsplash link with a reliable corporate data/security image */}
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop" alt="Secure Server" className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
            
            {/* Gradient using brand Navy */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2235]/95 via-[#0A2235]/50 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#21B0A6]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#21B0A6]">Military-Grade Encryption</span>
              </div>
              <p className="text-sm font-light text-[#e2f1f8]">Documents are compartmentalized and stored in an isolated, private SOC-2 compliant server.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FORM AREA --- */}
      <div className="lg:col-span-7 flex flex-col justify-center min-h-[500px]">
        <div className="w-full max-w-xl mx-auto lg:mx-0">
          
          {/* PROGRESS BAR */}
          <div className="mb-10 md:mb-12">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#1B6FA5]">
                Phase 0{step} <span className="text-slate-300 mx-1">—</span> 0{totalSteps}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {step === 1 && "Corporate Identity"}
                {step === 2 && "Financial Metrics"}
                {step === 3 && "Structured Documentation"}
                {step === 4 && "Capital Deployment"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                // Using brand Teal for the progress bar
                className="h-full bg-[#21B0A6] transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <form onSubmit={step === totalSteps ? submitForm : nextStep} className={`${animationClass} min-h-[300px] flex flex-col justify-between`} key={step}>
              
              {/* --- STEP 1 --- */}
              {step === 1 && (
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* INPUT COMPONENT: Updated focus border and text colors to brand Teal */}
                    <div className="relative z-0 w-full group">
                      <input type="text" name="company_name" id="company_name" required value={formData.company_name} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <label htmlFor="company_name" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Legal Entity Name</label>
                    </div>
                    <div className="relative z-0 w-full group">
                      <input type="text" name="website" id="website" required value={formData.website} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <label htmlFor="website" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Corporate Website</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="relative z-0 w-full group">
                      <input type="email" name="contact_email" id="contact_email" required value={formData.contact_email} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <label htmlFor="contact_email" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Authorized Contact Email</label>
                    </div>
                    <div className="relative z-0 w-full group">
                      <input type="tel" name="phone_number" id="phone_number" required value={formData.phone_number} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <label htmlFor="phone_number" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Direct Phone Number</label>
                    </div>
                  </div>

                  <div className="relative z-0 w-full mb-6 group">
                    <input type="text" name="headquarters" id="headquarters" required value={formData.headquarters} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                    <label htmlFor="headquarters" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Headquarters Address</label>
                  </div>
                </div>
              )}

              {/* --- STEP 2 --- */}
              {step === 2 && (
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="relative z-0 w-full group">
                      <input type="number" name="annual_revenue" id="annual_revenue" required value={formData.annual_revenue} onChange={handleTextChange} className="block py-4 pl-6 pr-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <DollarSign className="absolute left-0 top-5 w-4 h-4 text-slate-400" />
                      <label htmlFor="annual_revenue" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 left-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Annual Revenue (TTM)</label>
                    </div>
                    <div className="relative z-0 w-full group">
                      <input type="number" name="requested_amount" id="requested_amount" required value={formData.requested_amount} onChange={handleTextChange} className="block py-4 pl-6 pr-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <DollarSign className="absolute left-0 top-5 w-4 h-4 text-slate-400" />
                      <label htmlFor="requested_amount" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 left-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Desired Facility</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="relative z-0 w-full group">
                      <input type="number" name="years_in_business" id="years_in_business" required value={formData.years_in_business} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors" placeholder=" " />
                      <label htmlFor="years_in_business" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Years Active</label>
                    </div>
                    <div className="relative z-0 w-full group pt-2">
                      <select name="industry" value={formData.industry} onChange={handleTextChange} className="block py-2 px-0 w-full text-base text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors cursor-pointer">
                        <option value="Logistics">Logistics & 3PL</option>
                        <option value="Industrial">Industrial Trade</option>
                        <option value="Retail">Retail Operation</option>
                        <option value="Other">Other Sector</option>
                      </select>
                      <label className="absolute text-xs font-medium text-[#21B0A6] -translate-y-6 top-4 left-0 -z-10">Primary Industry</label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 3 --- */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-serif font-bold text-[#1B6FA5] mb-2">Structured Document Verification</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      To expedite underwriting, please provide isolated files for each financial category. Formats supported: PDF, CSV, XLSX.
                    </p>
                  </div>
                  
                  <DocumentUploadRow 
                    docKey="pnl" 
                    title="Profit & Loss Statement (P&L)" 
                    description="Current Year-to-Date or Trailing 12 Months."
                    file={docs.pnl}
                    errorMsg={uploadErrors.pnl}
                    onSelect={handleDocSelect}
                    onRemove={removeDoc}
                    isRequired={true}
                  />

                  <DocumentUploadRow 
                    docKey="balance_sheet" 
                    title="Balance Sheet" 
                    description="Most recent quarter-end balance sheet."
                    file={docs.balance_sheet}
                    errorMsg={uploadErrors.balance_sheet}
                    onSelect={handleDocSelect}
                    onRemove={removeDoc}
                    isRequired={true}
                  />

                  <DocumentUploadRow 
                    docKey="ar_aging" 
                    title="A/R Aging Summary" 
                    description="Current Accounts Receivable aging report."
                    file={docs.ar_aging}
                    errorMsg={uploadErrors.ar_aging}
                    onSelect={handleDocSelect}
                    onRemove={removeDoc}
                    isRequired={true}
                  />
                  
                  {errorMessage && step === 3 && (
                    <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3 mt-4">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* --- STEP 4 --- */}
              {step === 4 && (
                <div className="space-y-8">
                  <div className="relative z-0 w-full mb-6 group">
                    <textarea name="use_of_funds" id="use_of_funds" rows={5} required value={formData.use_of_funds} onChange={handleTextChange} className="block py-4 px-0 w-full text-base md:text-lg text-slate-900 bg-transparent border-0 border-b border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#21B0A6] peer transition-colors resize-none" placeholder=" " />
                    <label htmlFor="use_of_funds" className="peer-focus:font-medium absolute text-slate-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#21B0A6] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Briefly describe the deployment of capital...</label>
                  </div>
                  {submitStatus === 'error' && (
                    <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* --- FORM CONTROLS --- */}
              <div className="mt-10 md:mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="text-slate-500 hover:text-[#1B6FA5] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 focus:outline-none" disabled={isSubmitting}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div></div>}

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  // Updated to Brand Teal and Brand Blue hover
                  className="group relative inline-flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 bg-[#21B0A6] text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all hover:bg-[#1B6FA5] hover:shadow-lg hover:shadow-[#1B6FA5]/20 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Encrypting...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">{step === totalSteps ? 'Finalize & Submit' : 'Proceed'}</span>
                      <ArrowRight className="w-3.5 h-3.5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};