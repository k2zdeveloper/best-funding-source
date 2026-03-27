import React from 'react';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- IMPORT YOUR OFFICIAL LOGO ---
// Make sure this path matches exactly what you have in Navigation.tsx
import logo from '../../assets/logoBFS.png';

// --- UTILITY COMPONENT ---
// Keeps the main render clean and ensures uniform hover states across all links
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link 
      to={href} 
      // Uses Brand Teal (#21B0A6) for hovers and offsets the focus ring against the deep background (#0A2235)
      className="text-sm text-slate-400 hover:text-[#21B0A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#0A2235] rounded-sm"
    >
      {children}
    </Link>
  </li>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      // Deep navy brand color anchors the page, complementing the light navigation bar
      className="bg-[#0A2235] text-slate-400 border-t border-[#1B6FA5]/20"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* --- TOP GRID: Secondary Navigation & Branding --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Col 1: Branding & Trust (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2">
            
            {/* --- ALIGNED LOGO AREA --- */}
            {/* Uses the exact same white pill background and hover effect as the Navigation */}
            <div className="flex items-center mb-6">
              <Link 
                to="/" 
                className="relative flex items-center justify-center h-14 px-4 bg-white rounded-full overflow-hidden group shadow-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
              >
                <img 
                  src={logo} 
                  alt="Best Funding Logo" 
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
              </Link>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
              The premier institutional capital marketplace. We connect verified corporate borrowers with accredited syndicates and direct lenders in a secure, encrypted environment.
            </p>
            
            <div className="flex items-center gap-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#21B0A6]" /> Bank-Grade Security
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#21B0A6]" /> End-to-End Encryption
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Platform</h3>
            <ul className="space-y-3">
              <FooterLink href="/borrowers">For Borrowers</FooterLink>
              <FooterLink href="/lenders">For Lenders</FooterLink>
              <FooterLink href="/marketplace">Live Marketplace</FooterLink>
              <FooterLink href="/pricing">Pricing & Fees</FooterLink>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Company</h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/compliance">Compliance Standard</FooterLink>
              <FooterLink href="/security">Security Architecture</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Legal</h3>
            <ul className="space-y-3">
              <FooterLink href="/privacy">Privacy Protocol</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/kyb-policy">KYB & AML Policy</FooterLink>
              <FooterLink href="/disclosures">Regulatory Disclosures</FooterLink>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Disclaimers & Copyright --- */}
        <div className="border-t border-[#1B6FA5]/20 pt-8 flex flex-col items-center lg:items-start gap-6">
          
          {/* Financial Disclaimer (Crucial for Capital Markets) */}
          <div className="text-[10px] sm:text-xs text-slate-500 leading-relaxed text-center lg:text-left max-w-5xl">
            <p>
              <strong className="text-slate-400">Important Disclosure:</strong> BestFunding Partners LLC operates a software platform connecting borrowers and lenders. We are not a registered broker-dealer, investment adviser, or crowdfunding portal. All capital placements involve risk, including the potential loss of principal. Past performance is no guarantee of future results. Any term sheets or loan offers generated through this platform are subject to final underwriting and compliance verification.
            </p>
          </div>

          {/* Copyright Row */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            <p>© {currentYear} BestFunding Partners LLC. All rights reserved.</p>
            <a 
              href="mailto:support@bestfunding.com" 
              className="flex items-center gap-2 hover:text-[#21B0A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:ring-offset-2 focus:ring-offset-[#0A2235] rounded-sm"
            >
              <Mail className="w-4 h-4" /> support@bestfunding.com
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};