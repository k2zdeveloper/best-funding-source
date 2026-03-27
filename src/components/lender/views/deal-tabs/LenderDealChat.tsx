import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Loader2, Info } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface LenderDealChatProps {
  loanId: string;
  companyName: string;
}

export const LenderDealChat: React.FC<LenderDealChatProps> = ({ loanId, companyName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `Hello. I am the AI Underwriting Assistant for the ${companyName} facility. What would you like to know about this deal's risk profile, collateral, or use of funds?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when a new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    // Add user's question to the chat instantly
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      // Hit our bulletproof Edge Function
      const { data, error } = await supabase.functions.invoke('generate-qna-draft', {
        body: { question: userText, loanId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Add the AI's response to the chat
      const newAiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: data.draftText 
      };
      setMessages(prev => [...prev, newAiMsg]);

    } catch (err) {
      console.error("Chat Error:", err);
      // Failsafe error message
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: "I apologize, but I am currently unable to access the diligence servers. Please try again or contact the platform administrator." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
      
      {/* Header & Enterprise Disclaimer */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-[#21B0A6]" />
          <h3 className="text-white font-bold tracking-tight">Deal Intelligence AI</h3>
        </div>
        <div className="flex items-start gap-2 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
            <strong className="text-slate-100">Disclaimer:</strong> You are chatting with an AI assistant. It can only answer questions based on the preliminary data room. All final terms are subject to the official closing documents.
          </p>
        </div>
      </div>

      {/* Chat History Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-[#1B6FA5] text-white' : 'bg-white border border-slate-200 text-[#21B0A6]'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3.5 text-sm leading-relaxed rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#1B6FA5] text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>

            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-[#21B0A6] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Analyzing Data Room...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a diligence question..."
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-4 bg-[#1B6FA5] text-white rounded-xl hover:bg-[#155A8A] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};