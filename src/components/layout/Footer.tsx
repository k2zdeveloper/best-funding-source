import React from 'react';
import { Building, ShieldCheck, Mail, Lock } from 'lucide-react';

// --- UTILITY COMPONENT ---
// Keeps the main render clean and ensures uniform hover states across all links
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a 
      href={href} 
      className="text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-sm"
    >
      {children}
    </a>
  </li>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-slate-950 text-slate-400 border-t border-slate-900"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* --- TOP GRID: Secondary Navigation & Branding --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Col 1: Branding & Trust (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <Building className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Best<span className="text-blue-500">Funding</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              The premier institutional capital marketplace. We connect verified corporate borrowers with accredited syndicates and direct lenders in a secure, encrypted environment.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Bank-Grade Security</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-500" /> End-to-End Encryption</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3">
              <FooterLink href="/borrowers">For Borrowers</FooterLink>
              <FooterLink href="/lenders">For Lenders</FooterLink>
              <FooterLink href="/marketplace">Live Marketplace</FooterLink>
              <FooterLink href="/pricing">Pricing & Fees</FooterLink>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/compliance">Compliance Standard</FooterLink>
              <FooterLink href="/security">Security Architecture</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <FooterLink href="/privacy">Privacy Protocol</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/kyb-policy">KYB & AML Policy</FooterLink>
              <FooterLink href="/disclosures">Regulatory Disclosures</FooterLink>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Disclaimers & Copyright --- */}
        <div className="border-t border-slate-800 pt-8 flex flex-col items-center lg:items-start gap-6">
          
          {/* Financial Disclaimer (Crucial for Capital Markets) */}
          <div className="text-[10px] sm:text-xs text-slate-500 leading-relaxed text-center lg:text-left max-w-5xl">
            <p>
              <strong>Important Disclosure:</strong> BestFunding Partners LLC operates a software platform connecting borrowers and lenders. We are not a registered broker-dealer, investment adviser, or crowdfunding portal. All capital placements involve risk, including the potential loss of principal. Past performance is no guarantee of future results. Any term sheets or loan offers generated through this platform are subject to final underwriting and compliance verification.
            </p>
          </div>

          {/* Copyright Row */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            <p>© {currentYear} BestFunding Partners LLC. All rights reserved.</p>
            <a href="mailto:support@bestfunding.com" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Mail className="w-4 h-4" /> support@bestfunding.com
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};