import { useState } from 'react';
import type { FormState, DocKey } from '../types/intake';
import { submitIntakeForm } from '../services/intakeService';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf', 
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
  'text/csv'
];

export const useIntakeForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [animateDirection, setAnimateDirection] = useState<'forward' | 'backward'>('forward');

const [formData, setFormData] = useState<FormState>({
    company_name: '',
    contact_email: '',
    phone_number: '', // <-- NEW
    website: '',      // <-- NEW
    headquarters: '', // <-- NEW
    industry: 'Logistics & 3PL Warehousing',
    annual_revenue: '',
    requested_amount: '',
    years_in_business: '',
    use_of_funds: ''
  });

  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    pnl: null,
    balance_sheet: null,
    ar_aging: null,
  });
  
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDocSelect = (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadErrors(prev => ({ ...prev, [key]: '' }));

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadErrors(prev => ({ ...prev, [key]: 'File exceeds 15MB security limit.' }));
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [key]: 'Strict format required: PDF, CSV, or Excel only.' }));
      return;
    }

    setDocs(prev => ({ ...prev, [key]: file }));
  };

  const removeDoc = (key: DocKey) => {
    setDocs(prev => ({ ...prev, [key]: null }));
    setUploadErrors(prev => ({ ...prev, [key]: '' }));
    const inputElement = document.getElementById(`fileUpload_${key}`) as HTMLInputElement;
    if (inputElement) inputElement.value = '';
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setAnimateDirection('forward');
    setTimeout(() => setStep((prev) => prev + 1), 50);
  };

  const prevStep = () => {
    setAnimateDirection('backward');
    setTimeout(() => setStep((prev) => prev - 1), 50);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    // Call our newly isolated service
    const result = await submitIntakeForm(formData, docs);

    if (result.success) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('error');
      setErrorMessage(result.error as string);
    }
    
    setIsSubmitting(false);
  };

  return {
    step,
    isSubmitting,
    submitStatus,
    errorMessage,
    animateDirection,
    formData,
    docs,
    uploadErrors,
    handleTextChange,
    handleDocSelect,
    removeDoc,
    nextStep,
    prevStep,
    submitForm
  };
};