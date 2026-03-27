import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

// IMPORT YOUR LOGO HERE to make it consistent across the app
import logo from '../../assets/logo.png';

interface BrandPanelProps {
  layoutMode: 'login' | 'signup';
}

export const BrandPanel: React.FC<BrandPanelProps> = ({ layoutMode }) => {
  return (
    <div 
      // Changed background to Brand Navy
      className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full z-30 flex-col justify-between bg-[#0A2235] p-10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
        layoutMode === 'signup' ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Corporate Building" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none" />
      
      {/* Updated Gradient to use Brand Navy */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2235] via-[#0A2235]/90 to-[#0A2235]/40 z-10 pointer-events-none"></div>
      
      <div className="relative z-20 flex items-center gap-2">
        {/* --- ACTUAL LOGO INTEGRATION --- */}
        {/* I styled this to match the clean white capsule we built for your Navigation! */}
        <div className="flex items-center justify-center h-12 px-3 bg-white rounded-full overflow-hidden shadow-lg shadow-[#0A2235]/50">
          <img 
            src={logo} 
            alt="Best Funding Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        
        {/* If you prefer text instead of the image, you can delete the capsule above and uncomment this: */}
        {/* <div className="bg-[#1B6FA5] p-2 rounded-xl shadow-lg shadow-[#0A2235]/50">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">
          Best<span className="text-[#21B0A6]">Funding</span>
        </span> 
        */}
      </div>

      <div className="relative z-20 max-w-sm mb-4">
        {/* Updated Badge: Soft Blue background, Teal border, Teal text */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B6FA5]/20 border border-[#21B0A6]/30 text-[#21B0A6] text-[9px] font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
          <Lock className="w-3 h-3" />
          <span>AES-256 Encrypted</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white leading-[1.1] mb-4 drop-shadow-lg">
          Strategic Capital <br />
          {/* Changed accent text to Brand Teal */}
          <span className="text-[#21B0A6] italic font-light">for the Middle Market.</span>
        </h1>
        
        {/* Softened the paragraph text color to read well against the Navy background */}
        <p className="text-slate-300 font-light leading-relaxed text-xs">
          Institutional liquidity backed by rigorous security protocols. All data transfers strictly conform to enterprise compliance standards.
        </p>
      </div>
    </div>
  );
};