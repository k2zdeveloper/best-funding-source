// src/components/auth/portal/AuthForm.tsx
import React, { useRef } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Building2, DollarSign, RefreshCw, Clock } from 'lucide-react';

export const AuthForm = ({ state, setters, handlers }: any) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="w-full max-w-[400px] px-4 py-8 h-full overflow-y-auto no-scrollbar">
      <div className="flex lg:hidden items-center gap-2 mb-8 mt-4">
        <div className="bg-blue-600 p-1.5 rounded-lg"><ShieldCheck className="h-4 w-4 text-white" /></div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">Enterprise<span className="text-blue-600">Funding</span></span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mb-1">
          {state.authStep === 'otp' ? 'Verify Identity' : (state.formMode === 'signup' ? `Partner as ${state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)}` : 'Welcome Back')}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {state.authStep === 'otp' ? `We sent an 8-digit code to ${state.email}` : (state.formMode === 'signup' ? 'Complete your corporate profile to apply.' : 'Enter your credentials to access the secure portal.')}
        </p>
      </div>

      {/* Dynamic Alerts */}
      {state.loginLockoutTimer > 0 && (
        <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200 flex items-start gap-2 shadow-sm">
          <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p>Too many failed attempts. Try again in <strong>{state.loginLockoutTimer}s</strong>.</p>
        </div>
      )}
      {state.errorMsg === 'RATE_LIMIT' && (
        <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200 flex items-start gap-2 shadow-sm">
          <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p>Please wait <strong>{state.resendTimer}s</strong> before requesting another code.</p>
        </div>
      )}
      {state.errorMsg && state.errorMsg !== 'RATE_LIMIT' && (
        <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 flex items-start gap-1.5"><div className="mt-0.5">•</div><p>{state.errorMsg}</p></div>
      )}
      {state.successMsg && (
        <div className="mb-4 p-2.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-start gap-1.5"><div className="mt-0.5">•</div><p>{state.successMsg}</p></div>
      )}

      {/* MAIN EMAIL/PASS FORM */}
      {state.authStep === 'form' && (
        <form onSubmit={handlers.handleEmailAuth} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Corporate Email</label>
              <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="email" required value={state.email} onChange={(e) => setters.setEmail(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" placeholder="you@company.com" /></div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="password" required value={state.password} onChange={(e) => setters.setPassword(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" placeholder={state.formMode === 'signup' ? "Min. 12 characters" : "••••••••"} /></div>
            </div>
          </div>

          {state.formMode === 'signup' && (
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Company / Entity Name</label>
                <div className="relative"><Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" required value={state.companyName} onChange={(e) => setters.setCompanyName(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm" placeholder="Acme Corp LLC" /></div>
              </div>

              {state.currentRole === 'borrower' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Annual Revenue</label><input type="text" required value={state.revenue} onChange={(e) => setters.setRevenue(e.target.value)} className="block w-full px-3 py-2.5 bg-white border rounded-lg text-sm" placeholder="$5M - $10M" /></div>
                  <div><label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Loan Target</label><input type="text" required value={state.loanAmount} onChange={(e) => setters.setLoanAmount(e.target.value)} className="block w-full px-3 py-2.5 bg-white border rounded-lg text-sm" placeholder="$500k" /></div>
                </div>
              )}

              {state.currentRole === 'lender' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Est. AUM</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" required value={state.aum} onChange={(e) => setters.setAum(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm" placeholder="$50M+" /></div>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <input type="checkbox" required checked={state.accredited} onChange={(e) => setters.setAccredited(e.target.checked)} className="mt-1 h-3.5 w-3.5 text-blue-600 rounded border-slate-300" />
                    <label className="text-[11px] text-slate-600 leading-tight">I certify this entity represents an Accredited Investor.</label>
                  </div>
                </>
              )}
              <div className="flex items-start gap-2 p-3 bg-slate-50 border rounded-lg mt-4">
                <input type="checkbox" required checked={state.agreeTerms} onChange={(e) => setters.setAgreeTerms(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 text-blue-600 rounded border-slate-300" />
                <label className="text-[10px] text-slate-500 leading-tight">I agree to the Terms of Service and Privacy Policy.</label>
              </div>
            </div>
          )}

          <button type="submit" disabled={state.loading || state.isAnimating || state.loginLockoutTimer > 0} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-4 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 uppercase">
            {state.loading ? 'Processing...' : (state.formMode === 'signup' ? 'Submit' : 'Access Portal')}
            {!state.loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      )}

      {/* OTP FORM */}
      {state.authStep === 'otp' && (
        <form onSubmit={handlers.handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3 text-center">Enter 8-Digit Code</label>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {state.otpValues.map((digit: string, index: number) => (
                <input key={index} ref={(el) => { otpRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                  className="w-8 h-12 sm:w-10 sm:h-12 text-center text-lg sm:text-xl font-mono border border-slate-300 rounded-lg focus:border-blue-600 transition-all"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); if (!val) return;
                    const newOtp = [...state.otpValues]; newOtp[index] = val; setters.setOtpValues(newOtp);
                    if (index < 7) otpRefs.current[index + 1]?.focus(); else if (index === 7) setTimeout(handlers.handleVerifyOtp, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      e.preventDefault(); const newOtp = [...state.otpValues]; newOtp[index] = ''; setters.setOtpValues(newOtp);
                      if (index > 0) otpRefs.current[index - 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault(); const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
                    if (pastedData) {
                      const newOtp = [...state.otpValues];
                      for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
                      setters.setOtpValues(newOtp);
                      otpRefs.current[Math.min(pastedData.length, 7)]?.focus();
                      if (pastedData.length === 8) setTimeout(handlers.handleVerifyOtp, 100);
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={state.loading || state.otpValues.join('').length !== 8} className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 disabled:opacity-50 uppercase flex justify-center items-center gap-2">
            {state.loading ? 'Verifying...' : 'Verify Identity'} <ShieldCheck className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center gap-3 pt-4 border-t">
            <button type="button" onClick={handlers.handleResendOtp} disabled={state.loading || state.resendTimer > 0} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 uppercase">
              <RefreshCw className={`w-3.5 h-3.5 ${state.loading ? 'animate-spin' : ''}`} />
              {state.resendTimer > 0 ? `Resend in ${state.resendTimer}s` : 'Resend code'}
            </button>
            <button type="button" onClick={() => { setters.setAuthStep('form'); setters.setOtpValues(Array(8).fill('')); }} className="text-[11px] font-medium text-slate-400 underline">Use a different email</button>
          </div>
        </form>
      )}

      {/* FOOTER ACTIONS */}
      {state.authStep === 'form' && (
        <div className="mt-6 mb-8">
          <div className="relative mb-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-[9px] font-bold uppercase"><span className="px-2 bg-white text-slate-400">Or Authenticate Via</span></div></div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={() => handlers.handleOAuthLogin('google')} disabled={state.loading || state.isAnimating} className="w-full py-2 border rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">Google</button>
            <button onClick={() => handlers.handleOAuthLogin('azure')} disabled={state.loading || state.isAnimating} className="w-full py-2 border rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">Microsoft</button>
          </div>
          <div className="text-center flex flex-col gap-1.5 text-xs font-medium text-slate-500">
            {state.formMode === 'login' ? (
              <span>Need an account? <button type="button" onClick={() => handlers.switchMode('signup', 'borrower')} className="font-bold text-blue-600">Apply</button> or <button type="button" onClick={() => handlers.switchMode('signup', 'lender')} className="font-bold text-blue-600">Partner</button></span>
            ) : (
              <span>Already have an account? <button type="button" onClick={() => handlers.switchMode('login')} className="font-bold text-blue-600">Sign in</button></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};