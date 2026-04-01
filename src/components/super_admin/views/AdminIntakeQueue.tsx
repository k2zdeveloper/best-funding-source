import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Loader2, Inbox, Building2, Eye, Clock, 
  X, Briefcase, FileText, ExternalLink, Award, CheckCircle2, XCircle, AlertTriangle, Trash2, Lock 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SecureDocumentViewer } from './user_detail/SecureDocumentViewer'; 

export const AdminIntakeQueue: React.FC = () => {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MODAL & UNDERWRITING STATE ---
  const [selectedIntake, setSelectedIntake] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ status: 'active' | 'rejected' | 'delete' } | null>(null);
  const [selectedGrade, setSelectedGrade] = useState('A');
  
  const [activeDocument, setActiveDocument] = useState<any>(null);
  const [docLoading, setDocLoading] = useState(false);

  // --- DATA FETCHING ---
  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pre_qualifications')
        .select('*, profiles!borrower_id(is_verified)') 
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setIntakes(data || []);
    } catch (err) {
      console.error("Error fetching intakes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIntakes(); }, [fetchIntakes]);

  // --- SECURE DOCUMENT VIEWER ---
  const handleViewSecureDocument = async (path: string) => {
    if (!path) return alert("Document path is missing.");
    setDocLoading(true);
    try {
      const documentTitle = path.split('/').pop() || 'Secure Document';
      const { data, error } = await supabase.storage.from('secure_vault').createSignedUrl(path, 60);
      
      if (error) throw error;
      if (data?.signedUrl) {
        setActiveDocument({ 
          url: data.signedUrl, 
          type: path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image', 
          title: documentTitle 
        });
      }
    } catch (err: any) {
      console.error("Storage error:", err);
      alert("Security Error: Unable to generate secure access token.");
    } finally {
      setDocLoading(false);
    }
  };

  // --- APPROVE / REJECT / DELETE LOGIC ---
  const executeAction = async () => {
    if (!confirmAction || !selectedIntake) return;
    
    setUpdating(true);
    try {
      if (confirmAction.status === 'delete') {
        // HARD DELETE: Permanently erase abandoned/spam leads
        const { error } = await supabase
          .from('pre_qualifications')
          .delete()
          .eq('id', selectedIntake.id);

        if (error) throw error;
      } 
      else if (confirmAction.status === 'rejected') {
        // REJECT
        const { error } = await supabase
          .from('pre_qualifications')
          .update({ status: 'rejected' })
          .eq('id', selectedIntake.id);
          
        if (error) throw error;
      }
     else if (confirmAction.status === 'active') {
        // --- SECURE WORKFLOW: CALL DATABASE RPC ---
        
        const { error: rpcError } = await supabase.rpc('approve_and_post_loan', {
          p_intake_id: selectedIntake.id,
          p_borrower_id: selectedIntake.borrower_id,
          p_company_name: selectedIntake.company_name,
          p_facility_amount: selectedIntake.requested_amount,
          p_annual_revenue: selectedIntake.annual_revenue,
          p_industry: selectedIntake.industry,
          p_use_of_funds: selectedIntake.use_of_funds,
          p_documents: selectedIntake.document_paths || [],
          p_risk_grade: selectedGrade
        });

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error(`Approval failed: ${rpcError.message}`);
        }
      }
      // Remove the deal from the queue immediately so the UI feels fast
      setIntakes(prev => prev.filter(i => i.id !== selectedIntake.id));
      
      // Reset all modals
      setConfirmAction(null); 
      setSelectedIntake(null);  
      setSelectedGrade('A'); 
    } catch (err: any) {
      console.error("Action failed", err);
      alert(`Failed to process action: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredIntakes = intakes.filter(i => 
    i.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  // THE LOCK: Only unlocks if the Admin has approved their KYC Documents in the User Profile
  const isKycApproved = selectedIntake?.profiles?.is_verified === true; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- 1. CONFIRMATION & GRADING SUB-MODAL --- */}
      {confirmAction && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            {/* Dynamic Header based on Action Type */}
            <div className={`p-6 text-center border-b ${
              confirmAction.status === 'active' ? 'border-[#21B0A6]/20 bg-[#21B0A6]/5' : 
              confirmAction.status === 'delete' ? 'border-red-200 bg-red-50' : 
              'border-amber-200 bg-amber-50/30'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmAction.status === 'active' ? 'bg-[#21B0A6]/20 text-[#21B0A6]' : 
                confirmAction.status === 'delete' ? 'bg-red-200 text-red-700' : 
                'bg-amber-100 text-amber-600'
              }`}>
                {confirmAction.status === 'active' ? <CheckCircle2 className="w-6 h-6" /> : 
                 confirmAction.status === 'delete' ? <Trash2 className="w-6 h-6" /> : 
                 <AlertTriangle className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {confirmAction.status === 'active' ? 'Approve & Grade Deal' : 
                 confirmAction.status === 'delete' ? 'Permanently Delete Lead?' : 
                 'Reject This Deal?'}
              </h3>
              <p className="text-sm text-slate-500">
                {confirmAction.status === 'active' ? 'Assign an internal risk grade before pushing this to the Live Marketplace.' : 
                 confirmAction.status === 'delete' ? 'This will permanently erase this application and all associated data from the database. This cannot be undone.' : 
                 'This will mark the application as rejected in your historical logs.'}
              </p>
            </div>

            {/* Grading System (Only shows on Active) */}
            {confirmAction.status === 'active' && (
              <div className="p-6 bg-white border-b border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  <Award className="w-4 h-4 text-[#1B6FA5]" /> Select Risk Grade
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A', 'B', 'C'].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-3 rounded-xl font-black text-lg transition-all border-2 ${
                        selectedGrade === grade 
                          ? 'border-[#21B0A6] bg-[#21B0A6]/10 text-[#0A2235] shadow-sm' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setConfirmAction(null)} 
                disabled={updating}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction} 
                disabled={updating}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                  confirmAction.status === 'active' ? 'bg-[#21B0A6] hover:bg-[#1B6FA5]' : 
                  confirmAction.status === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {updating ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. UNDERWRITING REVIEW MODAL --- */}
      {selectedIntake && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 relative max-h-[95vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1B6FA5]" /> Underwriting Review
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">Deal ID: {selectedIntake.id}</p>
              </div>
              <button onClick={() => setSelectedIntake(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar bg-slate-50/30">
              {/* Header Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Legal Entity</p>
                  <p className="text-lg font-black text-[#0A2235] truncate">{selectedIntake.company_name}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{selectedIntake.contact_email}</p>
                </div>
                <div className="p-5 bg-blue-50 border border-blue-100 shadow-sm rounded-xl">
                  <p className="text-[10px] font-bold text-[#1B6FA5] uppercase tracking-widest mb-1">Requested Facility</p>
                  <p className="text-2xl font-black text-[#0A2235]">{formatCurrency(selectedIntake.requested_amount)}</p>
                </div>
                <div className="p-5 bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Annual Revenue</p>
                  <p className="text-2xl font-black text-[#0A2235]">{formatCurrency(selectedIntake.annual_revenue)}</p>
                </div>
              </div>

              {/* Firmographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white shadow-sm border border-slate-200 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedIntake.industry}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time in Biz</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedIntake.years_in_business} Years</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedIntake.phone_number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Headquarters</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{selectedIntake.headquarters}</p>
                </div>
              </div>

              {/* Text Data */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Use of Funds Strategy</p>
                </div>
                <div className="p-5 text-sm text-slate-700 leading-relaxed">
                  {selectedIntake.use_of_funds || "No details provided."}
                </div>
              </div>

              {/* Data Room Preview */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Data Room</p>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{selectedIntake.document_paths?.length || 0} Files</span>
                </div>
                <div className="p-5">
                  {selectedIntake.document_paths && selectedIntake.document_paths.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedIntake.document_paths.map((path: string, i: number) => {
                        const fileName = path.split('/').pop() || `Document ${i+1}`;
                        return (
                          <button 
                            key={i} 
                            onClick={() => handleViewSecureDocument(path)}
                            className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 hover:border-[#21B0A6] hover:bg-[#21B0A6]/5 hover:shadow-sm rounded-lg transition-all group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#21B0A6] transition-colors" />
                              <span className="text-xs font-bold text-slate-700 truncate group-hover:text-[#0A2235] transition-colors">{fileName}</span>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-[#21B0A6] transition-colors" />
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center">No structural documents attached.</p>
                  )}
                </div>
              </div>
            </div>

            {/* --- ACTION BAR (WITH HARD DELETE & VERIFICATION LOCK) --- */}
            <div className="p-5 border-t border-slate-200 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Side: Hard Delete / Trash */}
              <div className="w-full sm:w-auto">
                <button 
                  onClick={() => setConfirmAction({ status: 'delete' })} 
                  className="w-full sm:w-auto px-4 py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  title="Delete abandoned lead"
                >
                  <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Delete Lead</span>
                </button>
              </div>

              {/* Right Side: Reject & Approve (or Lock) */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setConfirmAction({ status: 'rejected' })} 
                  className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject Pitch
                </button>

                {isKycApproved ? (
                  <button 
                    onClick={() => setConfirmAction({ status: 'active' })} 
                    className="px-8 py-3 bg-[#21B0A6] text-white hover:bg-[#1B6FA5] hover:shadow-lg hover:shadow-[#1B6FA5]/20 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & List Deal
                  </button>
                ) : (
                  // THE KYC VERIFICATION LOCK UI
                  <div className="px-6 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-not-allowed">
                    <Lock className="w-4 h-4" /> Awaiting KYC Approval
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- 3. DOCUMENT VIEWER LOADING LAYER --- */}
      <SecureDocumentViewer activeDocument={activeDocument} onClose={() => setActiveDocument(null)} />
      {docLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-[90]">
           <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 animate-in zoom-in-95">
             <Loader2 className="w-8 h-8 text-[#21B0A6] animate-spin" />
             <p className="text-sm font-bold text-slate-700">Generating secure session...</p>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- MAIN PAGE BACKGROUND (THE QUEUE TABLE) --- */}
      {/* ========================================================= */}
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Inbox className="w-6 h-6 text-[#21B0A6]" /> Intake Queue
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review raw applications before they become active deals.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 shadow-sm">
              <Clock className="w-3.5 h-3.5" /> {intakes.length} Pending Review
            </span>
          </div>
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search applications..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21B0A6]/20 outline-none transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Applicant Entity</th>
                <th className="px-6 py-4">Requested Facility</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#21B0A6] mx-auto" /></td></tr>
              ) : filteredIntakes.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-medium">No pending applications in the queue. You're all caught up!</td></tr>
              ) : (
                filteredIntakes.map((intake) => (
                  <tr key={intake.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#1B6FA5]" />{intake.company_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {intake.id.split('-')[0]}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{formatCurrency(intake.requested_amount)}</p>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 inline-block">{intake.industry}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(intake.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedIntake(intake)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#21B0A6] text-white rounded-lg text-xs font-bold transition-all hover:bg-[#1B6FA5] shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-[#21B0A6]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Underwrite
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};