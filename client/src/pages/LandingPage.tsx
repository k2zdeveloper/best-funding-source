import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, TrendingUp, Lock, ArrowUpRight, BarChart3 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="animate-in fade-in duration-700 bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[95vh] min-h-[700px] flex items-center px-6 lg:px-20 overflow-hidden bg-slate-950">
        {/* Background Image & Gradients */}
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Corporate Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
        
        <div className="relative z-20 flex flex-col items-start text-left max-w-5xl w-full mt-12">
          
          {/* Premium Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-2xl">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Trusted Institutional Capital</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[84px] font-serif font-bold text-white leading-[1.05] tracking-tight mb-6 drop-shadow-sm">
            Strategic Capital <br />
            <span className="text-slate-400 italic font-light">for the Middle Market.</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed font-light tracking-wide">
            BestFundingSource provides tailored debt facilities and growth capital designed exclusively for established commercial, industrial, and retail operations looking to scale without friction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/apply" 
              className="px-8 py-4 bg-white text-slate-950 rounded-lg font-semibold hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.98]"
            >
              Get Pre-Qualified <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/services" 
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-lg font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm tracking-wide backdrop-blur-sm"
            >
              Explore Solutions
            </Link>
          </div>
        </div>
      </div>

      {/* --- OVERLAPPING STATS BAR --- */}
      <div className="relative z-30 -mt-20 max-w-7xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/5 p-8 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-slate-200/60">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">$500M+</div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Capital Deployed</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">Up to $50M</div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Facility Sizes</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">24 Hrs</div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Initial Terms</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">98%</div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.15em]">Client Retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- INFRASTRUCTURE / SERVICES SECTION --- */}
      <section id="infrastructure" className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 tracking-tight">Frictionless Capital Injection.</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                We bypass traditional banking bureaucracy to provide liquidity when your operation needs it most, operating on a foundation of bank-grade security and absolute discretion.
              </p>
            </div>
            <Link to="/process" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors pb-2 border-b-2 border-slate-900 hover:border-slate-600">
              View our underwriting process <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {/* Feature Card 1 */}
            <div className="group bg-white p-10 rounded-2xl border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-slate-900/20 group-hover:-translate-y-1 transition-transform duration-500">
                <Zap className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">Accelerated Underwriting</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed font-light relative z-10">
                Proprietary risk assessment models allow us to issue term sheets in days, not months. Zero hard credit pulls during initial intake.
              </p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group bg-white p-10 rounded-2xl border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-slate-900/20 group-hover:-translate-y-1 transition-transform duration-500">
                <BarChart3 className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">Growth-Oriented Debt</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed font-light relative z-10">
                Facilities structured specifically around your cash flow cycle, ensuring our capital acts as a catalyst for expansion rather than a constraint.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white p-10 rounded-2xl border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-slate-900/20 group-hover:-translate-y-1 transition-transform duration-500">
                <Lock className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">Institutional Security</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed font-light relative z-10">
                Your financial data is protected via 256-bit AES encryption. We maintain strict, uncompromising confidentiality throughout the exploratory process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODERN MINIMALIST CTA --- */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        {/* Soft Glowing Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-slate-800/50 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white tracking-tight">Ready to scale your operation?</h2>
          <p className="text-slate-400 mb-12 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Join hundreds of middle-market enterprises that have successfully leveraged our institutional capital to aggressively capture market share.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => navigate('/apply')}
              className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] inline-flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Start Secure Application <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-10 py-4 bg-transparent text-white border border-slate-700 rounded-lg font-medium hover:bg-slate-900 transition-all inline-flex items-center justify-center gap-2"
            >
              Speak with an Advisor
            </button>
          </div>
        </div>
      </section>
      
    </main>
  );
};