import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, LogIn, Send, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: 'borrower' | 'lender';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  initialMode = 'login', 
  defaultRole = 'borrower' 
}) => {
  const [layoutMode, setLayoutMode] = useState<'login' | 'signup'>(initialMode);
  const [formMode, setFormMode] = useState<'login' | 'signup'>(initialMode);
  
  const [currentRole, setCurrentRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const switchMode = (mode: 'login' | 'signup', role?: 'borrower' | 'lender') => {
    if (isAnimating) return; 
    
    setErrorMsg('');
    setSuccessMsg('');
    
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

    // Sleight of hand: swap text right as the panels cross at 400ms
    setTimeout(() => {
      setFormMode(mode);
      if (role) setCurrentRole(role);
    }, 400);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setNeedsVerification(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password; 

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    if (formMode === 'signup' && cleanPassword.length < 8) {
      setErrorMsg('For enterprise security, passwords must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { data: { role: currentRole } }
        });
        if (error) throw error;
        
        setSuccessMsg('Registration successful. Check your email to activate.');
        setNeedsVerification(true);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: cleanEmail, 
          password: cleanPassword,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setNeedsVerification(true);
            throw new Error('Please verify your email address before logging in.');
          }
          throw error;
        }

        setSuccessMsg('Authenticating securely...');
        
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const dashboardRoutes: Record<string, string> = {
              super_admin: '/admin-dashboard',
              admin: '/admin-dashboard',
              lender: '/lender-dashboard',
              borrower: '/borrower-dashboard'
            };
            window.location.href = dashboardRoutes[profile.role] || '/dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
      setSuccessMsg('A new verification link has been sent.');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to resend verification email.');
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
        options: { redirectTo: window.location.origin + '/dashboard' }
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || `Failed to authenticate with ${provider}.`);
      setLoading(false);
    }
  };

  // Reusable, highly refined compact Form Component
  const FormContent = () => (
    <div className="w-full max-w-[360px] px-4">
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">
          Enterprise<span className="text-blue-600">Funding</span>
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mb-1">
          {formMode === 'signup' ? `Partner as ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}` : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Enter your credentials to access the secure portal.
        </p>
      </div>

      {errorMsg && (
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

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Corporate Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium shadow-sm"
                placeholder="you@company.com" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium shadow-sm"
                placeholder="••••••••" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading || isAnimating}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-2 rounded-lg shadow-md shadow-blue-600/20 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-wide uppercase"
        >
          {loading ? 'Authenticating...' : (formMode === 'signup' ? 'Create Account' : 'Access Portal')}
          {!loading && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      {needsVerification && (
        <div className="mt-4 flex justify-center">
          <button onClick={handleResendVerification} disabled={loading || !email}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <Send className="w-3.5 h-3.5" />
            Resend email
          </button>
        </div>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.2em]">
            <span className="px-2 bg-white text-slate-400">Authenticate Via</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => handleOAuthLogin('google')} disabled={loading || isAnimating}
            className="w-full inline-flex justify-center py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all shadow-sm">
            Google
          </button>
          <button onClick={() => handleOAuthLogin('azure')} disabled={loading || isAnimating}
            className="w-full inline-flex justify-center py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all shadow-sm">
            Microsoft
          </button>
        </div>
      </div>

      <div className="mt-8 text-center flex flex-col gap-1.5">
        {formMode === 'login' && (
          <span className="text-xs font-medium text-slate-500">
            Need an account?{' '}
            <button type="button" onClick={() => switchMode('signup', 'borrower')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Apply</button>
            {' '}or{' '}
            <button type="button" onClick={() => switchMode('signup', 'lender')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Partner</button>
          </span>
        )}
        {formMode === 'signup' && (
          <span className="text-xs font-medium text-slate-500">
            Already have an account?{' '}
            <button type="button" onClick={() => switchMode('login')} disabled={isAnimating} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Sign in</button>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      
      {/* THE FLOATING ENTERPRISE CARD 
        Locked height, crisp shadow, no scrolling required.
      */}
      <div className="relative w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* BRAND PANEL (Z-30) */}
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

        {/* FORM PANEL (Z-20) */}
        <div 
          className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full z-20 items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            layoutMode === 'signup' ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <FormContent />
        </div>

        {/* MOBILE LAYOUT (Only visible on small screens) */}
        <div className="flex lg:hidden w-full h-full items-center justify-center bg-white relative z-20 py-8 overflow-y-auto">
          <FormContent />
        </div>

      </div>
    </div>
  );
};