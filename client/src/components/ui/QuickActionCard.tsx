import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'blue' | 'purple' | 'orange';
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, subtitle, icon: Icon, theme, onClick 
}) => {
  const themes = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
  };

  const arrowThemes = {
    blue: 'group-hover:text-blue-600',
    purple: 'group-hover:text-purple-600',
    orange: 'group-hover:text-orange-600'
  };

  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group text-left border border-transparent hover:border-slate-200"
      aria-label={`Maps to ${title}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${themes[theme]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className={`w-4 h-4 text-slate-300 transition-colors ${arrowThemes[theme]}`} />
    </button>
  );
};