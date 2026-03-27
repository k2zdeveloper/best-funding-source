import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { RoleSpecificFields } from './RoleSpecificFields';

interface AuthFormProps {
  state: any;
  setters: any;
  handlers: any;
  setLocalAuthError: (err: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ state, setters, handlers, setLocalAuthError }) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear local validation errors instantly as the user types to correct them
  useEffect(() => {
    setLocalAuthError('');
  }, [state.password, confirmPassword, setLocalAuthError]);

  // Reset local state if the user switches between Login and Signup modes
  useEffect(() => {
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [state.formMode]);

  const handleSecureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Client-Side Guardrail for Signup
    if (state.formMode === 'signup') {
      if (state.password !== confirmPassword) {
        return setLocalAuthError('Passwords do not match. Please verify your entry.');
      }
      if (state.password.length < 12) {
        return setLocalAuthError('Enterprise security requires a minimum 12-character password.');
      }
    }

    // Hand off to the global backend hook if validation passes
    handlers.handleEmailAuth(e);
  };

  const isPasswordMismatch = state.formMode === 'signup' && confirmPassword && state.password !== confirmPassword;

  return (
    <form onSubmit={handleSecureSubmit} className="space-y-4">
      <div className="space-y-3">
        
        {/* Email Input */}
        <div className="relative">
          {/* Icons: Changed to Brand Blue */}
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#1B6FA5]" />
          <input 
            type="email" required 
            value={state.email} 
            onChange={(e) => setters.setEmail(e.target.value)} 
            // Inputs: Changed border to soft brand blue, focus ring to brand Teal
            className="w-full pl-9 pr-3 py-3 border border-[#1B6FA5]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:border-[#21B0A6] transition-colors" 
            placeholder="you@company.com" 
            disabled={state.loading} 
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#1B6FA5]" />
          <input 
            type={showPassword ? "text" : "password"} required 
            value={state.password} 
            onChange={(e) => setters.setPassword(e.target.value)} 
            // Inputs: Changed focus ring to brand Teal
            className="w-full pl-9 pr-10 py-3 border border-[#1B6FA5]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:border-[#21B0A6] transition-colors" 
            placeholder={state.formMode === 'signup' ? "Min. 12 characters" : "••••••••"} 
            disabled={state.loading} 
          />
          <button 
            type="button" tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            // Hide/Show Toggle: Soft Brand Blue
            className="absolute right-3 top-3 text-[#1B6FA5]/60 hover:text-[#1B6FA5] transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Confirm Password (Signup Only) */}
        {state.formMode === 'signup' && (
          <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#1B6FA5]" />
            <input 
              type={showConfirmPassword ? "text" : "password"} required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              // Inputs: Changed focus ring to brand Teal. Kept red validation border as standard.
              className={`w-full pl-9 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] transition-colors ${isPasswordMismatch ? 'border-red-300 bg-red-50 text-red-900' : 'border-[#1B6FA5]/20 bg-white'}`} 
              placeholder="Confirm Password" 
              disabled={state.loading} 
            />
            <button 
              type="button" tabIndex={-1}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-[#1B6FA5]/60 hover:text-[#1B6FA5] transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {state.formMode === 'signup' && (
        <RoleSpecificFields state={state} setters={setters} />
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={state.loading || (state.formMode === 'signup' && !state.agreeTerms) || isPasswordMismatch} 
        // Button: Using Brand Teal (`bg-[#21B0A6]`) and hovering into Brand Blue (`hover:bg-[#1B6FA5]`)
        className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-6 rounded-lg text-sm font-bold text-white bg-[#21B0A6] hover:bg-[#1B6FA5] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#1B6FA5]/20 focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2"
      >
        {state.loading ? 'Authenticating...' : (state.formMode === 'signup' ? 'Submit Application' : 'Secure Login')} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};