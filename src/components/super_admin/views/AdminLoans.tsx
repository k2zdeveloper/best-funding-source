import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Briefcase, Search, Loader2, ShieldAlert, CheckCircle2, 
  XCircle, Eye, TrendingUp, Clock, FileText, AlertTriangle, Building2, X, ExternalLink, Award
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SecureDocumentViewer } from './user_detail/SecureDocumentViewer';
import { useLocation, useNavigate } from 'react-router-dom';

// --- TYPES ---
interface LoanPosting {
  id: string;
  borrower_id: string;
  facility_amount: number;
  funded_amount: number;
  yield_rate: number;
  term_length_months: number;
  business_description: string;
  use_of_funds: string;
  status: 'pending_review' | 'active' | 'rejected' | 'fully_funded' | 'draft';
  risk_grade?: string; // NEW: Added risk grade
  created_at: string;
  documents?: any[];
  profiles?: { company_name: string; email: string };
}

export const AdminLoans: React.FC = () => {
  const [loans, setLoans] = useState<LoanPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'archived'>('pending');
  
  // Underwriting Modal State
  const [selectedLoan, setSelectedLoan] = useState<LoanPosting | null>(null);
  const [updating, setUpdating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- NEW: AUTO-OPEN DEAL FROM URL STATE ---
  useEffect(() => {
    // If we arrived from another page with a specific loan ID, and loans are loaded...
    if (location.state?.openLoanId && loans.length > 0) {
      const targetLoan = loans.find(l => l.id === location.state.openLoanId);
      
      if (targetLoan) {
        // Automatically pop the review modal open
        setSelectedLoan(targetLoan);
        
        // Clean up the URL state so it doesn't re-open if the user refreshes the page
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [loans, location.state, navigate, location.pathname]);
  // Custom Confirmation Modal & Grading State
  const [confirmAction, setConfirmAction] = useState<{
    loanId: string;
    status: 'active' | 'rejected';
  } | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('A'); // Default Grade

  // Document Viewer State
  const [docLoading, setDocLoading] = useState(false);
  const [activeDocument, setActiveDocument] = useState<{ url: string; type: 'pdf' | 'image'; title: string } | null>(null);

  const handleViewSecureDocument = async (path: string, documentTitle: string) => {
    if (!path) return alert("Document path is missing from the database.");
    setDocLoading(true);
    try {
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60);
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

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_postings')
        .select('*, profiles(company_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // --- FILTERING & STATS ---
  const filteredLoans = useMemo(() => {
    let filtered = loans;
    
    if (activeTab === 'pending') {
      filtered = filtered.filter(l => l.status === 'pending_review' || l.status === 'pending' as any);
    }
    else if (activeTab === 'active') {
      filtered = filtered.filter(l => l.status === 'active' || l.status === 'fully_funded');
    }
    else if (activeTab === 'archived') {
      filtered = filtered.filter(l => l.status === 'rejected' || l.status === 'draft');
    }

    if (searchTerm) {
      const lowerQ = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        l.profiles?.company_name?.toLowerCase().includes(lowerQ) || 
        l.business_description?.toLowerCase().includes(lowerQ) ||
        l.id.toLowerCase().includes(lowerQ)
      );
    }
    
    return filtered;
  }, [loans, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const pendingCount = loans.filter(l => l.status === 'pending_review' || l.status === 'pending' as any).length;
    const activeCount = loans.filter(l => l.status === 'active').length;
    const totalVolume = loans.filter(l => l.status === 'active' || l.status === 'fully_funded')
                             .reduce((sum, l) => sum + Number(l.facility_amount), 0);
    return { pendingCount, activeCount, totalVolume };
  }, [loans]);

  // --- EXECUTE REAL DATABASE UPDATE WITH GRADE ---
  const executeStatusUpdate = async () => {
    if (!confirmAction) return;
    
    setUpdating(true);
    try {
      // Build the payload. Only add risk_grade if we are approving it.
      const updatePayload: any = { status: confirmAction.status };
      if (confirmAction.status === 'active') {
        updatePayload.risk_grade = selectedGrade;
      }

      const { error } = await supabase
        .from('loan_postings')
        .update(updatePayload)
        .eq('id', confirmAction.loanId);

      if (error) throw error;
      
      // Refresh local UI instantly
      setLoans(prev => prev.map(l => l.id === confirmAction.loanId ? { ...l, ...updatePayload } : l));
      setConfirmAction(null); 
      setSelectedLoan(null);  
      setSelectedGrade('A'); // Reset grade for next time
    } catch (err: any) {
      console.error("Status update failed", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- PREMIUM CUSTOM CONFIRMATION MODAL WITH GRADING --- */}
      {confirmAction && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className={`p-6 text-center border-b ${confirmAction.status === 'active' ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {confirmAction.status === 'active' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {confirmAction.status === 'active' ? 'Approve & Grade Deal' : 'Reject This Deal?'}
              </h3>
              <p className="text-sm text-slate-500">
                {confirmAction.status === 'active' 
                  ? 'Assign an internal risk grade before pushing this to the Live Marketplace.' 
                  : 'This will reject the pitch and remove it from the underwriting queue. This action cannot be undone.'}
              </p>
            </div>

            {/* NEW: Grading Selector (Only shows when approving) */}
            {confirmAction.status === 'active' && (
              <div className="p-6 bg-white border-b border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  <Award className="w-4 h-4 text-blue-500" /> Select Risk Grade
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A', 'B', 'C'].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-3 rounded-xl font-black text-lg transition-all border-2 ${
                        selectedGrade === grade 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setConfirmAction(null)} 
                disabled={updating}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusUpdate} 
                disabled={updating}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                  confirmAction.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {updating ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SECURE DOCUMENT VIEWER --- */}
      <SecureDocumentViewer activeDocument={activeDocument} onClose={() => setActiveDocument(null)} />
      {docLoading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-[60]">
           <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="text-sm font-bold text-slate-700">Generating secure session...</p>
           </div>
        </div>
      )}

      {/* --- UNDERWRITING REVIEW MODAL --- */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 relative max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" /> Underwriting Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Deal ID: {selectedLoan.id}</p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Header Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl col-span-3 sm:col-span-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedLoan.profiles?.company_name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl col-span-3 sm:col-span-2 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Requested Facility</p>
                    <p className="text-xl font-black text-blue-700">{formatCurrency(selectedLoan.facility_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1 justify-end"><TrendingUp className="w-3.5 h-3.5"/> {selectedLoan.yield_rate}%</p>
                  </div>
                </div>
              </div>

              {/* Text Data */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Description</p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm">
                  {selectedLoan.business_description || "No description provided."}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Use of Funds</p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm">
                  {selectedLoan.use_of_funds || "No details provided."}
                </div>
              </div>

              {/* Data Room Preview */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data Room Payload</p>
                {selectedLoan.documents && selectedLoan.documents.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedLoan.documents.map((doc: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => handleViewSecureDocument(doc.path || doc.file_path, doc.title)}
                        className="flex items-center justify-between w-full p-3 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{doc.title}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 border border-dashed rounded-lg text-center">No documents attached.</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
              {selectedLoan.status === 'pending_review' || selectedLoan.status === 'pending' as any ? (
                <>
                  <button 
                    onClick={() => setConfirmAction({ loanId: selectedLoan.id, status: 'rejected' })} 
                    className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject Pitch
                  </button>
                  <button 
                    onClick={() => setConfirmAction({ loanId: selectedLoan.id, status: 'active' })} 
                    className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & List Deal
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between py-2 px-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Status: <span className="text-slate-700">{selectedLoan.status.replace('_', ' ')}</span>
                  </p>
                  {selectedLoan.risk_grade && (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Grade: <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">{selectedLoan.risk_grade}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Deal Flow & Underwriting</h2>
          <p className="text-sm text-slate-500 mt-1">Review capital requests, approve pitches, and monitor the live marketplace.</p>
        </div>
      </div>

      {/* --- QUICK STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Underwriting Queue</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.pendingCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Active Deals</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.activeCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Deal Volume</p>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalVolume)}</h3>
          </div>
        </div>
      </div>

      {/* --- MAIN TABLE UI --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
          <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200 w-fit">
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Pending Review {stats.pendingCount > 0 && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{stats.pendingCount}</span>}
            </button>
            <button onClick={() => setActiveTab('active')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Live Market
            </button>
            <button onClick={() => setActiveTab('archived')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'archived' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Archived
            </button>
          </div>

          <div className="relative w-full max-w-xs shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entity or deal ID..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 outline-none"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Borrowing Entity</th>
                <th className="px-6 py-4">Facility Details</th>
                <th className="px-6 py-4">Status & Grade</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">No deals found in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {loan.profiles?.company_name || 'Unknown Entity'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {loan.id.split('-')[0]}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{formatCurrency(loan.facility_amount)}</p>
                      <div className="flex gap-2 text-[10px] font-bold mt-1">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">{loan.yield_rate}% Yield</span>
                        <span className="text-slate-500 bg-slate-100 px-1.5 rounded">{loan.term_length_months} mo</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex flex-col items-start gap-1">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${
                        loan.status === 'pending_review' || loan.status === 'pending' as any ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        loan.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                      {loan.risk_grade && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded">
                          Grade: {loan.risk_grade}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(loan.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Deal
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