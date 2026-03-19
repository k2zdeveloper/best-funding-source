import React, { useState, useCallback } from 'react';
import { ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { useComplianceGuard } from '../hooks/useComplianceGuard';
import { ChatSidebar, type ChatContact } from './messages/ChatSidebar';
import { ChatWindow, type ChatMessage } from './messages/ChatWindow';

interface BorrowerMessagesProps {
  userData: any;
  onNavigate?: (view: string) => void;
}

// Mock Data (Would be fetched from DB in production)
const INITIAL_CONTACTS: ChatContact[] = [
  { id: 1, name: 'Apex Institutional Capital', role: 'Senior Underwriter', online: true, unread: 2, lastMsg: 'Could you clarify the Q3 revenue dip?' },
  { id: 2, name: 'Crestview Management', role: 'Deal Lead', online: false, unread: 0, lastMsg: 'We have reviewed the cap table. Looks good.' },
  { id: 3, name: 'Nexus Credit Partners', role: 'Syndicate Desk', online: true, unread: 0, lastMsg: 'Term sheet has been uploaded to your portal.' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'them', text: 'Hello, we are reviewing your recent facility request. The collateral looks solid, but we have a question regarding your Q3 EBITDA.', time: '10:42 AM' },
  { id: 2, sender: 'me', text: 'Good morning. Yes, the Q3 dip was due to a one-time capital expenditure for our new logistics software. It is fully amortized now.', time: '10:45 AM' },
  { id: 3, sender: 'them', text: 'Understood. Could you upload the invoice for that software expenditure to the data room so we can formally exclude it from our risk model?', time: '10:48 AM' },
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

    // Simulate auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'them',
        text: 'Received. We will process this and update your term sheet status shortly.',
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 tracking-wide uppercase text-[10px]">Securing Inbox...</p>
      </div>
    );
  }

  if (verifStatus === 'pending') {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center">
          <div className="bg-blue-50 p-4 rounded-full mb-6 relative">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Messaging Under Review</h2>
          <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
            Your business compliance documents are currently under review. Once approved, your secure inbox will be unlocked to communicate directly with institutional lenders.
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
            To prevent fraud and maintain network integrity, direct messaging with institutional lenders is restricted to fully verified entities. Please complete your KYB verification.
          </p>
          <button 
            onClick={() => onNavigate?.('verification')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Inbox</h1>
        <p className="text-sm text-slate-500">Secure, encrypted communications with verified lenders.</p>
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