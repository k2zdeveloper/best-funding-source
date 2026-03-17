import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface BrandPanelProps {
  layoutMode: 'login' | 'signup';
}

export const BrandPanel: React.FC<BrandPanelProps> = ({ layoutMode }) => {
  return (
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
  );
};