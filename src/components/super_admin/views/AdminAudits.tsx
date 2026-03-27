import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquareWarning, FileText, AlertTriangle, ShieldCheck, 
  Loader2, RefreshCw, X, CheckCircle2, ShieldAlert, Activity, 
  DollarSign, Search, MessageCircle, Send, Sparkles, Bot
} from 'lucide-react';
import { useAdminAudits, type LoanAudit } from '../hooks/useAdminAudits';
import { supabase } from '../../../lib/supabase';

interface DealQnA {
  id: string;
  loan_id: string;
  lender_id: string; // <-- ADDED: We need this to know who to notify!
  question: string;
  answer: string | null;
  is_published: boolean;
  created_at: string;
  loan_postings: {
    profiles: { company_name: string };
  };
}

export const AdminAudits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qna' | 'loans'>('qna');
  const { loanAudits, loading: auditsLoading, error, refresh: refreshAudits } = useAdminAudits();
  
  const [qnaList, setQnaList] = useState<DealQnA[]>([]);
  const [qnaLoading, setQnaLoading] = useState(true);

  const [selectedQna, setSelectedQna] = useState<DealQnA | null>(null);
  const [adminAnswer, setAdminAnswer] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<LoanAudit | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // --- AI DRAFTING STATE ---
  const [isDrafting, setIsDrafting] = useState(false);

  const fetchQnA = useCallback(async () => {
    setQnaLoading(true);
    try {
      const { data, error } = await supabase
        .from('deal_qna')
        .select(`*, loan_postings ( profiles ( company_name ) )`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQnaList((data as any) || []);
    } catch (err) {
      console.error("Failed to fetch Q&A:", err);
    } finally {
      setQnaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQnA();
  }, [fetchQnA]);

  const handleGlobalRefresh = () => {
    refreshAudits();
    fetchQnA();
  };

  // --- REAL AI COPILOT LOGIC ---
  const handleAIDraft = async () => {
    if (!selectedQna) return;
    setIsDrafting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-qna-draft', {
        body: { 
          question: selectedQna.question, 
          loanId: selectedQna.loan_id 
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.draftText) {
        setAdminAnswer(data.draftText);
      } else {
        throw new Error("No draft was returned from the server.");
      }

    } catch (err) {
      console.error("AI Drafting failed:", err);
      alert("The AI Copilot encountered an error. Please type the answer manually.");
    } finally {
      setIsDrafting(false);
    }
  };

  // --- PUBLISH & NOTIFY LOGIC ---
  const handlePublishAnswer = async () => {
    if (!selectedQna || !adminAnswer.trim()) return;
    setUpdatingStatus(true);
    try {
      // 1. Save the Answer
      const { error: updateError } = await supabase
        .from('deal_qna')
        .update({ 
          answer: adminAnswer.trim(), 
          is_published: true,
          answered_at: new Date().toISOString() 
        })
        .eq('id', selectedQna.id);

      if (updateError) throw updateError;
      
      // 2. TRIGGER THE NOTIFICATION (Real-time to the Lender)
     // 2. TRIGGER THE NOTIFICATION (Real-time to the Lender)
      if (selectedQna.lender_id) {
        const companyName = selectedQna.loan_postings?.profiles?.company_name || 'a deal';
        
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: selectedQna.lender_id,
          title: 'Deal Q&A Updated',
          message: `The Admin answered your question regarding ${companyName}.`,
          // Add the link here! Make sure it matches your app's actual routing path
          link: `/deal/${selectedQna.loan_id}` 
        });

        // This will print the exact reason to your browser console if it ever fails!
        if (notifError) {
          console.error("CRITICAL: Failed to send notification:", notifError);
        }
      }
      // 3. Clean up the UI
      setSelectedQna(null);
      setAdminAnswer('');
      fetchQnA(); 
    } catch (err) {
      console.error("Failed to publish answer:", err);
      alert("Failed to publish the response.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateAuditStatus = async (newStatus: 'investigating' | 'cleared') => {
    if (!selectedAudit) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase.from('loan_audits').update({ status: newStatus }).eq('id', selectedAudit.id);
      if (error) throw error;
      setSelectedAudit(null);
      refreshAudits();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update audit status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const pendingQnaCount = qnaList.filter(q => !q.is_published).length;
  const isLoading = auditsLoading || qnaLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- ANSWER Q&A MODAL --- */}
      {selectedQna && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 relative">
            {updatingStatus && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin" />
              </div>
            )}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#1B6FA5]" /> Diligence Q&A Moderation
              </h3>
              <button onClick={() => { setSelectedQna(null); setAdminAnswer(''); setIsDrafting(false); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Associated Deal</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selectedQna.loan_postings?.profiles?.company_name || 'Unknown Entity'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#1B6FA5] uppercase tracking-widest mb-2">Lender Question</p>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-slate-800 leading-relaxed font-medium">
                  "{selectedQna.question}"
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Admin Response</p>
                  
                  {/* --- AI COPILOT BUTTON --- */}
                  <button 
                    onClick={handleAIDraft}
                    disabled={isDrafting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21B0A6]/10 text-[#21B0A6] hover:bg-[#21B0A6]/20 border border-[#21B0A6]/30 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isDrafting ? 'AI is drafting...' : 'Draft with AI Copilot'}
                  </button>
                </div>
                
                <textarea
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  placeholder="Type the official answer, or use the AI Copilot to generate a draft..."
                  disabled={isDrafting}
                  className={`w-full p-4 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] min-h-[120px] resize-none shadow-sm transition-all ${isDrafting ? 'border-[#21B0A6]/50 opacity-70 cursor-wait' : 'border-slate-200'}`}
                />
                
                {/* AI Warning Banner */}
                {adminAnswer && (
                  <div className="flex items-start gap-2 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <Bot className="w-3.5 h-3.5 shrink-0 text-[#1B6FA5]" />
                    <p>Review the drafted response above for accuracy before publishing. As the Admin, you are responsible for verified representations.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => { setSelectedQna(null); setAdminAnswer(''); setIsDrafting(false); }} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold rounded-xl transition-colors shadow-sm">
                Cancel
              </button>
              <button 
                onClick={handlePublishAnswer} 
                disabled={!adminAnswer.trim() || isDrafting}
                className="flex-1 py-2.5 bg-[#1B6FA5] text-white hover:bg-[#155A8A] text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Publish Answer Globally
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVESTIGATE LOAN MODAL --- */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 relative">
            {updatingStatus && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin" />
              </div>
            )}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1B6FA5]" /> Investigate Loan Audit
              </h3>
              <button onClick={() => setSelectedAudit(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity</p>
                  <p className="text-base font-bold text-slate-900 truncate">{selectedAudit.business_name}</p>
                </div>
                <div className={`p-4 border rounded-xl ${selectedAudit.risk_score > 80 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${selectedAudit.risk_score > 80 ? 'text-red-400' : 'text-orange-400'}`}>
                    <Activity className="w-3 h-3" /> System Risk Score
                  </p>
                  <p className={`text-xl font-black ${selectedAudit.risk_score > 80 ? 'text-red-700' : 'text-orange-700'}`}>
                    {selectedAudit.risk_score} <span className="text-sm font-medium opacity-50">/ 100</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Associated Deal Pitch</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500">Facility Amount:</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(selectedAudit.loan?.facility_amount || 0)}</span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-2">
                  {selectedAudit.loan?.business_description || "No description provided."}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Automated Flag Reason</p>
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-900 leading-relaxed shadow-sm">
                  {selectedAudit.flag_reason}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <p>Flagged on: {new Date(selectedAudit.created_at).toLocaleString()}</p>
                <p>Status: <span className="uppercase font-bold tracking-wider">{selectedAudit.status}</span></p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => handleUpdateAuditStatus('investigating')}
                disabled={selectedAudit.status === 'investigating'}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Actively Investigate
              </button>
              <button 
                onClick={() => handleUpdateAuditStatus('cleared')}
                className="flex-1 py-2.5 bg-[#21B0A6] text-white hover:bg-[#1C968D] text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Clear Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">System Audits & Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Manage diligence Q&A and review anomalous loan applications.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleGlobalRefresh} disabled={isLoading} className="p-2 text-slate-400 hover:text-[#1B6FA5] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title="Refresh Data">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setActiveTab('qna')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'qna' ? 'bg-white text-[#1B6FA5] shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>
              <MessageCircle className="w-4 h-4" /> Diligence Q&A
              {pendingQnaCount > 0 && <span className="bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-[10px] ml-1">{pendingQnaCount}</span>}
            </button>
            <button onClick={() => setActiveTab('loans')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'loans' ? 'bg-white text-[#1B6FA5] shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>
              <FileText className="w-4 h-4" /> Loan Audits
              {loanAudits.length > 0 && <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-[10px] ml-1">{loanAudits.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling Logs...</p>
          </div>
        )}

        {/* TAB 1: DILIGENCE Q&A */}
        {activeTab === 'qna' && (
          <div className="overflow-x-auto">
            {qnaList.length === 0 && !isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <ShieldCheck className="w-12 h-12 mb-3 text-slate-300" />
                 <p className="font-medium text-slate-600">No diligence questions pending.</p>
               </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Target Deal</th>
                    <th className="px-6 py-4">Question Preview</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qnaList.map(qna => (
                    <tr key={qna.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {qna.loan_postings?.profiles?.company_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 truncate max-w-xs">
                        {qna.question}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold w-fit ${
                          !qna.is_published ? 'text-amber-700 bg-amber-50 border border-amber-200' : 
                          'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        }`}>
                          {!qna.is_published ? 'NEEDS ANSWER' : 'PUBLISHED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(qna.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {!qna.is_published ? (
                          <button onClick={() => { setSelectedQna(qna); setAdminAnswer(''); setIsDrafting(false); }} className="px-3 py-1.5 text-xs font-bold bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 shadow-sm transition-colors">
                            Answer & Publish
                          </button>
                        ) : (
                          <button className="px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed">
                            Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: LOAN AUDITS */}
        {activeTab === 'loans' && (
          <div className="overflow-x-auto">
             {loanAudits.length === 0 && !isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <ShieldCheck className="w-12 h-12 mb-3 text-slate-300" />
                 <p className="font-medium text-slate-600">No anomalous loan applications detected.</p>
               </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Business</th>
                    <th className="px-6 py-4">Risk Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loanAudits.map(audit => (
                    <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{audit.business_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${audit.risk_score > 80 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {audit.risk_score} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold w-fit ${
                          audit.status === 'pending' ? 'text-orange-600 bg-orange-50' : 
                          audit.status === 'investigating' ? 'text-[#1B6FA5] bg-blue-50' : 
                          'text-[#21B0A6] bg-[#21B0A6]/10'
                        }`}>
                          {audit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(audit.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedAudit(audit)} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:border-orange-500 hover:text-orange-600 shadow-sm">
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};