import React from 'react';
import { ShieldCheck, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useBorrowerVerification } from './verification/useBorrowerVerification';
import { SecureFileUpload } from '../../ui/SecureFileUpload';

interface BorrowerVerificationProps {
  user: any;
  onComplete: () => void;
}

export const BorrowerVerification: React.FC<BorrowerVerificationProps> = ({ user, onComplete }) => {
  const { 
    formData, 
    loading, 
    error, 
    updateField, 
    handleEINChange, 
    submitVerification 
  } = useBorrowerVerification(user?.id, onComplete);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            Secure Business Verification <Lock className="w-4 h-4 text-slate-400" />
          </h2>
          <p className="text-sm text-slate-500">Your connection is encrypted. Documents are stored in an isolated vault.</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={submitVerification} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Legal Company Name</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="e.g. Acme Corp LLC"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">EIN (Tax ID)</label>
            <input 
              type="text" required 
              placeholder="XX-XXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.ein}
              onChange={(e) => handleEINChange(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <SecureFileUpload 
            label="Government Issued ID"
            description="Driver's License or Passport (Max 5MB)"
            accept=".pdf,image/jpeg,image/png,image/jpg"
            required
            onChange={(file) => updateField('validId', file)}
          />

          <SecureFileUpload 
            label="Business Registration"
            description="Articles of Org. or Incorporation (Max 5MB)"
            accept=".pdf,image/jpeg,image/png,image/jpg"
            required
            onChange={(file) => updateField('businessReg', file)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Encrypting & Transmitting...' : 'Submit Secure Verification'}
        </button>
      </form>
    </div>
  );
};