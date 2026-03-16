import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Mail, Lock, ShieldCheck, ArrowRight, 
  Building2, DollarSign, RefreshCw, Clock
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: 'borrower' | 'lender';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  initialMode = 'login', 
  defaultRole = 'borrower' 
}) => {
  const navigate = useNavigate();
  
  const [layoutMode, setLayoutMode] = useState<'login' | 'signup'>(initialMode);
  const [formMode, setFormMode] = useState<'login' | 'signup'>(initialMode);
  const [currentRole, setCurrentRole] = useState(defaultRole);
  
  // Base Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP State
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentOtpString = otpValues.join('');
  const [resendTimer, setResendTimer] = useState(0);

  // Profile State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState(''); 
  const [loanAmount, setLoanAmount] = useState(''); 
  const [aum, setAum] = useState(''); 
  const [accredited, setAccredited] = useState(false); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rate Limiting UX
  const [attempts, setAttempts] = useState(0);
  const [loginLockoutTimer, setLoginLockoutTimer] = useState(0);

  // --- PROP SYNC ---
  useEffect(() => {
    setLayoutMode(initialMode);
    setFormMode(initialMode);
    setCurrentRole(defaultRole);
    setAuthStep('form');
    setErrorMsg('');
  }, [initialMode, defaultRole]);

  // --- SECURE ROUTING PIPELINE ---
  const routeUserToDashboard = useCallback(async (userId: string) => {
    try {
      if (!userId) throw new Error("Missing User ID for routing");
      console.log(`[AUTH] Fetching profile for: ${userId}`);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[DB WARNING] Profile fetch error:', error);
      }

      let dbRole = profile?.role;
      if (!dbRole) {
        const { data: { session } } = await supabase.auth.getSession();
        const metaRole = session?.user?.user_metadata?.requested_role;
        dbRole = (metaRole === 'admin' || metaRole === 'super_admin') ? 'borrower' : metaRole;
      }

      const safeRole = dbRole || 'borrower';
      const routes: Record<string, string> = {
        super_admin: '/admin-dashboard',
        admin: '/admin-dashboard',
        lender: '/lender-dashboard',
        borrower: '/borrower-dashboard'
      };

      const targetRoute = routes[safeRole] || '/borrower-dashboard';
      console.log(`[SUCCESS] User authenticated. Routing to: ${targetRoute}`);
      
      // Execute route change
      navigate(targetRoute, { replace: true });

      // THE FAILSAFE: If React Router swallows the navigation and the component doesn't unmount,
      // this timeout will unlock the UI and tell you exactly what route failed to match.
      setTimeout(() => {
        setLoading(false);
        setErrorMsg(`Critical UI Error: Failed to transition DOM to ${targetRoute}. Check App.tsx routes.`);
      }, 2000);

    } catch (err: any) {
      console.error('[CRITICAL] Routing failure:', err);
      setErrorMsg(err.message || 'Authentication succeeded, but routing failed.');
      setLoading(false);
    }
  }, [navigate]);

  // --- SECURE LIFECYCLE LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        routeUserToDashboard(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [routeUserToDashboard, navigate]);

  // --- TIMERS ---
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (loginLockoutTimer > 0) {
      const timer = setTimeout(() => setLoginLockoutTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [loginLockoutTimer]);

  // --- UI HANDLERS ---
  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    
    setErrorMsg('');
    setSuccessMsg('');
    setAuthStep('form'); 
    setOtpValues(['', '', '', '', '', '', '', '']);
    
    const targetUrl = mode === 'signup' ? `/signup/${role || 'borrower'}` : '/login';
    navigate(targetUrl, { replace: true });

    if (window.innerWidth < 1024) {
      setLayoutMode(mode);
      setFormMode(mode);
      if (role) setCurrentRole(role);
      return;
    }

    setIsAnimating(true);
    setLayoutMode(mode); 

    setTimeout(() => {
      setFormMode(mode);
      if (role) setCurrentRole(role);
    }, 400);

    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockoutTimer > 0 || loading) return; 

    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return setErrorMsg('Please fill in both your email and password.');
    }

    if (formMode === 'signup') {
      if (password.length < 12) return setErrorMsg('Password must be at least 12 characters.');
      if (!agreeTerms) return setErrorMsg('Please accept the Terms of Service.');
      if (!companyName) return setErrorMsg('Company name is required.');
    }

    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              requested_role: currentRole,
              company_name: companyName,
              industry,
              ...(currentRole === 'borrower' ? { revenue, loan_amount: loanAmount } : {}),
              ...(currentRole === 'lender' ? { aum, is_accredited: accredited } : {}),
            }
          }
        });
        
        if (error) throw error;

        setSuccessMsg('Code sent! Check your inbox (and spam folder).');
        setAuthStep('otp');
        setResendTimer(60);
        setLoading(false); 
        
        setTimeout(() => otpRefs.current[0]?.focus(), 100);

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail, 
          password
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            await supabase.auth.resend({ type: 'signup', email: cleanEmail });
            setAuthStep('otp');
            setResendTimer(60);
            setLoading(false);
            setErrorMsg("Verification required. We sent a new code to your inbox.");
            return; 
          }
          throw error;
        }
        
        setSuccessMsg("Verified! Securing connection...");
        setAttempts(0); 
        
        if (data.user) {
          await routeUserToDashboard(data.user.id);
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setLoginLockoutTimer(60); 
      } else {
        setErrorMsg(error.message || 'Authentication failed. Please try again.');
      }
      setLoading(false); 
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (loading) return; 
    
    const cleanEmail = email.trim().toLowerCase();
    const finalOtp = currentOtpString.trim();

    if (finalOtp.length !== 8) {
      return setErrorMsg("Please enter all 8 numbers.");
    }

    setLoading(true);
    setErrorMsg('');

    try {
      console.log(`[AUTH] Verifying OTP for ${cleanEmail}...`);
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: finalOtp,
        type: 'signup' // Correctly matching new user verification
      });

      console.log(`[AUTH] Verification Response:`, { data, error });

      if (error) throw error;
      
      if (!data?.user) {
        throw new Error("Verification returned 200 OK, but user object is missing.");
      }

      setSuccessMsg("Code accepted! Securing route...");
      await routeUserToDashboard(data.user.id);

    } catch (error: any) {
      console.error('[AUTH ERROR]:', error);
      setErrorMsg(error.status === 500 
        ? "Server Database Error. Conflicted user record." 
        : error.message || "Invalid or expired code. Please try again.");
      
      setLoading(false); 
    } 
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setErrorMsg('');
    
    try {
      const { error } = await supabase.auth.resend({ 
        type: 'signup', 
        email: email.trim().toLowerCase() 
      });
      
      if (error) throw error;
      
      setSuccessMsg('A new code has been sent.');
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '', '', '']); 
      otpRefs.current[0]?.focus();
      
    } catch (error: any) {
      if (error.status === 429) {
        setResendTimer(60);
        setErrorMsg("Too many requests. Please wait a minute.");
      } else {
        setErrorMsg("Failed to send code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: window.location.origin + '/login',
          queryParams: { intended_role: currentRole }
        } 
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(`Failed to connect to provider. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="relative w-full max-w-5xl h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* BRAND PANEL */}
        <div 
          className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full z-30 flex-col justify-between bg-blue-950 p-10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            layoutMode === 'signup' ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Corporate Building" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/80 to-blue-900/40 z-10 pointer-events-none"></div>
          
          <div className="relative z-20 flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/50">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Enterprise<span className="text-blue-400">Funding</span>
            </span>
          </div>

          <div className="relative z-20 max-w-sm mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-200 text-[9px] font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
              <Lock className="w-3 h-3" />
              <span>AES-256 Encrypted</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white leading-[1.1] mb-4 drop-shadow-lg">
              Strategic Capital <br />
              <span className="text-blue-400 italic font-light">for the Middle Market.</span>
            </h1>
            <p className="text-blue-100/80 font-light leading-relaxed text-xs">
              Institutional liquidity backed by rigorous security protocols. All data transfers strictly conform to enterprise compliance standards.
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div 
          className={`absolute top-0 left-0 w-full lg:w-1/2 h-full z-20 flex items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            layoutMode === 'signup' ? 'lg:translate-x-full translate-x-0' : 'translate-x-0'
          }`}
        >
          <div className="w-full max-w-[400px] px-4 py-8 h-full overflow-y-auto no-scrollbar">
            <div className="flex lg:hidden items-center gap-2 mb-8 mt-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Enterprise<span className="text-blue-600">Funding</span>
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mb-1">
                {authStep === 'otp' ? 'Verify Identity' : (formMode === 'signup' ? `Partner as ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}` : 'Welcome Back')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {authStep === 'otp' ? `We sent an 8-digit code to ${email}` : (formMode === 'signup' ? 'Complete your corporate profile to apply.' : 'Enter your credentials to access the secure portal.')}
              </p>
            </div>

            {loginLockoutTimer > 0 && (
              <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200 flex items-start gap-2 shadow-sm animate-in fade-in">
                <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p>Too many attempts. Please wait <strong>{loginLockoutTimer}s</strong>.</p>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 flex items-start gap-1.5 animate-in fade-in">
                <div className="mt-0.5">•</div>
                <p>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-2.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-start gap-1.5 animate-in fade-in">
                <div className="mt-0.5">•</div>
                <p>{successMsg}</p>
              </div>
            )}

            {authStep === 'form' && (
              <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                        placeholder="you@company.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                        placeholder={formMode === 'signup' ? "Min. 12 characters" : "••••••••"} />
                    </div>
                  </div>
                </div>

                {formMode === 'signup' && (
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Company / Entity Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm" placeholder="Acme Corp LLC" />
                      </div>
                    </div>

                    {currentRole === 'borrower' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Annual Revenue</label>
                          <input type="text" required value={revenue} onChange={(e) => setRevenue(e.target.value)}
                            className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm" placeholder="$5M - $10M" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Loan Target</label>
                          <input type="text" required value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)}
                            className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm" placeholder="$500k" />
                        </div>
                      </div>
                    )}

                    {currentRole === 'lender' && (
                      <>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Est. AUM (Assets Under Management)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input type="text" required value={aum} onChange={(e) => setAum(e.target.value)}
                              className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm" placeholder="$50M+" />
                          </div>
                        </div>
                        <div className="flex items-start gap-2 mt-2">
                          <input type="checkbox" id="accredited" required checked={accredited} onChange={(e) => setAccredited(e.target.checked)}
                            className="mt-1 h-3.5 w-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-600" />
                          <label htmlFor="accredited" className="text-[11px] text-slate-600 font-medium leading-tight">
                            I certify that this entity represents an Accredited Investor or Qualified Institutional Buyer.
                          </label>
                        </div>
                      </>
                    )}

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-4">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-600" />
                        <label htmlFor="terms" className="text-[10px] text-slate-500 leading-tight">
                          I agree to the Terms of Service, Privacy Policy, and consent to electronic disclosures as required by financial regulations.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading || isAnimating || loginLockoutTimer > 0}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-4 rounded-lg shadow-md shadow-blue-600/20 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                >
                  {loading ? 'Processing...' : (formMode === 'signup' ? 'Submit Application' : 'Access Portal')}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            )}

            {authStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3 text-center">
                    Enter 8-Digit Security Code
                  </label>
                  
                  <div className="flex justify-center gap-1.5 sm:gap-2">
                    {otpValues.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        className="w-8 h-12 sm:w-10 sm:h-12 text-center text-lg sm:text-xl font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner text-slate-800 transition-all"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (!val && e.target.value) return; 
                          
                          const newOtp = [...otpValues];
                          newOtp[index] = val;
                          setOtpValues(newOtp);

                          if (val && index < 7) {
                            otpRefs.current[index + 1]?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            e.preventDefault();
                            const newOtp = [...otpValues];
                            newOtp[index] = '';
                            setOtpValues(newOtp);
                            if (index > 0) otpRefs.current[index - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
                          if (pastedData) {
                            const newOtp = [...otpValues];
                            for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
                            setOtpValues(newOtp);
                            
                            const focusIndex = Math.min(pastedData.length, 7);
                            otpRefs.current[focusIndex]?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || currentOtpString.length !== 8} 
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify Identity'}
                  {!loading && <ShieldCheck className="w-4 h-4" />}
                </button>

                <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={handleResendOtp} 
                    disabled={loading || resendTimer > 0}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors uppercase tracking-wider"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthStep('form');
                      setOtpValues(['', '', '', '', '', '', '', '']); 
                    }}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-600 underline underline-offset-2"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            {authStep === 'form' && (
              <div className="mt-6 mb-8 animate-in fade-in duration-500 delay-150">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.2em]">
                    <span className="px-2 bg-white text-slate-400">Or Authenticate Via</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => handleOAuthLogin('google')} disabled={loading || isAnimating}
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    Google
                  </button>
                  <button onClick={() => handleOAuthLogin('azure')} disabled={loading || isAnimating}
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    Microsoft
                  </button>
                </div>

                <div className="mt-6 text-center flex flex-col gap-1.5 pb-4">
                  {formMode === 'login' && (
                    <span className="text-xs font-medium text-slate-500">
                      Need an account?{' '}
                      <button type="button" onClick={() => switchMode('signup', 'borrower')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700">Apply</button>
                      {' '}or{' '}
                      <button type="button" onClick={() => switchMode('signup', 'lender')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700">Partner</button>
                    </span>
                  )}
                  {formMode === 'signup' && (
                    <span className="text-xs font-medium text-slate-500">
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchMode('login')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700">Sign in</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};