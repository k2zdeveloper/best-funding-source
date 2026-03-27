import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export interface PitchFormData {
  facilityAmount: string;
  termLength: string;
  yieldRate: string;
  businessDescription: string;
  useOfFunds: string;
  // NEW: Explicitly track the required institutional documents
  financialsFile: File | null;
  capTableFile: File | null;
  uccFile: File | null;
}

const INITIAL_DATA: PitchFormData = {
  facilityAmount: '',
  termLength: '12',
  yieldRate: '',
  businessDescription: '',
  useOfFunds: '',
  financialsFile: null,
  capTableFile: null,
  uccFile: null,
};

export const usePitchForm = (userId: string) => {
  const [formData, setFormData] = useState<PitchFormData>(INITIAL_DATA);
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- High-Performance Input Formatters ---
  const updateField = useCallback((field: keyof PitchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    const rawValue = value.replace(/\D/g, ''); 
    const formatted = rawValue ? parseInt(rawValue, 10).toLocaleString('en-US') : '';
    updateField('facilityAmount', formatted);
  }, [updateField]);

  const handleYieldChange = useCallback((value: string) => {
    const rawValue = value.replace(/[^0-9.]/g, ''); 
    updateField('yieldRate', rawValue);
  }, [updateField]);

  // --- Strict Validation & Progression ---
  const goToStep = useCallback((step: number) => {
    setError(null);
    if (step === 2) {
      if (!formData.facilityAmount || !formData.yieldRate) {
        return setError('Please enter a target amount and proposed yield to continue.');
      }
    }
    if (step === 3) {
      if (!formData.businessDescription || !formData.useOfFunds) {
        return setError('Please provide a business description and intended use of funds.');
      }
    }
    setActiveStep(step);
  }, [formData]);

  // --- Secure Database & Storage Submission ---
  // --- Secure Database & Storage Submission ---
  const submitPitch = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanAmount = parseInt(formData.facilityAmount.replace(/,/g, ''), 10);
      const cleanYield = parseFloat(formData.yieldRate);

      if (isNaN(cleanAmount) || cleanAmount <= 0) throw new Error("Invalid facility amount.");
      if (isNaN(cleanYield) || cleanYield <= 0 || cleanYield > 100) throw new Error("Invalid yield rate.");

      // STEP 1: Generate the unique Deal ID locally BEFORE we talk to the database
      const newDealId = crypto.randomUUID(); 
      const uploadedDocsJSON: any[] = [];

      // STEP 2: Upload Files to Secure Storage FIRST
      const uploadDocument = async (file: File, docId: string, title: string, color: string) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `loan_${newDealId}/${docId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Add to our JSON array
        uploadedDocsJSON.push({
          id: docId,
          title: title,
          meta: `${fileExt?.toUpperCase()} • ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          color: color,
          file_path: filePath
        });
      };

      // Execute uploads if files exist
      if (formData.financialsFile) await uploadDocument(formData.financialsFile, 'doc-fin-1', 'Financials (TTM)', 'blue');
      if (formData.capTableFile) await uploadDocument(formData.capTableFile, 'doc-cap-1', 'Cap Table Overview', 'emerald');
      if (formData.uccFile) await uploadDocument(formData.uccFile, 'doc-ucc-1', 'UCC-1 Filings', 'purple');

      // STEP 3: Insert EVERYTHING into the database at the exact same time!
      const { error: dbError } = await supabase
        .from('loan_postings')
        .insert({
          id: newDealId, // Tell Supabase to use the ID we generated
          borrower_id: userId,
          facility_amount: cleanAmount,
          term_length_months: parseInt(formData.termLength, 10),
          yield_rate: cleanYield,
          business_description: formData.businessDescription,
          use_of_funds: formData.useOfFunds,
          status: 'pending_review',
          use_of_funds_breakdown: [{ color: "blue", amount: cleanAmount, category: "General Growth", percentage: 100 }],
          documents: uploadedDocsJSON // The JSON array goes in on the very first try!
        });

      if (dbError) throw dbError;

      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred while uploading your documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, userId]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_DATA);
    setActiveStep(1);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    formData,
    activeStep,
    isSubmitting,
    error,
    success,
    updateField,
    handleAmountChange,
    handleYieldChange,
    goToStep,
    submitPitch,
    resetForm
  };
};