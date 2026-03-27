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
    // Changed to a white background with a soft shadow to match the clean aesthetic
    <div className="md:hidden absolute top-[96px] left-0 w-full bg-white border-b border-[#1B6FA5]/10 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40">
      <div className="px-6 py-6 space-y-6 flex flex-col">
        
        {/* Nav Links */}
        <div className="flex flex-col space-y-2">
          {MAIN_NAV_LINKS.map((link) => (
            <Link 
              key={link.href}
              to={link.href}
              // Updated to your brand blue and teal hover state
              className="text-lg font-medium text-[#1B6FA5] hover:text-[#21B0A6] transition-colors p-2 -ml-2 rounded-lg hover:bg-[#1B6FA5]/5 focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Divider */}
        <div className="h-px w-full bg-[#1B6FA5]/10" aria-hidden="true"></div>
        
        {/* Auth Actions */}
        <div className="flex flex-col space-y-4 pt-2">
          <Link 
            to="/login" 
            className="w-full text-center text-base font-medium text-[#1B6FA5] hover:text-[#21B0A6] py-3 border border-[#1B6FA5]/20 hover:bg-[#1B6FA5]/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
          >
            Sign In
          </Link>
          <Link 
            to="/signup/borrower" 
            // Matched the teal background from the desktop 'Apply as Borrower' button
            className="w-full text-center text-base font-semibold py-3 bg-[#21B0A6] text-white hover:bg-[#1B6FA5] rounded-xl transition-all shadow-[0_0_15px_rgba(33,176,166,0.15)] focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2"
          >
            Apply as Borrower
          </Link>
          <Link 
            to="/signup/lender" 
            // Matched the blue outlined style from the desktop 'Partner as Lender' button
            className="w-full text-center text-base font-semibold py-3 bg-transparent border border-[#1B6FA5] text-[#1B6FA5] hover:bg-[#1B6FA5]/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2"
          >
            Partner as Lender
          </Link>
        </div>

      </div>
    </div>
  );
};