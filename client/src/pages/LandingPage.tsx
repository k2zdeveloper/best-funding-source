import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, TrendingUp, Lock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="animate-fade-in bg-slate-50">
      <div className="relative w-full h-[90vh] min-h-[600px] flex items-end pb-16 md:pb-24 px-6 md:px-16 overflow-hidden bg-blue-950">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Corporate Building" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-transparent z-10"></div>
        
        <div className="relative z-20 flex flex-col items-start text-left max-w-4xl w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-200 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trusted Institutional Capital</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.1] mb-4 drop-shadow-lg">
            Strategic Capital <br />
            <span className="text-blue-400 italic font-light">for the Middle Market.</span>
          </h1>
          
          <p className="text-sm md:text-base text-blue-100 mb-8 max-w-lg leading-relaxed font-light opacity-90">
            Tailored debt facilities and growth capital designed exclusively for established commercial, industrial, and retail operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/apply" 
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              Get Pre-Qualified <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 relative z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
          <div>
            <div className="text-2xl md:text-3xl font-serif font-bold text-blue-900 mb-1">$500M+</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Capital Deployed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-serif font-bold text-blue-900 mb-1">Up to $50M</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Facility Sizes</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-serif font-bold text-blue-900 mb-1">24 Hrs</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Initial Terms</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-serif font-bold text-blue-600 mb-1">98%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Client Retention</div>
          </div>
        </div>
      </div>

      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-blue-900 mb-4">Frictionless Capital Injection</h2>
            <p className="text-slate-600">We bypass traditional banking bureaucracy to provide liquidity when your operation needs it most, backed by bank-grade security.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Accelerated Underwriting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Proprietary risk assessment models allow us to issue term sheets in days, not months. No hard credit pulls during initial intake.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Growth-Oriented Debt</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Facilities structured around your cash flow cycle, ensuring our capital acts as a catalyst for expansion rather than a constraint.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Institutional Security</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Your financial data is protected via 256-bit AES encryption. We maintain strict confidentiality throughout the exploratory process.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to scale your operation?</h2>
          <p className="text-blue-200 mb-10 text-lg max-w-2xl mx-auto">Join hundreds of middle-market enterprises that have leveraged our capital to capture market share.</p>
          <button 
            onClick={() => navigate('/apply')}
            className="px-10 py-4 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95 inline-flex items-center gap-2"
          >
            Start Secure Application <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </main>
  );
};