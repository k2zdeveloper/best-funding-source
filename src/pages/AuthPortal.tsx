import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Briefcase, User, ShieldCheck, RefreshCw } from 'lucide-react';

export const AuthPortal: React.FC = () => {
  // Base State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'borrower' | 'lender'>('borrower');

  // OTP State
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resending OTP
  useEffect(() => {
   let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const routeUserToDashboard = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.role === 'super_admin' || profile.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (profile.role === 'lender') {
        window.location.href = '/lender-dashboard';
      } else {
        window.location.href = '/borrower-dashboard';
      }
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Secure Enterprise Registration
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: selectedRole } }
        });
        if (error) throw error;
        
        // Switch to OTP screen
        setSuccessMsg('Secure code sent to your email.');
        setAuthStep('otp');
        setResendTimer(60); // 60 second cooldown

      } else {
        // Secure Password Login
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // If they haven't verified their email yet, send OTP and switch screens
          if (error.message.includes('Email not confirmed')) {
            await supabase.auth.resend({ type: 'signup', email });
            setAuthStep('otp');
            setResendTimer(60);
            throw new Error('Account unverified. We just sent a new code to your email.');
          }
          throw error;
        }

        setSuccessMsg('Successfully logged in. Routing to dashboard...');
        if (data.user) await routeUserToDashboard(data.user.id);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      setSuccessMsg('Verification successful. Securing session...');
      if (data.user) await routeUserToDashboard(data.user.id);

    } catch (error: any) {
      setErrorMsg(error.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setErrorMsg('');
    
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      
      setSuccessMsg('A new secure code has been sent.');
      setResendTimer(60); // Reset the 60 second timer
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || `Failed to authenticate with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {authStep === 'otp' ? 'Verify Your Identity' : (isSignUp ? 'Create an Account' : 'Welcome Back')}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {authStep === 'otp' ? `We sent a 6-digit code to ${email}` : 'Enterprise-grade secure authentication'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
            {successMsg}
          </div>
        )}

        {/* STEP 1: LOGIN / SIGNUP FORM */}
        {authStep === 'form' && (
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">I am signing up as a:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('borrower')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${selectedRole === 'borrower' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Borrower</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('lender')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${selectedRole === 'lender' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                  >
                    <Briefcase className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Lender</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              {!loading && <LogIn className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {authStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allows numbers
                className="block w-full text-center tracking-[1em] text-2xl py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono shadow-inner"
                placeholder="000000" 
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Verifying...' : 'Verify Identity'}
              {!loading && <ShieldCheck className="w-4 h-4" />}
            </button>

            <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={loading || resendTimer > 0}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setAuthStep('form')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        {/* FOOTER - ONLY SHOW ON FORM STEP */}
        {authStep === 'form' && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                  Google
                </button>
                <button onClick={() => handleOAuthLogin('azure')} disabled={loading} className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                  Microsoft
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};