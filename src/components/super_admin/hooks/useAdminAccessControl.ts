import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { type FullUserProfile } from './useAdminDirectory';

export const useAdminAccessControl = () => {
  const [staff, setStaff] = useState<FullUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Fetch only internal team members
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setStaff((data as FullUserProfile[]) || []);
    } catch (err: any) {
      console.error("Fetch Staff Error:", err);
      setError('Failed to load access control list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // 2. Update Role (RBAC)
  const updateStaffRole = async (userId: string, newRole: 'admin' | 'super_admin') => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === userId ? { ...s, role: newRole } : s));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Revoke Access (Kill-switch)
  const revokeAccess = async (userId: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', userId);

      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === userId ? { ...s, is_blocked: true } : s));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setProcessingId(null);
    }
  };

  // 4. Create New Admin (Requires Edge Function)
  const inviteAdmin = async (email: string, role: 'admin' | 'super_admin', tempPassword: string) => {
    try {
      // NOTE: Creating users without signing out the current admin requires a secure Edge Function
      const { error } = await supabase.functions.invoke('admin-create-staff', {
        body: { email, role, password: tempPassword }
      });

      if (error) throw error;
      
      await fetchStaff(); // Refresh the list to show the new user
      return { success: true };
    } catch (err: any) {
      console.error("Invite Error:", err);
      return { success: false, error: err.message || 'Failed to provision new administrator.' };
    }
  };

  return { staff, loading, error, processingId, fetchStaff, updateStaffRole, revokeAccess, inviteAdmin };
};