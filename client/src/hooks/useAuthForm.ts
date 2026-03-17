import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthFormOptions {
  initialMode: 'login' | 'signup';
  defaultRole: 'borrower' | 'lender';
}

const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = error.message?.toLowerCase() || error.toString().toLowerCase();
  
  if (msg.includes('already_exists') || msg.includes('already registered')) return "Account already exists. Please sign in.";
  if (msg.includes('rate limit')) return "Too many requests. Please wait a minute.";
  if (msg.includes('invalid login credentials')) return "Incorrect email or password.";
  return error.message || "An unexpected system error occurred.";
};

export const useAuthForm = ({ initialMode, defaultRole }: AuthFormOptions) => {
  const navigate = useNavigate();

  // Layout & Routing State
  const [layoutMode, setLayoutMode] = useState<'login' | 'signup'>(initialMode);
  const [formMode, setFormMode] = useState<'login' | 'signup'>(initialMode);
  const [currentRole, setCurrentRole] = useState(defaultRole);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auth Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState(''); 
  const [loanAmount, setLoanAmount] = useState(''); 
  const [aum, setAum] = useState(''); 
  const [accredited, setAccredited] = useState(false); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Process State
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loginLockoutTimer, setLoginLockoutTimer] = useState(0);

  // OTP State
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);

  const routeUserToDashboard = useCallback((user: any) => {
    const rawRole = user?.user_metadata?.requested_role || user?.user_metadata?.role || 'borrower';
    const routes: Record<string, string> = {
      super_admin: '/admin-dashboard',
      admin: '/admin-dashboard',
      lender: '/lender-dashboard',
      borrower: '/borrower-dashboard'
    };
    navigate(routes[rawRole.toLowerCase().trim()] || '/borrower-dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) routeUserToDashboard(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) routeUserToDashboard(session.user);
    });
    return () => subscription.unsubscribe();
  }, [routeUserToDashboard]);

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

  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    setErrorMsg(''); setSuccessMsg(''); setAuthStep('form');
    navigate(mode === 'signup' ? `/signup/${role || 'borrower'}` : '/login', { replace: true });

    if (window.innerWidth < 1024) {
      setLayoutMode(mode); setFormMode(mode);
      if (role) setCurrentRole(role);
      return;
    }

    setIsAnimating(true); setLayoutMode(mode); 
    setTimeout(() => { setFormMode(mode); if (role) setCurrentRole(role); }, 400);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockoutTimer > 0 || loading) return; 

    setErrorMsg(''); setSuccessMsg('');
    const cleanEmail = email.trim().toLowerCase();
    
    if (formMode === 'signup' && password.length < 12) return setErrorMsg('Password must be at least 12 characters.');
    
    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail, password,
          options: {
            data: {
              requested_role: currentRole,
              company_name: companyName.trim(),
              ...(currentRole === 'borrower' ? { revenue, loan_amount: loanAmount } : { aum, is_accredited: accredited }),
            }
          }
        });
        if (error) throw error;
        setSuccessMsg('Security code dispatched. Check your inbox.');
        setAuthStep('otp'); setResendTimer(60);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        routeUserToDashboard(data.user);
      }
    } catch (error: any) {
      setErrorMsg(getFriendlyErrorMessage(error));
      if (formMode === 'login') {
        const newAttempts = attempts + 1; setAttempts(newAttempts);
        if (newAttempts >= 5) setLoginLockoutTimer(60);
      }
    } finally {
      setLoading(false); 
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (loading) return; 
    setLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otpValues.join(''), type: 'signup' });
      if (error) throw error;
      routeUserToDashboard(data.user);
    } catch (error: any) {
      setOtpValues(['', '', '', '', '', '', '', '']); 
      setErrorMsg(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true); setErrorMsg('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
      if (error) throw error;
      setSuccessMsg('A fresh security code has been dispatched.');
      setResendTimer(60); setOtpValues(['', '', '', '', '', '', '', '']); 
    } catch (error: any) {
      setErrorMsg(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    if (loading) return;
    setLoading(true); setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: window.location.origin + '/dashboard', 
          queryParams: { intended_role: currentRole }
        } 
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Expose only what the UI needs to render
  return {
    state: {
      layoutMode, formMode, currentRole, authStep, isAnimating,
      email, password, companyName, industry, revenue, loanAmount, aum, accredited, agreeTerms,
      loading, errorMsg, successMsg, loginLockoutTimer,
      otpValues, otpRefs, resendTimer
    },
    setters: {
      setEmail, setPassword, setCompanyName, setIndustry, setRevenue, setLoanAmount, setAum, setAccredited, setAgreeTerms,
      setOtpValues, setAuthStep
    },
    handlers: {
      switchMode, handleEmailAuth, handleVerifyOtp, handleResendOtp, handleOAuthLogin
    }
  };
};