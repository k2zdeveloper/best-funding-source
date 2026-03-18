import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, ArrowRight, ShieldCheck, Clock, FileX } from 'lucide-react';

// Added a prop so the dashboard can tell the banner how to navigate to the verification page
interface VerificationBannerProps {
  onVerifyClick?: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ onVerifyClick }) => {
  const { isVerified, role } = useAuth();
  const [status, setStatus] = useState<'none' | 'pending' | 'rejected'>('none');
  const [loading, setLoading] = useState(true);

  // --- SECURELY CHECK SUBMISSION STATUS ---
  useEffect(() => {
    // If they are already fully verified in context, no need to check the DB.
    if (isVerified) {
      setLoading(false);
      return;
    }

    const checkVerificationStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Dynamically check the correct table based on their role
        const tableName = role === 'lender' ? 'lender_verifications' : 'borrower_verifications';
        
        const { data, error } = await supabase
          .from(tableName)
          .select('status')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && data.status) {
          setStatus(data.status);
        }
      } catch (err) {
        console.error("Error checking verification status", err);
      } finally {
        setLoading(false);
      }
    };

    checkVerificationStatus();
  }, [isVerified, role]);

  // Prevent UI flashing while checking the database
  if (loading) return null; 

  // --- STATE 1: FULLY VERIFIED (Ultra Minimalist) ---
  if (isVerified) {
    return (
      <div className="mb-8 flex items-center gap-3 px-5 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl animate-in fade-in shadow-sm">
        <div className="bg-emerald-100 p-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-emerald-800 tracking-tight">
          Identity verified. You have unrestricted access to the marketplace.
        </p>
      </div>
    );
  }

  // --- STATE 2: PENDING REVIEW (Elegant & Reassuring) ---
  if (status === 'pending') {
    return (
      <div className="mb-8 bg-blue-50/30 border border-blue-100 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-400"></div>
        <div className="flex flex-col sm:flex-row gap-5 justify-between sm:items-center ml-2">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 relative">
              <Clock className="w-5 h-5 text-blue-600" />
              {/* Subtle pulse effect for 'in progress' feel */}
              <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Verification Under Review
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                Your compliance documents have been securely received. Our underwriting team is currently reviewing your profile. We will notify you once approved.
              </p>
            </div>
          </div>
          <button disabled className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-400 text-sm font-bold rounded-xl w-full sm:w-auto cursor-not-allowed">
            Reviewing...
          </button>
        </div>
      </div>
    );
  }

  // --- STATE 3: REJECTED (Clear & Actionable) ---
  if (status === 'rejected') {
    return (
      <div className="mb-8 bg-red-50/30 border border-red-100 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
        <div className="flex flex-col sm:flex-row gap-5 justify-between sm:items-center ml-2">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
              <FileX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Verification Unsuccessful
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                We could not verify your identity with the provided documents. Please ensure your documents are clear, valid, and match your registered details.
              </p>
            </div>
          </div>
          <button onClick={onVerifyClick} className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-md w-full sm:w-auto">
            Try Again <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- STATE 4: UNVERIFIED / ACTION REQUIRED (Urgent but Clean) ---
  return (
    <div className="mb-8 bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
      
      <div className="flex flex-col sm:flex-row gap-5 justify-between sm:items-center ml-2">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Action Required: Identity Verification
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              {role === 'borrower' 
                ? "To protect our network, please verify your business identity before requesting capital or accepting term sheets."
                : "To comply with financial regulations, please complete your institutional verification before funding loans."}
            </p>
          </div>
        </div>

        <button 
          onClick={onVerifyClick}
          className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/10 w-full sm:w-auto"
        >
          Verify Identity <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};