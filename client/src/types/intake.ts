export type DocKey = 'tax_returns' | 'pl_statement' | 'bank_statements' | 'pitch_deck';

export interface FormState {
  company_name: string;
  contact_email: string;
  phone_number: string;
  website: string;
  headquarters: string;
  industry: string;
  annual_revenue: string; // Kept as string for UI formatting (e.g. "$5,000,000")
  requested_amount: string;
  years_in_business: string;
  use_of_funds: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: string;
}