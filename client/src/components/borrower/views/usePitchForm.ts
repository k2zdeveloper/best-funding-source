import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export interface PitchFormData {
  facilityAmount: string;
  termLength: string;
  yieldRate: string;
  businessDescription: string;
  useOfFunds: string;
  mediaFiles: File[];
}

const INITIAL_DATA: PitchFormData = {
  facilityAmount: '',
  termLength: '12',
  yieldRate: '',
  businessDescription: '',
  useOfFunds: '',
  mediaFiles: [],
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
    const rawValue = value.replace(/\D/g, ''); // Strip non-digits
    const formatted = rawValue ? parseInt(rawValue, 10).toLocaleString('en-US') : '';
    updateField('facilityAmount', formatted);
  }, [updateField]);

  const handleYieldChange = useCallback((value: string) => {
    const rawValue = value.replace(/[^0-9.]/g, ''); // Allow digits and period only
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

  // --- Secure Database Submission ---
  const submitPitch = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanAmount = parseInt(formData.facilityAmount.replace(/,/g, ''), 10);
      const cleanYield = parseFloat(formData.yieldRate);

      if (isNaN(cleanAmount) || cleanAmount <= 0) throw new Error("Invalid facility amount.");
      if (isNaN(cleanYield) || cleanYield <= 0 || cleanYield > 100) throw new Error("Invalid yield rate.");

      const { error: dbError } = await supabase
        .from('loan_postings')
        .insert({
          borrower_id: userId,
          facility_amount: cleanAmount,
          term_length_months: parseInt(formData.termLength, 10),
          yield_rate: cleanYield,
          business_description: formData.businessDescription,
          use_of_funds: formData.useOfFunds,
          status: 'pending_review' 
        });

      if (dbError) throw dbError;
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred while submitting your pitch.");
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