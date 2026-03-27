import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export interface ChatReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: { company_name: string; email: string };
  reported: { company_name: string; email: string };
  reporter_name: string;
  reported_name: string;
}

export interface LoanAudit {
  id: string;
  flag_reason: string;
  risk_score: number;
  status: string;
  created_at: string;
  loan: { facility_amount: number; business_description: string };
  borrower: { company_name: string };
  business_name: string;
}

export const useAdminAudits = () => {
  const [chatReports, setChatReports] = useState<ChatReport[]>([]);
  const [loanAudits, setLoanAudits] = useState<LoanAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [chatRes, loanRes] = await Promise.all([
        supabase
          .from('chat_reports')
          .select(`
            id, reason, status, created_at,
            reporter:profiles!chat_reports_reporter_id_fkey(company_name, email),
            reported:profiles!chat_reports_reported_id_fkey(company_name, email)
          `)
          .order('created_at', { ascending: false }),
          
        supabase
          .from('loan_audits')
          .select(`
            id, flag_reason, risk_score, status, created_at,
            loan:loan_postings(facility_amount, business_description),
            borrower:profiles!loan_audits_borrower_id_fkey(company_name)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (chatRes.error) throw chatRes.error;
      if (loanRes.error) throw loanRes.error;

      const formattedChats = (chatRes.data || []).map((chat: any) => ({
        ...chat,
        reporter_name: chat.reporter?.company_name || chat.reporter?.email || 'Unknown',
        reported_name: chat.reported?.company_name || chat.reported?.email || 'Unknown',
      }));

      const formattedLoans = (loanRes.data || []).map((audit: any) => ({
        ...audit,
        business_name: audit.borrower?.company_name || 'Unknown Business',
      }));

      setChatReports(formattedChats);
      setLoanAudits(formattedLoans);
    } catch (err: any) {
      console.error("Failed to fetch audits:", err);
      setError("Failed to synchronize with audit database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  return { chatReports, loanAudits, loading, error, refresh: fetchAudits };
};