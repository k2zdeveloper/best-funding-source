// src/components/auth/portal/useAuthLogic.ts
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export const useAuthLogic = (initialMode: 'login' | 'signup', defaultRole: 'borrower' | 'lender') => {
  const navigate = useNavigate();
  
  // View State
  const [layoutMode, setLayoutMode] = useState<'login' | 'signup'>(initialMode);
  const [formMode, setFormMode] = useState<'login' | 'signup'>(initialMode);
  const [currentRole, setCurrentRole] = useState(defaultRole);
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [aum, setAum] = useState('');
  const [accredited, setAccredited] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // System State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loginLockoutTimer, setLoginLockoutTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const lastSubmitTime = useRef<number>(0);

  // Timers
  useEffect(() => {
    const resendInt = resendTimer > 0 ? setInterval(() => setResendTimer(p => p - 1), 1000) : undefined;
    const lockoutInt = loginLockoutTimer > 0 ? setInterval(() => setLoginLockoutTimer(p => p - 1), 1000) : undefined;
    return () => { clearInterval(resendInt); clearInterval(lockoutInt); };
  }, [resendTimer, loginLockoutTimer]);

  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    setErrorMsg(''); setSuccessMsg(''); setAuthStep('form'); setOtpValues(Array(8).fill(''));
    window.history.pushState({}, '', mode === 'signup' ? `/signup/${role || 'borrower'}` : '/login');

    if (window.innerWidth < 1024) {
      setLayoutMode(mode); setFormMode(mode); if (role) setCurrentRole(role);
      return;
    }

    setIsAnimating(true); setLayoutMode(mode); 
    setTimeout(() => { setFormMode(mode); if (role) setCurrentRole(role); }, 400);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // FIXED: Passes the user object directly to prevent database race conditions
  const routeUserToDashboard = async (user: any) => {
    try {
      // 1. Safest/Fastest: Read directly from the auth metadata we just received
      let finalRole = user?.user_metadata?.role;

      // 2. Fallback: Check DB if metadata isn't synced
      if (!finalRole) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role) finalRole = profile.role;
      }

      // 3. Route cleanly
      switch (finalRole) {
        case 'super_admin':
        case 'admin': navigate('/admin-dashboard', { replace: true }); break;
        case 'lender': navigate('/lender-dashboard', { replace: true }); break;
        case 'borrower': navigate('/borrower-dashboard', { replace: true }); break;
        default: navigate('/dashboard', { replace: true }); // FIXED: Safely push to AuthRedirector
      }
    } catch (err) {
      navigate('/dashboard', { replace: true }); // FIXED
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockoutTimer > 0) return; 

    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return setErrorMsg('Whoa, that was fast! Please wait a second.');
    lastSubmitTime.current = now;

    setErrorMsg(''); setSuccessMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) return setErrorMsg('Please fill in both fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setErrorMsg("Invalid email format.");

    if (formMode === 'signup') {
      if (password.length < 12) return setErrorMsg('Passwords must be at least 12 characters.');
      if (!agreeTerms) return setErrorMsg('Please accept the Terms of Service.');
      if (!companyName) return setErrorMsg("Company Name is required.");
      if (currentRole === 'borrower' && (!revenue || !loanAmount)) return setErrorMsg('Revenue and Loan Target required.');
      if (currentRole === 'lender' && (!aum || !accredited)) return setErrorMsg('AUM and Accreditation required.');
    }

    setLoading(true);

    try {
      if (formMode === 'signup') {
        const metadata = {
          role: currentRole, company_name: companyName, industry,
          ...(currentRole === 'borrower' ? { revenue, loan_amount: loanAmount } : { aum, is_accredited: accredited }),
          terms_agreed_at: new Date().toISOString(),
        };

        const { error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: metadata } });
        if (error) throw error;
        
        setSuccessMsg('We sent an 8-digit secure code to your email.');
        setAuthStep('otp'); setResendTimer(60);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            await supabase.auth.resend({ type: 'signup', email: cleanEmail });
            setAuthStep('otp'); setResendTimer(60);
            throw new Error("Please verify your email first! We sent a new code.");
          }
          throw error;
        }

        setSuccessMsg("Verified! Bringing you to your dashboard...");
        setAttempts(0); 
        if (data.user) await routeUserToDashboard(data.user); // FIXED: Passing user directly
      }
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) { setLoginLockoutTimer(60); setErrorMsg(''); } 
      else { setErrorMsg(error.message.includes('invalid login') ? "Invalid email or password." : error.message); }
      setLoading(false);
    } 
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpValues.join('').length !== 8) return setErrorMsg("Please enter all 8 numbers.");

    setLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otpValues.join(''), type: 'signup' });
      if (error) throw error;

      setSuccessMsg("Code accepted! Securing session...");
      setAttempts(0);
      if (data.user) await routeUserToDashboard(data.user);
    } catch (error: any) {
      setErrorMsg("That code didn't work. It might be expired.");
      setOtpValues(Array(8).fill(''));
      setLoading(false); 
    } 
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true); setErrorMsg(''); setSuccessMsg(''); 
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
      if (error) {
        if (error.status === 429 || error.message.includes('rate limit')) {
          setResendTimer(60); setErrorMsg('RATE_LIMIT'); setLoading(false); return;
        }
        throw error;
      }
      setSuccessMsg('A new 8-digit code has been sent!');
      setResendTimer(60); setOtpValues(Array(8).fill('')); 
    } catch (error: any) {
      setErrorMsg("Failed to send code. Please try again.");
    } finally { setLoading(false); }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(true); setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + '/dashboard' } });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(`Connection failed. Please try again.`);
      setLoading(false);
    }
  };

  return {
    state: { layoutMode, formMode, currentRole, authStep, isAnimating, email, password, otpValues, companyName, industry, revenue, loanAmount, aum, accredited, agreeTerms, loading, errorMsg, successMsg, loginLockoutTimer, resendTimer },
    setters: { setEmail, setPassword, setOtpValues, setCompanyName, setIndustry, setRevenue, setLoanAmount, setAum, setAccredited, setAgreeTerms, setAuthStep },
    handlers: { switchMode, handleEmailAuth, handleVerifyOtp, handleResendOtp, handleOAuthLogin }
  };
};