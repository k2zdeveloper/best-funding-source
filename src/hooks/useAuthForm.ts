import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthFormOptions {
  initialMode: 'login' | 'signup';
  defaultRole: 'borrower' | 'lender';
}

const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = error.message?.toLowerCase() || String(error).toLowerCase();
  
  if (msg.includes('already_exists') || msg.includes('already registered')) return "Account already exists. Please sign in.";
  if (msg.includes('rate limit')) return "Too many requests. Please wait a minute.";
  if (msg.includes('invalid login credentials')) return "Incorrect email or password.";
  return error.message || "An unexpected system error occurred.";
};

export const useAuthForm = ({ initialMode, defaultRole }: AuthFormOptions) => {
  // We only use navigate for switching between /login and /signup URLs. 
  // We DO NOT use it for post-login routing anymore to prevent deadlocks.
  const navigate = useNavigate();

  // Layout & UI State
  const [layoutMode, setLayoutMode] = useState<'login' | 'signup'>(initialMode);
  const [formMode, setFormMode] = useState<'login' | 'signup'>(initialMode);
  const [currentRole, setCurrentRole] = useState<'borrower' | 'lender'>(defaultRole);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auth Form Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState(''); 
  const [loanAmount, setLoanAmount] = useState(''); 
  const [aum, setAum] = useState(''); 
  const [accredited, setAccredited] = useState(false); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Processing State
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Security & Rate Limiting State
  const [attempts, setAttempts] = useState(0);
  const [loginLockoutTimer, setLoginLockoutTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  // OTP State
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Timers Side-Effects ---
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

  // --- UI Handlers ---
  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    
    setErrorMsg(''); 
    setSuccessMsg(''); 
    setAuthStep('form');
    
    // Update URL strictly for UI navigation
    navigate(mode === 'signup' ? `/signup/${role || 'borrower'}` : '/login', { replace: true });

    if (window.innerWidth < 1024) {
      setLayoutMode(mode); 
      setFormMode(mode);
      if (role) setCurrentRole(role);
      return;
    }

    // Desktop Animation handling
    setIsAnimating(true); 
    setLayoutMode(mode); 
    setTimeout(() => { 
      setFormMode(mode); 
      if (role) setCurrentRole(role); 
    }, 400);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // --- Authentication Handlers ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockoutTimer > 0 || loading) return; 

    setErrorMsg(''); 
    setSuccessMsg('');
    const cleanEmail = email.trim().toLowerCase();
    
    if (formMode === 'signup' && password.length < 12) {
      return setErrorMsg('Password must be at least 12 characters.');
    }
    
    setLoading(true);
    let authSuccess = false; // Tracks if we successfully handed off to the AuthContext

    try {
      if (formMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail, 
          password,
          options: {
            data: {
              requested_role: currentRole, 
              company_name: companyName.trim(),
              ...(currentRole === 'borrower' 
                ? { revenue, loan_amount: loanAmount, industry } 
                : { aum, is_accredited: accredited }),
            }
          }
        });
        
        if (error) throw error;
        
        setSuccessMsg('Security code dispatched. Check your inbox.');
        setAuthStep('otp'); 
        setResendTimer(60);
        
      } else {
        // Login handles ALL users (Admins included)
        const { error } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        
        if (error) throw error;
        
        // --- THE FIX ---
        // We do NOT manually navigate here anymore.
        // Supabase triggers onAuthStateChange -> AuthContext updates user -> PublicOnlyRoute redirects.
        authSuccess = true;
      }
    } catch (error: any) {
      setErrorMsg(getFriendlyErrorMessage(error));
      
      // Handle brute-force protection
      if (formMode === 'login') {
        const newAttempts = attempts + 1; 
        setAttempts(newAttempts);
        if (newAttempts >= 5) setLoginLockoutTimer(60);
      }
    } finally {
      // Keep the spinner active if successful to prevent button flicker during redirect
      if (!authSuccess) {
        setLoading(false); 
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (loading) return; 
    
    setLoading(true); 
    setErrorMsg('');
    let otpSuccess = false;

    try {
      const { error } = await supabase.auth.verifyOtp({ 
        email: email.trim().toLowerCase(), 
        token: otpValues.join(''), 
        type: 'signup' 
      });
      
      if (error) throw error;
      
      // Successfully verified. Let AuthContext handle the routing naturally.
      otpSuccess = true;
      
    } catch (error: any) {
      setOtpValues(['', '', '', '', '', '', '', '']); 
      setErrorMsg(getFriendlyErrorMessage(error));
    } finally {
      if (!otpSuccess) {
        setLoading(false);
      }
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
      
      setSuccessMsg('A fresh security code has been dispatched.');
      setResendTimer(60); 
      setOtpValues(['', '', '', '', '', '', '', '']); 
    } catch (error: any) {
      setErrorMsg(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

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
      switchMode, handleEmailAuth, handleVerifyOtp, handleResendOtp
    }
  };
};