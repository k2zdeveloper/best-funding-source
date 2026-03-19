import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { 
  ArrowLeft, Loader2, ShieldCheck, Building2, Ban, 
  UserX, Lock, AlertTriangle, ExternalLink, FileSearch, 
  History, Landmark, AlertCircle, CheckCircle2, XCircle, Clock, ChevronDown, ArrowRight
} from 'lucide-react';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import { SecureDocumentViewer } from './user_detail/SecureDocumentViewer';

// --- ENTERPRISE SOP: PREMADE REASONS ---
const PREMADE_REASONS = [
  "Document is blurry, obscured, or illegible.",
  "Document is expired and no longer valid.",
  "Name/Entity on document does not match registered profile.",
  "Incomplete document submitted (missing pages or sections).",
  "Suspected fraudulent, altered, or tampered document.",
  "Incorrect document type provided for this requirement.",
  "Entity is not in good standing or registration is inactive.",
  "Proof of accreditation is insufficient or outdated.",
  // Revocation specific reasons:
  "Periodic compliance review failed; updated documents required.",
  "Terms of Service violation resulting in KYC revocation."
];

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    user, preQuals, loans, verification, participation, 
    loading, updating, error, updateFlags, reviewVerification, forcePasswordReset
  } = useAdminUserDetail(id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'activity'>(
    (location.state?.activeTab as any) || 'overview'
  );
  
  const [docLoading, setDocLoading] = useState(false);
  const [activeDocument, setActiveDocument] = useState<{ url: string; type: 'pdf' | 'image'; title: string } | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  
  // --- KYC MULTI-STEP WIZARD STATE ---
  const [kycStep, setKycStep] = useState<'initial' | 'reject_reason' | 'confirm_reject' | 'confirm_approve'>('initial');
  const [adminNotes, setAdminNotes] = useState('');

  const resetKycWizard = () => {
    setKycStep('initial');
    setAdminNotes('');
  };

  const handleViewSecureDocument = async (path: string | undefined, documentTitle: string) => {
    if (!path) return alert("Document path is missing from the database.");
    setDocLoading(true);
    try {
      const { data, error: signError } = await supabase.storage.from('verification_documents').createSignedUrl(path, 60);
      if (signError) throw signError;
      if (data?.signedUrl) {
        setActiveDocument({ url: data.signedUrl, type: path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image', title: documentTitle });
      }
    } catch (err: any) {
      alert("Security Error: Unable to generate secure access token.");
    } finally {
      setDocLoading(false);
    }
  };

  const executeKycDecision = async (status: 'approved' | 'rejected') => {
    await reviewVerification(status, adminNotes);
    resetKycWizard();
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  if (error) return <div className="p-10 text-center font-bold text-red-600">{error.message}</div>;
  if (!user) return <div className="p-10 text-center text-slate-500">User profile could not be loaded.</div>;

  const isRestricted = user.restricted_until && new Date(user.restricted_until) > new Date();
  const isApproved = verification?.status === 'approved';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      <SecureDocumentViewer activeDocument={activeDocument} onClose={() => setActiveDocument(null)} />

      {docLoading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-50">
           <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="text-sm font-bold text-slate-700">Generating secure session...</p>
           </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin-dashboard/users')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{user.company_name || 'Individual Account'}</h2>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${user.role === 'borrower' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{user.role}</span>
            </div>
            <p className="text-sm text-slate-500 font-mono mt-1">{user.email}</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: FileSearch },
            { id: 'compliance', label: 'KYC/Docs', icon: ShieldCheck },
            { id: 'activity', label: 'Marketplace', icon: History }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]"><Building2 className="w-4 h-4 text-blue-600" /> Corporate Profile</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Industry</p><p className="text-sm font-semibold">{user.industry || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p><p className="text-sm font-semibold">{new Date(user.created_at || '').toLocaleDateString()}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Revenue / AUM</p><p className="text-sm font-bold text-emerald-600">${user.revenue || user.aum || '0'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Verification</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${user.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.is_verified ? 'VERIFIED' : 'UNVERIFIED'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE DOCUMENTS & KYC ENGINE */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
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
                          <button onClick={() => handleViewSecureDocument(verification.valid_id_path, 'Valid ID')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                            Access Valid ID <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Corporate Entity</p>
                          <p className="text-sm font-bold mb-4 truncate">{verification.company_name || 'N/A'}</p>
                          <button onClick={() => handleViewSecureDocument(verification.business_reg_path, 'Business Registration')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                            Access Registration <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Tax ID / SSN</p>
                          <p className="text-sm font-mono font-bold mb-4">{verification.tax_id || 'N/A'}</p>
                          <button onClick={() => handleViewSecureDocument(verification.signatory_id_path, 'Signatory ID')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                            Access Signatory ID <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Lender Details</p>
                          <p className="text-sm font-bold mb-4 truncate">{verification.legal_name || 'N/A'}</p>
                          <button onClick={() => handleViewSecureDocument(verification.accreditation_path, 'Proof of Accreditation')} className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
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

              {/* MULTI-STEP KYC DECISION ENGINE */}
              {verification && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all duration-300">
                  {updating && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />}
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> KYC Decision Engine
                  </h3>
                  
                  {/* STEP 1: INITIAL SELECTION */}
                  {kycStep === 'initial' && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => setKycStep('confirm_approve')} 
                        disabled={isApproved} 
                        className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {isApproved ? 'Already Approved' : 'Approve Documents'}
                      </button>
                      <button 
                        onClick={() => setKycStep('reject_reason')} 
                        disabled={verification.status === 'rejected'} 
                        className="flex-1 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> {isApproved ? 'Revoke Verification' : 'Reject Documents'}
                      </button>
                    </div>
                  )}

                  {/* STEP 2 (REJECT/REVOKE): SELECT PREMADE REASON */}
                  {kycStep === 'reject_reason' && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Select {isApproved ? 'Revocation' : 'Rejection'} Reason</label>
                        <div className="relative">
                          <select 
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer font-medium"
                          >
                            <option value="">-- Select a premade reason --</option>
                            {PREMADE_REASONS.map((reason, idx) => (
                              <option key={idx} value={reason}>{reason}</option>
                            ))}
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

                  {/* STEP 3 (REJECT/REVOKE): FINAL CONFIRMATION */}
                  {kycStep === 'confirm_reject' && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
                      <p className="text-sm font-bold text-red-900">Are you sure you want to {isApproved ? 'revoke' : 'reject'} this verification?</p>
                      <p className="text-xs text-red-700 bg-white p-3 border border-red-100 rounded-lg font-medium shadow-sm">
                        <span className="font-bold text-[10px] uppercase block mb-1">Reason:</span>
                        {adminNotes}
                      </p>
                      <div className="flex gap-3">
                        <button onClick={resetKycWizard} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={() => executeKycDecision('rejected')} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm flex justify-center items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Confirm {isApproved ? 'Revocation' : 'Rejection'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 (APPROVE): FINAL CONFIRMATION */}
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
          )}

          {/* TAB 3: MARKETPLACE ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">Platform History</h3>
                <p className="text-xs text-slate-500 italic">User has {loans.length} active loans and {participation.length} deal engagements.</p>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: ADMIN CONTROLS (LIGHT THEME) --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            {updating && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />}
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Security & Access
            </h3>
            
            <div className="space-y-3">
              <button onClick={() => updateFlags({ is_blocked: !user.is_blocked })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.is_blocked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                <div className="text-left">
                  <p className="text-xs font-bold mb-0.5">{user.is_blocked ? 'Restore Access' : 'Suspend Account'}</p>
                  <p className={`text-[10px] font-mono ${user.is_blocked ? 'text-red-500' : 'text-slate-400'}`}>{user.is_blocked ? 'Status: Revoked' : 'Status: Active'}</p>
                </div>
                <Ban className={`w-5 h-5 ${user.is_blocked ? 'text-red-500' : 'text-slate-400'}`} />
              </button>

              <button onClick={() => updateFlags({ prevent_deletion: !user.prevent_deletion })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.prevent_deletion ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                <div className="text-left">
                  <p className="text-xs font-bold mb-0.5">{user.prevent_deletion ? 'Remove Legal Hold' : 'Enforce Legal Hold'}</p>
                  <p className={`text-[10px] font-mono ${user.prevent_deletion ? 'text-amber-600' : 'text-slate-400'}`}>{user.prevent_deletion ? 'Deletion Locked' : 'Can Delete Account'}</p>
                </div>
                <UserX className={`w-5 h-5 ${user.prevent_deletion ? 'text-amber-500' : 'text-slate-400'}`} />
              </button>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Lock className="w-3 h-3"/> Force Password Reset</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="New password..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                  <button onClick={() => { forcePasswordReset(newPassword); setNewPassword(''); }} disabled={!newPassword || newPassword.length < 8} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};