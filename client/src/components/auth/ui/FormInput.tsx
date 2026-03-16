import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
  label: string;
}

export const FormInput: React.FC<FormInputProps> = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />}
      <input 
        className={`block w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium`}
        {...props} 
      />
    </div>
  </div>
);