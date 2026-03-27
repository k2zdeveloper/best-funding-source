import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, TrendingUp, Lock, ArrowUpRight, BarChart3 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="animate-in fade-in duration-700 bg-white font-sans text-slate-900 selection:bg-[#21B0A6] selection:text-white">
      
      {/* --- HERO SECTION --- */}
      {/* Changed background to a deep version of your brand blue to look premium */}
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[95vh] min-h-[700px] flex items-center px-6 lg:px-20 overflow-hidden bg-[#0A2235]">
        {/* Background Image & Gradients (Unchanged) */}
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Corporate Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2235] via-[#0A2235]/90 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0A2235] to-transparent z-10"></div>
        
        {/* THE FIX IS HERE: Added `pt-28 md:pt-0` to push content down on mobile */}
        <div className="relative z-20 flex flex-col items-start text-left max-w-5xl w-full pt-35 md:pt-0 mt-4 md:mt-12">
          
          {/* Premium Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#21B0A6]/30 text-[#21B0A6] text-[11px] font-semibold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(33,176,166,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trusted Institutional Capital</span>
          </div>

          {/* ... Rest of your hero content stays exactly the same ... */}
          
          <h1 className="text-5xl md:text-6xl lg:text-[84px] font-serif font-bold text-white leading-[1.05] tracking-tight mb-6 drop-shadow-sm">
            Strategic Capital <br />
            {/* Updated accent text to a soft teal to bridge the blue and teal brand colors */}
            <span className="text-[#21B0A6] italic font-light">for the Middle Market.</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed font-light tracking-wide">
            BestFundingSource provides tailored debt facilities and growth capital designed exclusively for established commercial, industrial, and retail operations looking to scale without friction.
          </p>
          
          {/* Mobile-responsive button group */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/apply" 
              // Styled with your primary Teal, hovering into your brand Blue
              className="px-8 py-4 bg-[#21B0A6] text-white rounded-lg font-semibold hover:bg-[#1B6FA5] transition-all shadow-[0_0_20px_rgba(33,176,166,0.2)] flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#0A2235]"
            >
              Get Pre-Qualified <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/services" 
              // Outlined style using brand Blue
              className="px-8 py-4 bg-[#1B6FA5]/10 text-white border border-[#1B6FA5]/50 rounded-lg font-medium hover:bg-[#1B6FA5]/30 hover:border-[#1B6FA5] transition-all flex items-center justify-center gap-2 text-sm tracking-wide backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#0A2235]"
            >
              Explore Solutions
            </Link>
          </div>
        </div>
      </div>

      {/* --- OVERLAPPING STATS BAR --- */}
      <div className="relative z-30 -mt-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white/95 backdrop-blur-xl border border-[#1B6FA5]/10 rounded-2xl shadow-2xl shadow-[#1B6FA5]/5 p-6 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-[#1B6FA5]/10">
            {/* Applied Brand Blue to the numbers, and a muted slate to labels to keep it professional */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl md:text-4xl font-serif font-bold text-[#1B6FA5] mb-1 md:mb-2">$500M+</div>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em]">Capital Deployed</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl md:text-4xl font-serif font-bold text-[#1B6FA5] mb-1 md:mb-2">Up to $50M</div>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em]">Facility Sizes</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl md:text-4xl font-serif font-bold text-[#1B6FA5] mb-1 md:mb-2">24 Hrs</div>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em]">Initial Terms</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl md:text-4xl font-serif font-bold text-[#1B6FA5] mb-1 md:mb-2">98%</div>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em]">Client Retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- INFRASTRUCTURE / SERVICES SECTION --- */}
      <section id="infrastructure" className="py-24 md:py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1B6FA5] mb-4 md:mb-6 tracking-tight">Frictionless Capital Injection.</h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-light">
                We bypass traditional banking bureaucracy to provide liquidity when your operation needs it most, operating on a foundation of bank-grade security and absolute discretion.
              </p>
            </div>
            <Link to="/process" className="inline-flex items-center gap-2 text-sm font-semibold text-[#21B0A6] hover:text-[#1B6FA5] transition-colors pb-1 md:pb-2 border-b-2 border-[#21B0A6]/30 hover:border-[#1B6FA5] focus:outline-none">
              View our underwriting process <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {/* Feature Cards: Using a soft blue background for icons and teal for the actual icon */}
            {[
              { title: 'Accelerated Underwriting', icon: Zap, desc: 'Proprietary risk assessment models allow us to issue term sheets in days, not months. Zero hard credit pulls during initial intake.' },
              { title: 'Growth-Oriented Debt', icon: BarChart3, desc: 'Facilities structured specifically around your cash flow cycle, ensuring our capital acts as a catalyst for expansion rather than a constraint.' },
              { title: 'Institutional Security', icon: Lock, desc: 'Your financial data is protected via 256-bit AES encryption. We maintain strict, uncompromising confidentiality throughout the exploratory process.' }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-8 md:p-10 rounded-2xl border border-[#1B6FA5]/10 hover:border-[#21B0A6]/50 shadow-sm hover:shadow-xl hover:shadow-[#1B6FA5]/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 bg-[#1B6FA5]/10 text-[#21B0A6] rounded-xl flex items-center justify-center mb-6 md:mb-8 relative z-10 group-hover:-translate-y-1 group-hover:bg-[#21B0A6] group-hover:text-white transition-all duration-500">
                  <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1B6FA5] mb-3 md:mb-4 relative z-10">{feature.title}</h3>
                <p className="text-[14px] md:text-[15px] text-slate-600 leading-relaxed font-light relative z-10">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MODERN MINIMALIST CTA --- */}
      {/* Changed background to solid brand blue to anchor the bottom of the page */}
      <section className="py-20 md:py-24 relative overflow-hidden bg-[#1B6FA5]">
        {/* Soft Teal Glowing Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-[#21B0A6]/40 rounded-full blur-[100px] md:blur-[120px] opacity-60 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 md:mb-6 text-white tracking-tight">Ready to scale your operation?</h2>
          <p className="text-[#e2f1f8] mb-10 md:mb-12 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Join hundreds of middle-market enterprises that have successfully leveraged our institutional capital to aggressively capture market share.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => navigate('/apply')}
              className="w-full sm:w-auto px-8 md:px-10 py-4 bg-[#21B0A6] text-white rounded-lg font-bold hover:bg-white hover:text-[#1B6FA5] transition-all shadow-[0_0_30px_rgba(33,176,166,0.4)] inline-flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B6FA5]"
            >
              Start Secure Application <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-8 md:px-10 py-4 bg-transparent text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 hover:border-white transition-all inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B6FA5]"
            >
              Speak with an Advisor
            </button>
          </div>
        </div>
      </section>
      
    </main>
  );
};