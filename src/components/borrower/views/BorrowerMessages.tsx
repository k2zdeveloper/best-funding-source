import React, { useState, useCallback } from 'react';
import { ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { useComplianceGuard } from '../hooks/useComplianceGuard';
import { ChatSidebar, type ChatContact } from './messages/ChatSidebar';
import { ChatWindow, type ChatMessage } from './messages/ChatWindow';

interface BorrowerMessagesProps {
  userData: any;
  onNavigate?: (view: string) => void;
}

// Hub-and-Spoke: Only ONE contact, the Platform Admin
const INITIAL_CONTACTS: ChatContact[] = [
  { 
    id: 1, 
    name: 'Platform Underwriting', 
    role: 'Admin Support', 
    online: true, 
    unread: 1, 
    lastMsg: 'Welcome to Best Funding Source.' 
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { 
    id: 1, 
    sender: 'them', 
    text: 'Welcome to your secure portal. If you need assistance with KYC verification or your capital request, please message us here. This inbox is monitored by our underwriting team.', 
    time: '09:00 AM' 
  }
];

export const BorrowerMessages: React.FC<BorrowerMessagesProps> = ({ userData, onNavigate }) => {
  const { status: verifStatus } = useComplianceGuard(userData);
  
  const [activeChat, setActiveChat] = useState<number>(1);
  const [contacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const handleSendMessage = useCallback((text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);

    // Simulate auto-reply from Admin
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'them',
        text: 'Message received. A member of our support team will review this shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  }, []);

  // ==========================================
  // RENDER GUARDS
  // ==========================================
  if (verifStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[10px]">Securing Inbox...</p>
      </div>
    );
  }

  if (verifStatus === 'pending') {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-[#1B6FA5]/10 p-4 rounded-full mb-6 relative">
            <Clock className="w-12 h-12 text-[#1B6FA5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Messaging Under Review</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            Your business compliance documents are currently under review. Once approved, your secure inbox will be unlocked to communicate with our underwriting team.
          </p>
          <button 
            onClick={() => onNavigate?.('overview')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (verifStatus === 'none' || verifStatus === 'rejected') {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-red-50 p-4 rounded-full mb-6 relative">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Secure Inbox Locked</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            To maintain network integrity, direct messaging with the platform administrators is restricted to verified entities. Please complete your KYB verification.
          </p>
          <button 
            onClick={() => onNavigate?.('verification')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1B6FA5] text-white text-sm font-bold rounded-xl hover:bg-[#155A8A] transition-all shadow-lg shadow-[#1B6FA5]/20"
          >
            Start Verification Process
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI RENDER
  // ==========================================
  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-180px)] min-h-[600px] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Support & Underwriting</h1>
        <p className="text-sm text-slate-500">Secure, encrypted communications with the platform administrators.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <ChatSidebar 
          contacts={contacts} 
          activeChat={activeChat} 
          onSelectChat={setActiveChat} 
        />
        <ChatWindow 
          contact={contacts.find(c => c.id === activeChat)} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  );
};  