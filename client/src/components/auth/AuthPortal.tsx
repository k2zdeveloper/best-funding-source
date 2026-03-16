import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Mail, Lock, Send, ShieldCheck, ArrowRight, 
  Building2, Briefcase, DollarSign, Scale, RefreshCw,
  Clock
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
  
  // Enhanced 8-Digit OTP State
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentOtpString = otpValues.join('');
  const [resendTimer, setResendTimer] = useState(0);

  // Enhanced Profile State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState(''); 
  const [loanAmount, setLoanAmount] = useState(''); 
  const [aum, setAum] = useState(''); 
  const [accredited, setAccredited] = useState(false); 
  
  // Legalities
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI & Security State
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Humanized Throttling State
  const [attempts, setAttempts] = useState(0);
  const [loginLockoutTimer, setLoginLockoutTimer] = useState(0);
  const lastSubmitTime = useRef<number>(0);

  // --- NEW: SESSION LISTENER FOR OAUTH REDIRECTS ---
  useEffect(() => {
    // 1. Check if user is already logged in on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        routeUserToDashboard(session.user.id);
      }
    });

    // 2. Listen for auth changes (catches the user when they return from Google/Azure)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await routeUserToDashboard(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Timer countdown for resending OTP & Login Lockouts
  useEffect(() => {
    let resendInterval: ReturnType<typeof setInterval>;
    let lockoutInterval: ReturnType<typeof setInterval>;

    if (resendTimer > 0) {
      resendInterval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    
    if (loginLockoutTimer > 0) {
      lockoutInterval = setInterval(() => setLoginLockoutTimer((prev) => prev - 1), 1000);
    }

    return () => {
      clearInterval(resendInterval);
      clearInterval(lockoutInterval);
    };
  }, [resendTimer, loginLockoutTimer]);

  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    
    setErrorMsg('');
    setSuccessMsg('');
    setAuthStep('form'); 
    setOtpValues(['', '', '', '', '', '', '', '']);
    
    const newUrl = mode === 'signup' ? `/signup/${role || 'borrower'}` : '/login';
    window.history.pushState({}, '', newUrl);

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

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  // --- BULLETPROOF SPA RBAC ROUTING ---
 // --- BULLETPROOF SPA RBAC ROUTING ---
  const routeUserToDashboard = async (userId: string, fallbackRole?: string) => {
    try {
      let finalRole = fallbackRole;

      // 1. Use maybeSingle() instead of single() to prevent hard crashes if 0 rows exist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch warning (RLS issue or no profile?):', profileError);
      }

      if (profile?.role) {
        finalRole = profile.role;
      } else {
        // 2. Fallback: Check Auth Metadata (saved during signup)
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role) {
          finalRole = user.user_metadata.role;
        }
      }

      // Default failsafe so we don't get stuck
      if (!finalRole) {
        finalRole = 'borrower';
      }

      console.log(`Routing user with role: ${finalRole}`);

      // 3. Seamless SPA routing
      switch (finalRole) {
        case 'super_admin':
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'lender':
          navigate('/lender-dashboard', { replace: true });
          break;
        case 'borrower':
          navigate('/borrower-dashboard', { replace: true });
          break;
        default:
          navigate('/borrower-dashboard', { replace: true }); 
      }
    } catch (err) {
      console.error('Fatal routing error:', err);
      // Release the loading state so the UI doesn't freeze if navigation completely fails
      setLoading(false); 
      setErrorMsg('Login successful, but we had trouble loading your dashboard. Please refresh.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Throttling
    if (loginLockoutTimer > 0) return; 

    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) {
      setErrorMsg('Whoa, that was fast! Please wait just a second before clicking again.');
      return;
    }
    lastSubmitTime.current = now;

    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password; 

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please fill in both your email and password to continue.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("That email format doesn't look quite right. Could you double-check it?");
      return;
    }

    if (formMode === 'signup') {
      if (cleanPassword.length < 12) {
        setErrorMsg('To keep your account secure, please use a password with at least 12 characters.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Please accept our Terms of Service and Privacy Policy to move forward.');
        return;
      }
      if (!companyName) {
        setErrorMsg("Don't forget to tell us your company's name!");
        return;
      }
      if (currentRole === 'borrower' && (!revenue || !loanAmount)) {
         setErrorMsg('Please let us know both your annual revenue and target loan amount so we can best assist you.');
         return;
      }
      if (currentRole === 'lender' && (!aum || !accredited)) {
         setErrorMsg('We need your Est. AUM and accreditation verification to set up your partner profile.');
         return;
      }
    }

    setLoading(true);

    try {
      if (formMode === 'signup') {
        const metadata = {
          role: currentRole,
          company_name: companyName,
          industry: industry,
          ...(currentRole === 'borrower' ? { revenue, loan_amount: loanAmount } : {}),
          ...(currentRole === 'lender' ? { aum, is_accredited: accredited } : {}),
          terms_agreed_at: new Date().toISOString(),
        };

        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { data: metadata }
        });
        
        if (error) throw error;
        
        setSuccessMsg('Awesome! We just sent an 8-digit secure code to your email.');
        setAuthStep('otp');
        setResendTimer(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);

      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: cleanEmail, 
          password: cleanPassword,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            await supabase.auth.resend({ type: 'signup', email: cleanEmail });
            setAuthStep('otp');
            setResendTimer(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
            throw new Error("You'll need to verify your email first! We just sent a fresh 8-digit code to your inbox.");
          }
          throw error;
        }

        setSuccessMsg("Perfect, you're verified! Bringing you securely to your dashboard...");
        setAttempts(0); 

        if (data.user) {
          await routeUserToDashboard(data.user.id);
        }
      }
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setLoginLockoutTimer(60); 
        setErrorMsg(''); 
      } else {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg("Hmm, we couldn't find an account matching those details. Please double-check your email and password.");
        } else {
          setErrorMsg(error.message || 'Something went wrong on our end. Please try again.');
        }
      }
      setLoading(false); 
    } 
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (currentOtpString.length !== 8) {
      setErrorMsg("Please make sure you've entered all 8 numbers.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: currentOtpString,
        type: 'signup'
      });

      if (error) throw error;

      setSuccessMsg("Code accepted! We're securing your session now...");
      setAttempts(0);
      
      if (data.user) {
        await routeUserToDashboard(data.user.id);
      }

    } catch (error: any) {
      setErrorMsg("That code didn't quite work. It might have a typo or it may have expired.");
      setOtpValues(['', '', '', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setLoading(false); 
    } 
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg(''); 
    
    try {
      const { error } = await supabase.auth.resend({ 
        type: 'signup', 
        email: email.trim().toLowerCase() 
      });
      
      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          setResendTimer(60);
          setErrorMsg('RATE_LIMIT'); 
          setLoading(false);
          return;
        }
        throw error;
      }
      
      setSuccessMsg('A new 8-digit code is flying to your inbox!');
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '', '', '']); 
      otpRefs.current[0]?.focus();
      
    } catch (error: any) {
      setErrorMsg("We hit a snag sending that code. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED OAUTH HANDLER ---
  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          // Redirect back to the auth page so the onAuthStateChange listener picks it up.
          // Do not hardcode /dashboard here, let the RBAC router handle it upon return.
          redirectTo: window.location.origin + '/login',
          // Pass the intended role in the query string just in case it's a new signup
          queryParams: {
            intended_role: currentRole 
          }
        } 
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(`We couldn't connect with ${provider === 'google' ? 'Google' : 'Microsoft'} right now. Please try again.`);
      setLoading(false);
    }
  };

  const formContent = (
    <div className="w-full max-w-[400px] px-4 py-8 h-full overflow-y-auto no-scrollbar">
      {/* --- REST OF YOUR UI REMAINS EXACTLY THE SAME --- */}
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
          <p>
            You've tried a few times without success. To keep your account safe, please take a short breather and try again in <strong>{loginLockoutTimer} seconds</strong>.
          </p>
        </div>
      )}

      {errorMsg === 'RATE_LIMIT' && (
        <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-xs font-medium rounded-lg border border-orange-200 flex items-start gap-2 shadow-sm animate-in fade-in">
          <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p>
            We've sent a few codes recently. To keep things secure, please wait <strong>{resendTimer} seconds</strong> before asking for another one.
          </p>
        </div>
      )}

      {errorMsg && errorMsg !== 'RATE_LIMIT' && (
        <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 flex items-start gap-1.5">
          <div className="mt-0.5">•</div>
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-2.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-start gap-1.5">
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
                    I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a>, <a href="#" className="text-blue-600 underline">Privacy Policy</a>, and consent to electronic disclosures as required by financial regulations.
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
                    if (!val) return; 
                    
                    const newOtp = [...otpValues];
                    newOtp[index] = val;
                    setOtpValues(newOtp);

                    if (index < 7) {
                      otpRefs.current[index + 1]?.focus();
                    } else if (index === 7) {
                      setTimeout(() => handleVerifyOtp(), 100);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      e.preventDefault();
                      const newOtp = [...otpValues];
                      newOtp[index] = '';
                      setOtpValues(newOtp);
                      if (index > 0) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
                    if (pastedData) {
                      const newOtp = [...otpValues];
                      for (let i = 0; i < pastedData.length; i++) {
                        newOtp[i] = pastedData[i];
                      }
                      setOtpValues(newOtp);
                      const focusIndex = Math.min(pastedData.length, 7);
                      otpRefs.current[focusIndex]?.focus();
                      
                      if (pastedData.length === 8) {
                        setTimeout(() => handleVerifyOtp(), 100);
                      }
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
  );

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

        {/* FORM PANEL DESKTOP */}
        <div 
          className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full z-20 items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            layoutMode === 'signup' ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          {formContent}
        </div>

        {/* MOBILE LAYOUT */}
        <div className="flex lg:hidden w-full h-full items-center justify-center bg-white relative z-20">
          {formContent}
        </div>

      </div>
    </div>
  );
};