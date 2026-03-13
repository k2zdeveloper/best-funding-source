import React from 'react';
import { Building } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-950 text-blue-200/60 py-12 text-xs uppercase tracking-widest font-semibold">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-blue-900/50 pt-8">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          <p>© {new Date().getFullYear()} BestFunding Partners LLC</p>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};