import { supabase } from '../lib/supabase';
import type { FormState, DocKey, SubmissionResult } from '../types/intake';

export const submitIntakeForm = async (
  formData: FormState,
  docs: Record<DocKey, File | null>
): Promise<SubmissionResult> => {
  const uploadedPaths: string[] = [];
  
  try {
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Process File Uploads
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

    // 2. Inject into Database
    const { error: dbError } = await supabase.from('pre_qualifications').insert([{
      company_name: formData.company_name,
      contact_email: formData.contact_email,
      phone_number: formData.phone_number,   
      website: formData.website,             
      headquarters: formData.headquarters,   
      industry: formData.industry,
      annual_revenue: Number(formData.annual_revenue),
      requested_amount: Number(formData.requested_amount),
      years_in_business: Number(formData.years_in_business),
      use_of_funds: formData.use_of_funds,
      document_paths: uploadedPaths 
    }]);

    // If the database insert fails, clean up the files we just uploaded to storage
    if (dbError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('secure_vault').remove(uploadedPaths);
      }
      throw new Error(dbError?.message || 'Database injection failed.');
    }

    return { success: true };
    
  } catch (err: any) {
    console.error('Submission Error:', err);
    return { 
      success: false, 
      error: err.message || 'Encrypted pipeline disruption. Please verify your connection.' 
    };
  }
};