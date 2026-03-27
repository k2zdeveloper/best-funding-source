import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Removed ShieldCheck
import { MAIN_NAV_LINKS } from './navigation/navConfig';
import { MobileMenu } from './navigation/MobileMenu';

// IMPORT YOUR LOGO HERE (Adjust the path if your folders are different)
import logo from '../../assets/logoBFS.png';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          // FIX: Changed from bg-[#1B6FA5]/80 to bg-white/95 so the dark blue text remains visible!
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#1B6FA5]/10 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* --- LOGO AREA --- */}
         {/* --- LOGO AREA --- */}
          <div className="flex-shrink-0 flex items-center z-50">
            <Link 
              to="/" 
              // 1. bg-white gives a solid white background.
              // 2. Removed the 'border' and 'border-[...]' classes.
              className="relative flex items-center justify-center h-14 px-4 bg-white rounded-full overflow-hidden group shadow-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
            >
              <img 
                src={logo} 
                alt="Best Funding Logo" 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6 mr-4">
              {MAIN_NAV_LINKS.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="text-sm font-medium text-[#1B6FA5] hover:text-[#21B0A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6] rounded-md px-2 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="h-6 w-px bg-[#1B6FA5]/10" aria-hidden="true"></div>
            
            <div className="flex items-center gap-5 pl-2">
              <Link 
                to="/login" 
                className="text-sm font-medium text-[#1B6FA5] hover:text-[#21B0A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6] rounded-md px-2 py-1"
              >
                Sign In
              </Link>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/signup/borrower" 
                  className="text-sm font-semibold px-5 py-2.5 bg-[#21B0A6] text-white hover:bg-[#1B6FA5] rounded-lg transition-all shadow-[0_0_15px_rgba(33,176,166,0.1)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#1B6FA5]"
                >
                  Apply as Borrower
                </Link>
                <Link 
                  to="/signup/lender" 
                  className="text-sm font-semibold px-5 py-2.5 bg-transparent border border-[#1B6FA5] text-[#1B6FA5] hover:bg-[#1B6FA5]/10 rounded-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#1B6FA5]"
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
              className="text-[#1B6FA5] hover:text-[#21B0A6] p-2 transition-colors rounded-lg hover:bg-[#21B0A6]/5 focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
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

      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
    </nav>
  );
};