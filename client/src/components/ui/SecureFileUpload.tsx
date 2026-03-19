import React from 'react';

interface SecureFileUploadProps {
  label: string;
  description: string;
  accept: string;
  required?: boolean;
  onChange: (file: File | null) => void;
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({ 
  label, description, accept, required = false, onChange 
}) => {
  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <label className="block text-sm font-bold text-slate-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">
        {description}
      </p>
      <input 
        type="file" 
        accept={accept} 
        required={required}
        className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};