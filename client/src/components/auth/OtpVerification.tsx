import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  otpValues: string[];
  setOtpValues: (values: string[]) => void;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean;
  resendTimer: number;
  onVerify: (e: React.FormEvent) => void;
  onResend: () => void;
  onCancel: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  otpValues, setOtpValues, otpRefs, loading, resendTimer, onVerify, onResend, onCancel
}) => {
  const currentOtpString = otpValues.join('');

  const handleChange = (val: string, index: number) => {
    const cleanVal = val.replace(/\D/g, ''); 
    if (!cleanVal && val) return; 
    const newOtp = [...otpValues]; 
    newOtp[index] = cleanVal; 
    setOtpValues(newOtp);
    if (cleanVal && index < 7) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otpValues];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = '';
        otpRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
      }
      setOtpValues(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (pastedData) {
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
      setOtpValues(newOtp);
      otpRefs.current[Math.min(pastedData.length, 7)]?.focus();
    }
  };

  return (
    <form onSubmit={onVerify} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3 text-center">
          Enter 8-Digit Security Code
        </label>
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {otpValues.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { otpRefs.current[index] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={digit} disabled={loading}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-8 h-12 sm:w-10 sm:h-12 text-center text-lg sm:text-xl font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner text-slate-800 transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />
          ))}
        </div>
      </div>

      <button 
        type="submit" disabled={loading || currentOtpString.length !== 8} 
        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        {loading ? 'Verifying...' : 'Verify Identity'}
        {!loading && <ShieldCheck className="w-4 h-4" />}
      </button>

      <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button" onClick={onResend} disabled={loading || resendTimer > 0}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
        </button>
        <button 
          type="button" onClick={onCancel} disabled={loading} 
          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 underline underline-offset-2 disabled:opacity-50"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
};