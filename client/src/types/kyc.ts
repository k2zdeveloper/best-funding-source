export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'action_required';

export interface BorrowerKYC {
  id: string;
  user_id: string;
  company_name: string;
  ein: string;
  valid_id_path: string;
  business_reg_path: string;
  status: VerificationStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface LenderKYC {
  id: string;
  user_id: string;
  lender_type: 'individual' | 'entity';
  legal_name: string;
  tax_id: string;
  signatory_id_path: string;
  accreditation_path: string;
  status: VerificationStatus;
  admin_notes: string | null;
  created_at: string;
}

export type KYCItem = BorrowerKYC | LenderKYC;

// Strict Type Guards for safe rendering
export const isBorrowerKYC = (item: KYCItem): item is BorrowerKYC => {
  return 'company_name' in item;
};