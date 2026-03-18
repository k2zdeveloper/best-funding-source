import React, { useState, useEffect } from 'react';
import { Search, Send, Building2, Paperclip, MoreVertical, CheckCircle2, Circle, ShieldCheck, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LenderMessagesProps {
  userData: any;
  onNavigate?: (view: string) => void;
}

export const LenderMessages: React.FC<LenderMessagesProps> = ({ userData, onNavigate }) => {
  const [activeChat, setActiveChat] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  
  // --- COMPLIANCE STATE ---
  const [verifStatus, setVerifStatus] = useState<'checking' | 'none' | 'pending' | 'rejected'>('checking');

  // --- SECURE COMPLIANCE CHECK ---
  useEffect(() => {
    if (!userData || userData.is_verified) {
      setVerifStatus('none');
      return;
    }

    const checkComplianceStatus = async () => {
      try {
        const { data } = await supabase
          .from('lender_verifications')
          .select('status')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setVerifStatus(data.status as 'pending' | 'rejected');
        } else {
          setVerifStatus('none');
        }
      } catch (err) {
        setVerifStatus('none');
      }
    };

    checkComplianceStatus();
  }, [userData]);

  // Simulated Chat Data (Lender Perspective)
  const contacts = [
    { id: 1, name: 'Stark Logistics', role: 'CFO', online: true, unread: 2, lastMsg: 'The software invoice is uploaded.' },
    { id: 2, name: 'Nexus BioTech', role: 'CEO', online: false, unread: 0, lastMsg: 'Thanks for the quick term sheet review.' },
    { id: 3, name: 'Acme Manufacturing', role: 'Controller', online: true, unread: 0, lastMsg: 'I will get the cap table to you by EOD.' },
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: 'me', text: 'Hello, we are reviewing your recent facility request. The collateral looks solid, but we have a question regarding your Q3 EBITDA.', time: '10:42 AM' },
    { id: 2, sender: 'them', text: 'Good morning. Yes, the Q3 dip was due to a one-time capital expenditure for our new logistics software. It is fully amortized now.', time: '10:45 AM' },
    { id: 3, sender: 'me', text: 'Understood. Could you upload the invoice for that software expenditure to the data room so we can formally exclude it from our risk model?', time: '10:48 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setMessageInput('');

    // Simulated Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'them',
        text: 'Received. We are uploading that file right now.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  // ==========================================
  // RENDER BLOCKS (GUARDS & UI)
  // ==========================================

  // --- 🚨 1. STRICT COMPLIANCE GUARDRAIL ---
  if (!userData?.is_verified) {
    if (verifStatus === 'checking') {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[10px]">Securing Inbox...</p>
        </div>
      );
    }

    if (verifStatus === 'pending') {
      return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-6 border border-slate-100 relative">
              <Clock className="w-12 h-12 text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Messaging Under Review</h2>
            <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
              Your institutional compliance documents are currently under review. Once approved, your secure inbox will be unlocked to communicate directly with borrowers and deal sponsors.
            </p>
            <button 
              onClick={() => onNavigate && onNavigate('overview')} 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-red-50 p-4 rounded-full mb-6 border border-red-100 relative">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Secure Inbox Locked</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            To maintain compliance and network integrity, direct messaging with companies is restricted to fully verified institutional lenders. Please complete your verification.
          </p>
          <button 
            onClick={() => onNavigate && onNavigate('verification')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md"
          >
            Start Verification Process
          </button>
        </div>
      </div>
    );
  }

  // --- 💬 2. SECURE MESSAGING UI (Verified Only) ---
  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deal Communications</h1>
        <p className="text-sm text-slate-500">Secure, encrypted communications with prospective borrowers.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* --- LEFT PANE: Contacts List --- */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col h-64 md:h-auto shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {contacts.map(contact => (
              <button 
                key={contact.id}
                onClick={() => setActiveChat(contact.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${activeChat === contact.id ? 'bg-white border border-slate-200 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeChat === contact.id ? 'bg-slate-100 text-slate-900' : 'bg-white border border-slate-200 text-slate-400'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  {contact.online && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-xs font-bold truncate ${activeChat === contact.id ? 'text-slate-900' : 'text-slate-700'}`}>{contact.name}</p>
                    {contact.unread > 0 && <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{contact.unread}</span>}
                  </div>
                  <p className={`text-[11px] truncate ${contact.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT PANE: Active Chat --- */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Stark Logistics</h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Active Now
                </p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">Today</span>
            </div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender === 'them' && (
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mb-1 shadow-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'me' 
                      ? 'bg-slate-900 text-white rounded-br-sm shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1.5 px-10">
                  <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCircle2 className="w-3 h-3 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
              <button type="button" className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a secure message..."
                className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none overflow-y-auto leading-relaxed"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> End-to-end AES-256 encrypted communication
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};