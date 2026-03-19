import React from 'react';

export interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  theme: 'blue' | 'emerald' | 'orange';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, value, subtitle, icon: Icon, theme, loading = false 
}) => {
  const themes = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-32">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity pointer-events-none">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
          <div className={`p-2.5 rounded-xl border ${themes[theme]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {new Intl.NumberFormat('en-US').format(value)}
          </p>
          <p className="text-xs text-slate-500 font-medium mb-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};