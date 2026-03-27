import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Lock, Loader2, Info, Bot } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { LenderDealChat } from './LenderDealChat'; // <-- NEW IMPORT

export const DiscussionTab: React.FC<{ deal: any }> = ({ deal }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQnA = async () => {
      if (!deal?.id) return;
      try {
        // Fetch published Q&A OR pending questions asked by THIS specific user
        const { data, error } = await supabase
          .from('deal_qna')
          .select('*')
          .eq('loan_id', deal.id)
          .or(`is_published.eq.true,lender_id.eq.${user?.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching Q&A:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQnA();
  }, [deal?.id, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        loan_id: deal.id,
        lender_id: user.id,
        question: newQuestion.trim(),
        is_published: false // Defaults to hidden until Admin answers
      };

      const { data, error } = await supabase
        .from('deal_qna')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Add the new pending question to the top of the list locally
      setQuestions(prev => [data, ...prev]);
      setNewQuestion('');
    } catch (err) {
      console.error("Error submitting question:", err);
      alert("Failed to submit question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#1B6FA5] animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Q&A Context Header */}
      <div className="bg-[#1B6FA5]/5 border border-[#1B6FA5]/20 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1B6FA5] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-slate-900">Secure Data Room Q&A</h3>
          <p className="text-xs text-slate-600 mt-1">
            Chat instantly with our Deal Intelligence AI to analyze the data room, or submit a formal diligence question directly to the platform administrators below.
          </p>
        </div>
      </div>

      {/* --- NEW: INSTANT AI CHATBOT --- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-[#21B0A6]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Instant Deal Intelligence</h3>
        </div>
        <LenderDealChat loanId={deal.id} companyName={deal.company_name || 'this borrower'} />
      </div>

      {/* --- DIVIDER --- */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">Or</span>
        </div>
      </div>

      {/* --- EXISTING: FORMAL ADMIN Q&A --- */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Submit Formal Inquiry to Admin</h3>
        
        {/* Question Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask an official question regarding the financials, collateral, or terms to go on the record..."
            className="w-full p-4 text-sm focus:outline-none resize-none min-h-[100px] bg-transparent"
          />
          <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Lock className="w-3 h-3" /> Secure Transmission
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !newQuestion.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B6FA5] text-white text-xs font-bold rounded-lg hover:bg-[#155A8A] transition-colors disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Submit to Admin
            </button>
          </div>
        </form>

        {/* Q&A Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Published Memos & Answers</h3>
          
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">No official questions yet</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to submit a formal diligence question for this deal.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-500">Q</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{q.question}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      Submitted on {new Date(q.created_at).toLocaleDateString()}
                      {!q.is_published && " • PENDING ADMIN REVIEW"}
                    </p>
                  </div>
                </div>
                
                {q.answer ? (
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#21B0A6]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-[#21B0A6]">A</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.answer}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1B6FA5] mt-2">
                        BFS Platform Admin
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50/50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting Official Admin Response...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};