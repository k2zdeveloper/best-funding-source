// src/types/intake.ts

export type DocKey = 'pnl' | 'balance_sheet' | 'ar_aging';

export interface FormState {
  company_name: string;
  contact_email: string;
  phone_number: string;  // <-- NEW
  website: string;       // <-- NEW
  headquarters: string;  // <-- NEW
  industry: string;
  annual_revenue: string;
  requested_amount: string;
  years_in_business: string;
  use_of_funds: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: string;
}