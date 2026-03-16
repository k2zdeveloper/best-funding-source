import React from 'react';
import { AlertCircle, UploadCloud, XCircle } from 'lucide-react';
import type { DocKey } from '../../types/intake';

interface DocumentUploadRowProps {
  docKey: DocKey;
  title: string;
  description: string;
  isRequired?: boolean;
  file: File | null;
  errorMsg?: string;
  onSelect: (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (key: DocKey) => void;
}

export const DocumentUploadRow: React.FC<DocumentUploadRowProps> = ({
  docKey,
  title,
  description,
  isRequired = false,
  file,
  errorMsg,
  onSelect,
  onRemove,
}) => {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            {isRequired ? (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded-sm">Required</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Optional</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{description}</p>
          
          {errorMsg && (
            <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errorMsg}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {file ? (
            <div className="flex items-center gap-3 bg-blue-50/50 pl-3 pr-1 py-1 rounded-lg border border-blue-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-blue-900 truncate max-w-30">{file.name}</span>
                <span className="text-[10px] text-blue-600 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button 
                type="button" 
                onClick={() => onRemove(docKey)}
                className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-md transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <input 
                type="file" 
                id={`fileUpload_${docKey}`}
                className="hidden" 
                onChange={(e) => onSelect(docKey, e)}
                accept=".pdf,.csv,.xlsx,.xls"
              />
              <button 
                type="button"
                onClick={() => document.getElementById(`fileUpload_${docKey}`)?.click()}
                className="px-4 py-2 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" /> Select File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};