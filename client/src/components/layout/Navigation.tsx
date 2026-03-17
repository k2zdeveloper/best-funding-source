import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* --- LOGO AREA --- */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Enterprise<span className="text-slate-400">Funding</span>
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Subtle Navigation Links */}
            <div className="flex items-center space-x-6 mr-4">
              <Link 
                to="/apply" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Intake Form
              </Link>
              <Link 
                to="/services" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Solutions
              </Link>
            </div>
            
            {/* Vertical Divider */}
            <div className="h-6 w-px bg-white/10" aria-hidden="true"></div>
            
            {/* Auth Navigation */}
            <div className="flex items-center gap-5 pl-2">
              <Link 
                to="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/signup/borrower" 
                  className="text-sm font-semibold px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  Apply as Borrower
                </Link>
                <Link 
                  to="/signup/lender" 
                  className="text-sm font-semibold px-5 py-2.5 bg-transparent border border-slate-700 text-white hover:bg-slate-800 rounded-lg transition-all active:scale-[0.98]"
                >
                  Partner as Lender
                </Link>
              </div>
            </div>
            
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden flex items-center">
            <button 
              type="button" 
              className="text-slate-300 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
              aria-label="Open main menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
};