import React from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Building2, DollarSign, Clock } from 'lucide-react';
import { BrandPanel } from './BrandPanel';
import { OtpVerification } from './OtpVerification';
import { useAuthForm } from '../../hooks/useAuthForm';

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: 'borrower' | 'lender';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  initialMode = 'login', 
  defaultRole = 'borrower' 
}) => {
  
  // Enterpise SoC: All logic is abstracted into the hook
  const { state, setters, handlers } = useAuthForm({ initialMode, defaultRole });

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="relative w-full max-w-5xl h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* MODULAR COMPONENT: Left Brand Panel */}
        <BrandPanel layoutMode={state.layoutMode} />

        {/* DYNAMIC FORM PANEL */}
        <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full z-20 flex items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${state.layoutMode === 'signup' ? 'lg:translate-x-full translate-x-0' : 'translate-x-0'}`}>
          <div className="w-full max-w-[400px] px-4 py-8 h-full overflow-y-auto no-scrollbar">
            
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">
                {state.authStep === 'otp' ? 'Verify Identity' : (state.formMode === 'signup' ? `Partner as ${state.currentRole}` : 'Welcome Back')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {state.authStep === 'otp' ? `Code sent to ${state.email}` : 'Secure enterprise authentication.'}
              </p>
            </div>

            {/* Status Messages */}
            {state.loginLockoutTimer > 0 && <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200 flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> Lockout: {state.loginLockoutTimer}s</div>}
            {state.errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">{state.errorMsg}</div>}
            {state.successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200">{state.successMsg}</div>}

            {/* View Switcher: OTP vs Forms */}
            {state.authStep === 'otp' ? (
              <OtpVerification 
                otpValues={state.otpValues} setOtpValues={setters.setOtpValues} otpRefs={state.otpRefs}
                loading={state.loading} resendTimer={state.resendTimer}
                onVerify={handlers.handleVerifyOtp} onResend={handlers.handleResendOtp}
                onCancel={() => { setters.setAuthStep('form'); setters.setOtpValues(['', '', '', '', '', '', '', '']); }}
              />
            ) : (
              <form onSubmit={handlers.handleEmailAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input type="email" required value={state.email} onChange={(e) => setters.setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="you@company.com" disabled={state.loading} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input type="password" required value={state.password} onChange={(e) => setters.setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder={state.formMode === 'signup' ? "Min. 12 characters" : "••••••••"} disabled={state.loading} />
                  </div>
                </div>

                {state.formMode === 'signup' && (
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input type="text" required value={state.companyName} onChange={(e) => setters.setCompanyName(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Entity Name" disabled={state.loading} />
                    </div>

                    {state.currentRole === 'borrower' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" required value={state.revenue} onChange={(e) => setters.setRevenue(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Revenue" disabled={state.loading} />
                        <input type="text" required value={state.loanAmount} onChange={(e) => setters.setLoanAmount(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Loan Target" disabled={state.loading} />
                      </div>
                    )}

                    {state.currentRole === 'lender' && (
                      <>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input type="text" required value={state.aum} onChange={(e) => setters.setAum(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Est. AUM" disabled={state.loading} />
                        </div>
                        <div className="flex items-start gap-2 mt-2">
                          <input type="checkbox" id="accredited" required checked={state.accredited} onChange={(e) => setters.setAccredited(e.target.checked)} className="mt-1" disabled={state.loading} />
                          <label htmlFor="accredited" className="text-[11px] text-slate-600">I certify this entity is an Accredited Investor.</label>
                        </div>
                      </>
                    )}

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-4">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" required checked={state.agreeTerms} onChange={(e) => setters.setAgreeTerms(e.target.checked)} className="mt-0.5" disabled={state.loading} />
                        <label htmlFor="terms" className="text-[10px] text-slate-500">I agree to the Terms of Service and Privacy Policy.</label>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={state.loading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-4 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {state.loading ? 'Processing...' : (state.formMode === 'signup' ? 'Submit' : 'Login')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* View Toggle */}
            {state.authStep === 'form' && (
              <div className="mt-6 text-center flex flex-col gap-1.5 pb-4 border-t border-slate-100 pt-4">
                {state.formMode === 'login' ? (
                  <span className="text-xs text-slate-500">Need an account? <button onClick={() => handlers.switchMode('signup', 'borrower')} disabled={state.isAnimating} className="font-bold text-blue-600">Apply</button> or <button onClick={() => handlers.switchMode('signup', 'lender')} disabled={state.isAnimating} className="font-bold text-blue-600">Partner</button></span>
                ) : (
                  <span className="text-xs text-slate-500">Already have an account? <button onClick={() => handlers.switchMode('login')} disabled={state.isAnimating} className="font-bold text-blue-600">Sign in</button></span>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};