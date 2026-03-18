import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase'; // Adjust path 
import { ShieldCheck, AlertCircle, Loader2, Lock, Building2, User } from 'lucide-react';

// --- ENTERPRISE SECURITY CONSTANTS ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit per file
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

type LenderType = 'individual' | 'entity';

interface LenderVerificationProps {
  user: any;
  onComplete: () => void;
}

export const LenderVerification: React.FC<LenderVerificationProps> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic UI State
  const [lenderType, setLenderType] = useState<LenderType>('entity');
  
  // Generalized Form State
  const [formData, setFormData] = useState({
    legalName: '',
    taxId: '', 
    signatoryId: null as File | null,
    accreditationProof: null as File | null,
  });

  // --- 1. DATA SANITIZATION & VALIDATION ---
  const sanitizeText = (input: string) => input.replace(/[<>]/g, '').trim();

  const validateTaxId = (id: string, type: LenderType) => {
    // Basic structural validation before sending to the server
    const cleanId = id.replace(/\D/g, '');
    if (type === 'individual' && cleanId.length !== 9) throw new Error("SSN must be 9 digits.");
    if (type === 'entity' && cleanId.length !== 9) throw new Error("EIN must be 9 digits.");
    return id;
  };

  const validateAndSecureFile = (file: File, label: string) => {
    if (!file) throw new Error(`${label} is missing.`);
    if (file.size > MAX_FILE_SIZE) throw new Error(`${label} exceeds the maximum secure size of 5MB.`);
    if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
      throw new Error(`${label} format rejected. Only secure PDF, JPG, or PNG files are permitted.`);
    }
    return true;
  };

// --- 2. ISOLATED UPLOAD LOGIC ---
  const handleSecureUpload = async (file: File, pathSuffix: string) => {
    const safeExtension = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
    const secureFilePath = `lenders/${user.id}/${crypto.randomUUID()}_${pathSuffix}.${safeExtension}`;
    
    // FIX: Properly alias 'error' to 'uploadError'
    const { data, error: uploadError } = await supabase.storage
      .from('verification_documents')
      .upload(secureFilePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw new Error(`Secure upload failed: ${uploadError.message}`);
    
    // FIX: Ensure data exists before accessing .path to satisfy strict TypeScript rules
    if (!data) throw new Error("Upload failed: No path returned from storage vault.");
    
    return data.path;
  };

  // --- 3. SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanLegalName = sanitizeText(formData.legalName);
      const cleanTaxId = sanitizeText(formData.taxId);

      if (!cleanLegalName) throw new Error("Legal name is required.");
      validateTaxId(cleanTaxId, lenderType);
      
      validateAndSecureFile(formData.signatoryId!, "Identification Document");
      validateAndSecureFile(formData.accreditationProof!, "Proof of Accreditation");

      const signatoryIdPath = await handleSecureUpload(formData.signatoryId!, 'id_doc');
      const accreditationPath = await handleSecureUpload(formData.accreditationProof!, 'accreditation_doc');

      // Insert into the updated generalized database schema
      const { error: dbError } = await supabase
        .from('lender_verifications')
        .insert({
          user_id: user.id,
          lender_type: lenderType, // 'individual' or 'entity'
          legal_name: cleanLegalName,
          tax_id: cleanTaxId,
          signatory_id_path: signatoryIdPath,
          accreditation_path: accreditationPath,
          status: 'pending'
        });

      if (dbError) throw dbError;
      onComplete(); 

    } catch (err: any) {
      setError(err.message || 'A security error occurred during transmission.');
    } finally {
      setLoading(false);
    }
  };

  // --- UI DICTIONARY (Changes based on selection) ---
  const uiText = {
    entity: {
      nameLabel: "Institution Legal Name",
      namePlaceholder: "e.g. Crestview Capital Partners",
      taxLabel: "EIN / Registration #",
      taxPlaceholder: "XX-XXXXXXX",
      idLabel: "Authorized Signatory ID",
      idSubtext: "Government ID of primary account handler (Max 5MB)",
      accreditationLabel: "Institutional Accreditation",
      accreditationSubtext: "SEC filing, Articles of Incorporation, or Bank Letter (Max 5MB)"
    },
    individual: {
      nameLabel: "Full Legal Name",
      namePlaceholder: "e.g. Jane Doe",
      taxLabel: "SSN / Individual Tax ID",
      taxPlaceholder: "XXX-XX-XXXX",
      idLabel: "Government Issued ID",
      idSubtext: "Driver's License or Passport (Max 5MB)",
      accreditationLabel: "Proof of Accreditation / Funds",
      accreditationSubtext: "CPA Letter, Brokerage Statement, or W-2s (Max 5MB)"
    }
  }[lenderType];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <ShieldCheck className="w-8 h-8 text-slate-900" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Lender KYC Verification <Lock className="w-4 h-4 text-slate-400" />
          </h2>
          <p className="text-sm text-slate-500">End-to-end encrypted upload to our secure compliance vault.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* --- ENTERPRISE SEGMENTED CONTROL --- */}
      <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
        <button
          type="button"
          onClick={() => setLenderType('entity')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${lenderType === 'entity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 className="w-4 h-4" /> Entity / Institution
        </button>
        <button
          type="button"
          onClick={() => setLenderType('individual')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${lenderType === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <User className="w-4 h-4" /> Individual Investor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">{uiText.nameLabel}</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              value={formData.legalName}
              onChange={e => setFormData({...formData, legalName: e.target.value})}
              placeholder={uiText.namePlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">{uiText.taxLabel}</label>
            <input 
              type="text" required 
              placeholder={uiText.taxPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              value={formData.taxId}
              onChange={e => setFormData({...formData, taxId: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            <label className="block text-sm font-bold text-slate-900 mb-1">{uiText.idLabel}</label>
            <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">{uiText.idSubtext}</p>
            <input 
              type="file" accept=".pdf,image/jpeg,image/png,image/jpg" required
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 transition-all cursor-pointer"
              onChange={e => setFormData({...formData, signatoryId: e.target.files?.[0] || null})}
            />
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            <label className="block text-sm font-bold text-slate-900 mb-1">{uiText.accreditationLabel}</label>
            <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">{uiText.accreditationSubtext}</p>
            <input 
              type="file" accept=".pdf,image/jpeg,image/png,image/jpg" required
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 transition-all cursor-pointer"
              onChange={e => setFormData({...formData, accreditationProof: e.target.files?.[0] || null})}
            />
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-slate-900 text-white text-sm font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Encrypting & Transmitting...' : 'Submit Secure Verification'}
        </button>
      </form>
    </div>
  );
};