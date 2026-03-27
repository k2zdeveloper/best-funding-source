import React, { useState } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { BrandPanel } from './BrandPanel';
import { OtpVerification } from './OtpVerification';
import { AuthForm } from './AuthForm';
import { useAuthForm } from '../../hooks/useAuthForm';

// 1. IMPORT YOUR MAIN NAVIGATION COMPONENT
import { Navigation } from '../../components/layout/Navigation'; 

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: 'borrower' | 'lender';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  initialMode = 'login', 
  defaultRole = 'borrower' 
}) => {
  const { state, setters, handlers } = useAuthForm({ initialMode, defaultRole });
  const [localAuthError, setLocalAuthError] = useState('');

  const displayError = localAuthError || state.errorMsg;

  return (
    // Wrap everything in a fragment <> so we can render the Nav and the Page side-by-side
    <>
      {/* 2. ADD YOUR MAIN NAVBAR HERE */}
      <Navigation />

      {/* 3. ADJUST PADDING: Changed to pt-32 so it clears the fixed navbar! */}
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-32 lg:p-8">
        <div className="relative w-full max-w-5xl h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Brand Panel */}
          <BrandPanel layoutMode={state.layoutMode} />

          {/* DYNAMIC FORM PANEL */}
          <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full z-20 flex items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${state.layoutMode === 'signup' ? 'lg:translate-x-full translate-x-0' : 'translate-x-0'}`}>
            <div className="w-full max-w-[400px] px-4 py-8 h-full overflow-y-auto no-scrollbar">
              
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#0A2235] mb-1 flex items-center gap-2 tracking-tight">
                  {state.authStep === 'otp' ? 'Verify Identity' : (state.formMode === 'signup' ? `Partner as ${state.currentRole}` : 'Secure Access')}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {state.authStep === 'otp' ? `Code sent to ${state.email}` : 'Enterprise authentication portal.'}
                </p>
              </div>

              {/* Status Feedback Banners */}
              {state.loginLockoutTimer > 0 && (
                <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-bold rounded-lg border border-orange-200 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <Clock className="w-4 h-4 shrink-0" /> Lockout: {state.loginLockoutTimer}s
                </div>
              )}
              {displayError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 animate-in slide-in-from-top-2">
                  {displayError}
                </div>
              )}
              {state.successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#21B0A6]" /> {state.successMsg}
                </div>
              )}

              {/* View Engine: OTP vs Form */}
              {state.authStep === 'otp' ? (
                <OtpVerification 
                  otpValues={state.otpValues} setOtpValues={setters.setOtpValues} otpRefs={state.otpRefs}
                  loading={state.loading} resendTimer={state.resendTimer}
                  onVerify={handlers.handleVerifyOtp} onResend={handlers.handleResendOtp}
                  onCancel={() => { setters.setAuthStep('form'); setters.setOtpValues(['', '', '', '', '', '', '', '']); }}
                />
              ) : (
                <AuthForm 
                  state={state} 
                  setters={setters} 
                  handlers={handlers} 
                  setLocalAuthError={setLocalAuthError} 
                />
              )}

              {/* Footer View Toggle */}
              {state.authStep === 'form' && (
                <div className="mt-8 text-center flex flex-col gap-2 pb-4 border-t border-[#1B6FA5]/10 pt-6">
                  {state.formMode === 'login' ? (
                    <span className="text-xs font-medium text-slate-500">
                      Need an account?{' '}
                      <button type="button" onClick={() => handlers.switchMode('signup', 'borrower')} disabled={state.isAnimating} className="font-bold text-[#1B6FA5] hover:text-[#21B0A6] transition-colors focus:outline-none focus:underline">Apply</button> 
                      {' '}or{' '}
                      <button type="button" onClick={() => handlers.switchMode('signup', 'lender')} disabled={state.isAnimating} className="font-bold text-[#1B6FA5] hover:text-[#21B0A6] transition-colors focus:outline-none focus:underline">Partner</button>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">
                      Already registered? <button type="button" onClick={() => handlers.switchMode('login')} disabled={state.isAnimating} className="font-bold text-[#1B6FA5] hover:text-[#21B0A6] transition-colors focus:outline-none focus:underline">Sign in to portal</button>
                    </span>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};