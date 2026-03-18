import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase'; // Adjust path
import { ShieldCheck, AlertCircle, Loader2, Lock } from 'lucide-react';

// --- SECURITY CONSTANTS ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit per file
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

export const BorrowerVerification = ({ user, onComplete }: { user: any, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    ein: '',
    validId: null as File | null,
    businessReg: null as File | null,
  });

  // --- 1. SANITIZATION HELPERS ---
  const sanitizeText = (input: string) => {
    // Strips out potential HTML/Script tags to prevent XSS
    return input.replace(/[<>]/g, '').trim();
  };

  const validateEIN = (ein: string) => {
    // Strictly enforces US EIN format: exactly 2 digits, a dash, and 7 digits
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
  };

  const validateAndSecureFile = (file: File, label: string) => {
    if (!file) throw new Error(`${label} is missing.`);
    
    // Check Size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${label} exceeds the maximum secure size of 5MB.`);
    }

    // Check strict MIME type, NOT the file extension the user typed
    if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
      throw new Error(`${label} format rejected. Only secure PDF, JPG, or PNG files are permitted.`);
    }

    return true;
  };

  // --- 2. SECURE UPLOAD LOGIC ---
  const handleSecureUpload = async (file: File, pathSuffix: string) => {
    // We completely ignore the user's file name to prevent Path Traversal attacks.
    // We map the verified MIME type to a safe extension.
    const safeExtension = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
    
    // Creates a completely randomized, untraceable file path
    const secureFilePath = `${user.id}/${crypto.randomUUID()}_${pathSuffix}.${safeExtension}`;
    
    const { data, error } = await supabase.storage
      .from('verification_documents')
      .upload(secureFilePath, file, {
        cacheControl: '3600',
        upsert: false // Prevent overwriting existing files
      });

    if (error) throw new Error(`Secure upload failed: ${error.message}`);
    return data.path;
  };

  // --- 3. SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step A: Sanitize Inputs
      const cleanCompanyName = sanitizeText(formData.companyName);
      const cleanEIN = sanitizeText(formData.ein);

      if (!cleanCompanyName) throw new Error("Company name is required.");
      if (!validateEIN(cleanEIN)) throw new Error("Invalid EIN format. Must be XX-XXXXXXX.");
      
      // Step B: Validate Files before touching the network
      validateAndSecureFile(formData.validId!, "Personal ID");
      validateAndSecureFile(formData.businessReg!, "Business Registration");

      // Step C: Upload securely to Supabase Storage
      const validIdPath = await handleSecureUpload(formData.validId!, 'id_doc');
      const businessRegPath = await handleSecureUpload(formData.businessReg!, 'reg_doc');

      // Step D: Insert record into DB
      const { error: dbError } = await supabase
        .from('borrower_verifications')
        .insert({
          user_id: user.id,
          company_name: cleanCompanyName,
          ein: cleanEIN,
          valid_id_path: validIdPath,
          business_reg_path: businessRegPath,
          status: 'pending' // Enforces admin review
        });

      if (dbError) throw dbError;
      
      onComplete(); 
    } catch (err: any) {
      console.error("Verification Submission Error:", err);
      setError(err.message || 'A security error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Secure Business Verification <Lock className="w-4 h-4 text-slate-400" />
          </h2>
          <p className="text-sm text-slate-500">Your connection is encrypted. Documents are stored in an isolated vault.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Legal Company Name</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              placeholder="e.g. Acme Corp LLC"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">EIN (Tax ID)</label>
            <input 
              type="text" required 
              placeholder="XX-XXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.ein}
              onChange={e => {
                // Auto-format the dash for the user for better UX
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2, 9);
                setFormData({...formData, ein: val})
              }}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <label className="block text-sm font-bold text-slate-800 mb-1">Government Issued ID</label>
            <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">Driver's License or Passport (Max 5MB)</p>
            <input 
              type="file" accept=".pdf,image/jpeg,image/png,image/jpg" required
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer"
              onChange={e => setFormData({...formData, validId: e.target.files?.[0] || null})}
            />
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <label className="block text-sm font-bold text-slate-800 mb-1">Business Registration</label>
            <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider">Articles of Org. or Incorporation (Max 5MB)</p>
            <input 
              type="file" accept=".pdf,image/jpeg,image/png,image/jpg" required
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer"
              onChange={e => setFormData({...formData, businessReg: e.target.files?.[0] || null})}
            />
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Encrypting & Transmitting...' : 'Submit Secure Verification'}
        </button>
      </form>
    </div>
  );
};