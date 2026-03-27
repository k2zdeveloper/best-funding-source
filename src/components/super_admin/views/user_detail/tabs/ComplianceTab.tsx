import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink, ChevronDown, ArrowRight, AlertTriangle } from 'lucide-react';
import { type FullUserProfile } from '../../../hooks/useAdminDirectory';
import { type VerificationData } from '../../../hooks/useAdminUserDetail';

const PREMADE_REASONS = [
  "Document is blurry, obscured, or illegible.",
  "Document is expired and no longer valid.",
  "Name/Entity on document does not match registered profile.",
  "Incomplete document submitted (missing pages or sections).",
  "Suspected fraudulent, altered, or tampered document.",
  "Incorrect document type provided for this requirement.",
  "Entity is not in good standing or registration is inactive.",
  "Proof of accreditation is insufficient or outdated.",
  "Periodic compliance review failed; updated documents required.",
  "Terms of Service violation resulting in KYC revocation."
];

interface ComplianceTabProps {
  user: FullUserProfile;
  verification: VerificationData | null;
  updating: boolean;
  onViewDocument: (path: string | undefined, title: string) => void;
  reviewVerification: (status: 'approved' | 'rejected', notes: string) => Promise<any>;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ user, verification, updating, onViewDocument, reviewVerification }) => {
  const [kycStep, setKycStep] = useState<'initial' | 'reject_reason' | 'confirm_reject' | 'confirm_approve'>('initial');
  const [adminNotes, setAdminNotes] = useState('');

  const isApproved = verification?.status === 'approved';

  const resetKycWizard = () => {
    setKycStep('initial');
    setAdminNotes('');
  };

  const executeKycDecision = async (status: 'approved' | 'rejected') => {
    await reviewVerification(status, adminNotes);
    resetKycWizard();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      {/* Document Display Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            {user.role === 'borrower' ? 'Borrower KYC Documents' : 'Lender KYC Documents'}
          </h3>
          {isApproved && <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5"/> Approved</span>}
          {verification?.status === 'rejected' && <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-200"><XCircle className="w-3.5 h-3.5"/> Rejected</span>}
          {verification?.status === 'pending' && <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-200"><Clock className="w-3.5 h-3.5"/> Pending Review</span>}
        </div>
        
        {verification ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === 'borrower' ? (
              <>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Employer ID (EIN)</p>
                  <p className="text-sm font-mono font-bold mb-4">{verification.ein || 'N/A'}</p>
                  <button onClick={() => onViewDocument(verification.valid_id_path, 'Valid ID')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                    Access Valid ID <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Corporate Entity</p>
                  <p className="text-sm font-bold mb-4 truncate">{verification.company_name || 'N/A'}</p>
                  <button onClick={() => onViewDocument(verification.business_reg_path, 'Business Registration')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                    Access Registration <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Tax ID / SSN</p>
                  <p className="text-sm font-mono font-bold mb-4">{verification.tax_id || 'N/A'}</p>
                  <button onClick={() => onViewDocument(verification.signatory_id_path, 'Signatory ID')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                    Access Signatory ID <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Lender Details</p>
                  <p className="text-sm font-bold mb-4 truncate">{verification.legal_name || 'N/A'}</p>
                  <button onClick={() => onViewDocument(verification.accreditation_path, 'Proof of Accreditation')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                    Access Accreditation Docs <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No Documents Found</p>
          </div>
        )}

        {verification?.admin_notes && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Previous Audit Notes</p>
            <p className="text-sm text-amber-900 font-medium">"{verification.admin_notes}"</p>
          </div>
        )}
      </div>

      {/* KYC Wizard Engine */}
      {verification && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all duration-300">
          {updating && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />}
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> KYC Decision Engine
          </h3>
          
          {kycStep === 'initial' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={() => setKycStep('confirm_approve')} disabled={isApproved} className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {isApproved ? 'Already Approved' : 'Approve Documents'}
              </button>
              <button onClick={() => setKycStep('reject_reason')} disabled={verification.status === 'rejected'} className="flex-1 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> {isApproved ? 'Revoke Verification' : 'Reject Documents'}
              </button>
            </div>
          )}

          {kycStep === 'reject_reason' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select {isApproved ? 'Revocation' : 'Rejection'} Reason</label>
                <div className="relative">
                  <select value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer font-medium">
                    <option value="">-- Select a premade reason --</option>
                    {PREMADE_REASONS.map((reason, idx) => (<option key={idx} value={reason}>{reason}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={resetKycWizard} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={() => { if (!adminNotes) return alert('Please select a reason.'); setKycStep('confirm_reject'); }} className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 flex justify-center items-center gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {kycStep === 'confirm_reject' && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
              <p className="text-sm font-bold text-red-900">Are you sure you want to {isApproved ? 'revoke' : 'reject'} this verification?</p>
              <p className="text-xs text-red-700 bg-white p-3 border border-red-100 rounded-lg font-medium shadow-sm">
                <span className="font-bold text-[10px] uppercase block mb-1">Reason:</span>{adminNotes}
              </p>
              <div className="flex gap-3">
                <button onClick={resetKycWizard} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={() => executeKycDecision('rejected')} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm flex justify-center items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Confirm {isApproved ? 'Revocation' : 'Rejection'}
                </button>
              </div>
            </div>
          )}

          {kycStep === 'confirm_approve' && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
              <p className="text-sm font-bold text-emerald-900">Are you sure you want to approve this verification?</p>
              <div className="text-xs text-emerald-800 bg-white p-3 border border-emerald-100 rounded-lg space-y-2 shadow-sm">
                <p className="flex justify-between border-b border-emerald-50 pb-1"><span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600">Entity Name:</span> {user.company_name || user.email}</p>
                <p className="flex justify-between border-b border-emerald-50 pb-1"><span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600">Account Type:</span> <span className="capitalize">{user.role}</span></p>
                <p className="flex justify-between"><span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600">Registration ID:</span> {verification.ein || verification.tax_id || 'N/A'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={resetKycWizard} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={() => executeKycDecision('approved')} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirm Approval
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};