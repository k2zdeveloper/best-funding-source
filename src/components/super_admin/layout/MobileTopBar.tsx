import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

interface MobileTopBarProps {
  onOpenSidebar: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ onOpenSidebar }) => {
  return (
    <header className="md:hidden absolute top-0 left-0 w-full h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-blue-500" />
        <span className="font-bold text-white tracking-tight">
          Super<span className="text-slate-400">Admin</span>
        </span>
      </div>
      <button 
        onClick={onOpenSidebar}
        className="p-2 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
};