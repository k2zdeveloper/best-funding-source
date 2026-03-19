import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MAIN_NAV_LINKS } from './navConfig';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  // Automatically close the mobile menu whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-[96px] left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300">
      <div className="px-6 py-6 space-y-6 flex flex-col">
        
        {/* Nav Links */}
        <div className="flex flex-col space-y-4">
          {MAIN_NAV_LINKS.map((link) => (
            <Link 
              key={link.href}
              to={link.href}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="h-px w-full bg-white/10" aria-hidden="true"></div>
        
        {/* Auth Actions */}
        <div className="flex flex-col space-y-4 pt-2">
          <Link 
            to="/login" 
            className="w-full text-center text-base font-medium text-slate-300 hover:text-white py-3 border border-white/10 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/signup/borrower" 
            className="w-full text-center text-base font-semibold py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl transition-all shadow-md"
          >
            Apply as Borrower
          </Link>
          <Link 
            to="/signup/lender" 
            className="w-full text-center text-base font-semibold py-3 bg-transparent border border-slate-700 text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            Partner as Lender
          </Link>
        </div>

      </div>
    </div>
  );
};