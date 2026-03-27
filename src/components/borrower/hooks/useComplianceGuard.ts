import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export type ComplianceStatus = 'checking' | 'none' | 'pending' | 'rejected' | 'verified';

export const useComplianceGuard = (userData: any) => {
  const [status, setStatus] = useState<ComplianceStatus>('checking');

  useEffect(() => {
    if (!userData) return;
    
    // Fast path: User is already verified in their JWT metadata
    if (userData.is_verified) {
      setStatus('verified');
      return;
    }

    let isMounted = true;

    const checkComplianceStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('borrower_verifications')
          .select('status')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (isMounted) {
          setStatus((data?.status as ComplianceStatus) || 'none');
        }
      } catch (err) {
        console.error("Compliance check failed:", err);
        if (isMounted) setStatus('none');
      }
    };

    checkComplianceStatus();

    return () => {
      isMounted = false;
    };
  }, [userData]);

  return { status };
};