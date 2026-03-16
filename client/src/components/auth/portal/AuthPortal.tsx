// src/components/auth/AuthPortal.tsx
import React from 'react';
import { useAuthLogic } from './portal/useAuthLogic';
import { BrandSidebar } from './portal/BrandSidebar';
import { AuthForm } from './portal/AuthForm';

interface AuthPortalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: 'borrower' | 'lender';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialMode = 'login', defaultRole = 'borrower' }) => {
  // Pulls all logic, state, and handlers from the custom hook
  const authLogic = useAuthLogic(initialMode, defaultRole);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="relative w-full max-w-5xl h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Branding */}
        <BrandSidebar layoutMode={authLogic.state.layoutMode} />
        
        {/* Right Side: Form (Desktop Layout) */}
        <div className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full z-20 items-center justify-center bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${authLogic.state.layoutMode === 'signup' ? 'translate-x-full' : 'translate-x-0'}`}>
          <AuthForm {...authLogic} />
        </div>

        {/* Full Form (Mobile Layout) */}
        <div className="flex lg:hidden w-full h-full items-center justify-center bg-white relative z-20">
          <AuthForm {...authLogic} />
        </div>

      </div>
    </div>
  );
};