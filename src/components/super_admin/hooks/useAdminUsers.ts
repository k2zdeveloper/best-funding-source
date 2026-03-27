import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

// --- ADDED THIS BACK IN ---
export interface UserProfile {
  id: string;
  email: string;
  role: 'borrower' | 'lender' | 'admin' | 'super_admin';
  company_name?: string;
  is_verified: boolean;
  is_blocked: boolean;
  prevent_deletion: boolean;
  restricted_until: string | null;
  created_at: string;
}

export type AllowedAdminUpdates = Pick<UserProfile, 'is_blocked' | 'prevent_deletion' | 'is_verified' | 'restricted_until'>;

const isValidUUID = (uuid: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('id, email, role, company_name, is_verified, is_blocked, prevent_deletion, restricted_until, created_at')
        .order('created_at', { ascending: false })
        .limit(1000); 

      if (dbError) throw dbError;
      setUsers((data as UserProfile[]) || []);
    } catch (err: any) {
      console.error("Fetch Users Error:", err);
      setError('Failed to fetch user directory. Please verify secure connectivity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserFlags = useCallback(async (userId: string, updates: Partial<AllowedAdminUpdates>) => {
    if (!isValidUUID(userId)) return { success: false, error: 'Invalid User ID format.' };
    
    setProcessingId(userId);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      return { success: true };
    } catch (err: any) {
      console.error("Update Flags Error:", err);
      return { success: false, error: err.message || 'Failed to apply security flags.' };
    } finally {
      setProcessingId(null);
    }
  }, []);

  const overrideUserCredentials = useCallback(async (userId: string, newEmail?: string, newPassword?: string) => {
    if (!isValidUUID(userId)) return { success: false, error: 'Invalid User ID format.' };
    
    if (newPassword && newPassword.length < 12) {
      return { success: false, error: 'Enterprise security requires a minimum 12-character password.' };
    }

    setProcessingId(userId);
    try {
      const { error: funcError } = await supabase.functions.invoke('admin-override-user', {
        body: { targetUserId: userId, newEmail, newPassword }
      });

      if (funcError) throw funcError;
      
      if (newEmail) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, email: newEmail } : u));
      }
      return { success: true };
    } catch (err: any) {
      console.error("Override Credentials Error:", err);
      return { success: false, error: err.message || 'Failed to override user credentials.' };
    } finally {
      setProcessingId(null);
    }
  }, []);

  return { users, loading, error, processingId, fetchUsers, updateUserFlags, overrideUserCredentials };
};