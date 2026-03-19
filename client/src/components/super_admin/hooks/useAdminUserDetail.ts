import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { type FullUserProfile } from './useAdminDirectory';

// --- TYPES & INTERFACES ---
export interface PreQualification {
  id: string;
  requested_amount: number;
  industry: string;
  created_at: string;
  status: string;
}

export interface LoanPosting {
  id: string;
  facility_amount: number;
  business_description: string;
  status: string;
}

export interface VerificationData {
  id?: string;
  ein?: string;
  tax_id?: string;
  company_name?: string;
  legal_name?: string;
  lender_type?: string;
  valid_id_path?: string;
  signatory_id_path?: string;
  business_reg_path?: string;
  accreditation_path?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'action_required';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParticipationData {
  id: string;
  deal_id: string;
  message_text: string;
}

export type AllowedSecurityFlags = Pick<FullUserProfile, 'is_blocked' | 'prevent_deletion' | 'restricted_until' | 'is_verified'>;

const isValidUUID = (uuid: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

export const useAdminUserDetail = (userId: string | undefined) => {
  const [user, setUser] = useState<FullUserProfile | null>(null);
  const [preQuals, setPreQuals] = useState<PreQualification[]>([]);
  const [loans, setLoans] = useState<LoanPosting[]>([]);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [participation, setParticipation] = useState<ParticipationData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // --- ENTERPRISE FEATURE: SILENT AUDIT LOGGER ---
  // Writes actions to the database without blocking the UI thread
  const logAdminAction = async (action: string, oldPayload?: any, newPayload?: any) => {
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) return;

      await supabase.from('audit_logs').insert({
        actor_id: adminUser.id,
        action,
        entity_type: 'profile',
        entity_id: userId,
        old_payload: oldPayload,
        new_payload: newPayload
      });
    } catch (e) {
      console.error("Audit log failed (Non-Fatal):", e);
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    if (!isValidUUID(userId)) {
      setError({ title: "Invalid Request", message: "The provided User ID format is invalid." });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      if (!profileData) throw new Error("User profile not found in database.");
      
      setUser(profileData as FullUserProfile);
      const role = profileData.role;
      if (!role) throw new Error("User profile is missing a designated role.");

      // 2. QUERY FIX: STRICT COLUMN SELECTION
      // Prevents PostgREST from crashing by requesting only columns that actually exist
      const verifQuery = role === 'borrower' 
        ? supabase.from('borrower_verifications').select('id, company_name, ein, valid_id_path, business_reg_path, status, admin_notes, created_at, updated_at').eq('user_id', userId).maybeSingle()
        : supabase.from('lender_verifications').select('id, lender_type, legal_name, tax_id, signatory_id_path, accreditation_path, status, admin_notes, created_at, updated_at').eq('user_id', userId).maybeSingle();

      const activityQuery = role === 'borrower' 
        ? supabase.from('loan_postings').select('id, facility_amount, business_description, status').eq('borrower_id', userId)
        : supabase.from('secure_messages').select('id, deal_id, message_text').eq('sender_id', userId).not('deal_id', 'is', null);

      // 3. PARALLEL EXECUTION
      const [pqRes, verifRes, activityRes] = await Promise.all([
        supabase.from('pre_qualifications').select('id, requested_amount, industry, created_at, status').eq('user_id', userId),
        verifQuery,
        activityQuery
      ]);

      // Assign Data with Type Assertions to satisfy TypeScript
      if (pqRes.error) console.warn("Failed to fetch pre-qualifications:", pqRes.error);
      else setPreQuals((pqRes.data as PreQualification[]) || []);

      if (verifRes.error) console.warn("Failed to fetch verification docs:", verifRes.error);
      else setVerification((verifRes.data as VerificationData) || null);

      if (activityRes.error) console.warn(`Failed to fetch activity for ${role}:`, activityRes.error);
      else {
        if (role === 'borrower') setLoans((activityRes.data as LoanPosting[]) || []);
        if (role === 'lender') setParticipation((activityRes.data as ParticipationData[]) || []);
      }

    } catch (err: any) {
      setError({ title: "Failed to load user data", message: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // --- SECURITY: LOCKED-DOWN MUTATIONS WITH AUDIT LOGGING ---

  const updateFlags = async (updates: Partial<AllowedSecurityFlags>) => {
    if (!userId) return { success: false, error: 'No User ID provided.' };
    setUpdating(true);
    
    // Snapshot old state for the audit log
    const oldState = { 
      is_blocked: user?.is_blocked, 
      prevent_deletion: user?.prevent_deletion, 
      restricted_until: user?.restricted_until,
      is_verified: user?.is_verified
    };

    try {
      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (updateError) throw updateError;
      
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Fire and forget audit log
      logAdminAction('UPDATE_SECURITY_FLAGS', oldState, updates);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Update failed.' };
    } finally {
      setUpdating(false);
    }
  };

  const reviewVerification = async (status: 'approved' | 'rejected', notes: string = '') => {
    if (!userId || !user?.role) return { success: false, error: 'Invalid user or role.' };
    setUpdating(true);
    
    try {
      const verifTable = user.role === 'borrower' ? 'borrower_verifications' : 'lender_verifications';
      const isVerifiedBool = status === 'approved';
      const timestamp = new Date().toISOString();

      // 1. Update KYC Record
      const { error: kycError } = await supabase
        .from(verifTable)
        .update({ status: status, admin_notes: notes, updated_at: timestamp })
        .eq('user_id', userId);

      if (kycError) throw kycError;

      // 2. Synchronize Profile Flag
      const flagUpdate = await updateFlags({ is_verified: isVerifiedBool });
      if (!flagUpdate.success) throw new Error(flagUpdate.error);

      // 3. Log the KYC Decision
      logAdminAction(`KYC_${status.toUpperCase()}`, { old_status: verification?.status }, { new_status: status, notes });

      setVerification(prev => prev ? { ...prev, status, admin_notes: notes, updated_at: timestamp } : null);

      return { success: true };
    } catch (err: any) {
      // Re-sync data if transaction partially failed
      fetchUserData(); 
      return { success: false, error: err.message || 'Review processing failed.' };
    } finally {
      setUpdating(false);
    }
  };

  const forcePasswordReset = async (newPassword: string) => {
    if (!userId) return { success: false, error: 'No User ID provided.' };
    setUpdating(true);
    try {
      const { error: funcError } = await supabase.functions.invoke('admin-override-user', { 
        body: { targetUserId: userId, newPassword } 
      });
      if (funcError) throw funcError;
      
      logAdminAction('FORCE_PASSWORD_RESET', {}, { target_id: userId });
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password override failed.' };
    } finally {
      setUpdating(false);
    }
  };

  return { 
    user, preQuals, loans, verification, participation, 
    loading, updating, error, updateFlags, reviewVerification, forcePasswordReset, refresh: fetchUserData 
  };
};