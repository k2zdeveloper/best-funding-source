export type DocKey = 'pnl' | 'balance_sheet' | 'ar_aging';

export interface FormState {
  company_name: string;
  contact_email: string;
  phone_number: string;
  website: string;
  headquarters: string;
  industry: string;
  annual_revenue: string | number;
  requested_amount: string | number;
  years_in_business: string | number;
  use_of_funds: string;
}

export interface SubmissionResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean; // <-- The flag that tells the UI if an account was created
}