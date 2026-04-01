import { supabase } from '../lib/supabase';
import type { FormState, DocKey, SubmissionResult } from '../types/intake';

export const submitIntakeForm = async (
  formData: FormState,
  docs: Record<DocKey, File | null>
): Promise<SubmissionResult> => {
  const uploadedPaths: string[] = [];
  
  try {
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Process File Uploads securely
    for (const [key, file] of Object.entries(docs)) {
      if (file) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `${submissionId}/${key.toUpperCase()}_${cleanName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('secure_vault')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
          
        if (uploadError) throw new Error(`Transfer protocol failed on ${key}: ${uploadError.message}`);
        if (uploadData) uploadedPaths.push(uploadData.path);
      }
    }

    // 2. Inject into Database via Secure Edge Function (Auto-Provisioning)
    const { data, error: functionError } = await supabase.functions.invoke('submit-intake', {
      body: {
        formData: {
          ...formData,
          annual_revenue: Number(formData.annual_revenue),
          requested_amount: Number(formData.requested_amount),
          years_in_business: Number(formData.years_in_business),
        },
        documentPaths: uploadedPaths
      }
    });

    // 3. Error Handling & File Rollback
    if (functionError || data?.error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('secure_vault').remove(uploadedPaths);
      }
      throw new Error(functionError?.message || data?.error || 'Database injection failed via secure edge.');
    }

    // 4. Return success and the new user flag
    return { 
      success: true,
      isNewUser: data?.isNewUser 
    };
    
  } catch (err: any) {
    console.error('Submission Error:', err);
    return { 
      success: false, 
      error: err.message || 'Encrypted pipeline disruption. Please verify your connection.' 
    };
  }
};