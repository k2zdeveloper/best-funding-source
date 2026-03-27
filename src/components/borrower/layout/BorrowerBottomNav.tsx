import React from 'react';
import { LayoutGrid, PlusCircle, MessageSquare, Settings } from 'lucide-react';
import type { BorrowerViewState } from '../BorrowerDashboard';

interface BorrowerBottomNavProps {
  currentView: BorrowerViewState;
  setCurrentView: (view: BorrowerViewState) => void;
}

export const BorrowerBottomNav: React.FC<BorrowerBottomNavProps> = ({ currentView, setCurrentView }) => {
  
  const NavItem = ({ view, label, icon: Icon, hasBadge = false }: { view: BorrowerViewState, label: string, icon: React.ElementType, hasBadge?: boolean }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => setCurrentView(view)} 
        className={`flex flex-col items-center gap-1 p-2 relative transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Icon className="w-5 h-5" />
        {hasBadge && <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
        <span className="text-[9px] font-bold">{label}</span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem view="overview" label="Home" icon={LayoutGrid} />
      <NavItem view="pitch" label="Pitch" icon={PlusCircle} />
      <NavItem view="messages" label="Chat" icon={MessageSquare} hasBadge={true} />
      <NavItem view="settings" label="Settings" icon={Settings} />
    </div>
  );
};