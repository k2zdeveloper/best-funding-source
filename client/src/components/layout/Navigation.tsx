import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { MAIN_NAV_LINKS } from './navigation/navConfig';
import { MobileMenu } from './navigation/MobileMenu';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- PREMIUM UX: Scroll Detection ---
  // Transforms the navbar from transparent to frosted-glass when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* --- LOGO AREA --- */}
          <div className="flex-shrink-0 flex items-center z-50">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1">
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
            
            {/* Dynamic Links */}
            <div className="flex items-center space-x-6 mr-4">
              {MAIN_NAV_LINKS.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Vertical Divider */}
            <div className="h-6 w-px bg-white/10" aria-hidden="true"></div>
            
            {/* Auth Navigation */}
            <div className="flex items-center gap-5 pl-2">
              <Link 
                to="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
              >
                Sign In
              </Link>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/signup/borrower" 
                  className="text-sm font-semibold px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Apply as Borrower
                </Link>
                <Link 
                  to="/signup/lender" 
                  className="text-sm font-semibold px-5 py-2.5 bg-transparent border border-slate-700 text-white hover:bg-slate-800 rounded-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Partner as Lender
                </Link>
              </div>
            </div>
          </div>

          {/* --- MOBILE MENU TOGGLE --- */}
          <div className="md:hidden flex items-center z-50">
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7 animate-in spin-in-90 duration-300" />
              ) : (
                <Menu className="h-7 w-7 animate-in spin-in-[-90deg] duration-300" />
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* --- MOBILE DROPDOWN --- */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
    </nav>
  );
};