import { useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';

// --- SECURITY CONSTANTS ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit per file
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

export interface VerificationFormData {
  companyName: string;
  ein: string;
  validId: File | null;
  businessReg: File | null;
}

export const useBorrowerVerification = (userId: string, onComplete: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<VerificationFormData>({
    companyName: '',
    ein: '',
    validId: null,
    businessReg: null,
  });

  const updateField = useCallback((field: keyof VerificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // --- 1. SANITIZATION & VALIDATION ---
  const sanitizeText = (input: string) => input.replace(/[<>]/g, '').trim();

  const validateEIN = (ein: string) => {
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
  };

  const handleEINChange = useCallback((value: string) => {
    let val = value.replace(/\D/g, '');
    if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2, 9);
    updateField('ein', val);
  }, [updateField]);

  const validateAndSecureFile = (file: File, label: string) => {
    if (!file) throw new Error(`${label} is missing.`);
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${label} exceeds the maximum secure size of 5MB.`);
    }
    if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
      throw new Error(`${label} format rejected. Only secure PDF, JPG, or PNG files are permitted.`);
    }
    return true;
  };

  // --- 2. SECURE UPLOAD LOGIC ---
  const handleSecureUpload = async (file: File, pathSuffix: string) => {
    const safeExtension = ALLOWED_MIME_TYPES[file.type];
    const secureFilePath = `${userId}/${crypto.randomUUID()}_${pathSuffix}.${safeExtension}`;
    
    const { data, error } = await supabase.storage
      .from('verification_documents')
      .upload(secureFilePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Secure upload failed: ${error.message}`);
    return data.path;
  };

  // --- 3. ORCHESTRATOR ---
  const submitVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanCompanyName = sanitizeText(formData.companyName);
      const cleanEIN = sanitizeText(formData.ein);

      if (!cleanCompanyName) throw new Error("Company name is required.");
      if (!validateEIN(cleanEIN)) throw new Error("Invalid EIN format. Must be XX-XXXXXXX.");
      
      validateAndSecureFile(formData.validId!, "Personal ID");
      validateAndSecureFile(formData.businessReg!, "Business Registration");

      const validIdPath = await handleSecureUpload(formData.validId!, 'id_doc');
      const businessRegPath = await handleSecureUpload(formData.businessReg!, 'reg_doc');

      const { error: dbError } = await supabase
        .from('borrower_verifications')
        .insert({
          user_id: userId,
          company_name: cleanCompanyName,
          ein: cleanEIN,
          valid_id_path: validIdPath,
          business_reg_path: businessRegPath,
          status: 'pending' 
        });

      if (dbError) throw dbError;
      
      onComplete(); 
    } catch (err: any) {
      console.error("Verification Submission Error:", err);
      setError(err.message || 'A security error occurred during submission.');
    } finally {
      setLoading(false);
    }
  }, [formData, userId, onComplete]);

  return {
    formData,
    loading,
    error,
    updateField,
    handleEINChange,
    submitVerification
  };
};