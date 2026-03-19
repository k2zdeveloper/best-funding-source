import React from 'react';
import { Search, Building2 } from 'lucide-react';

export interface ChatContact {
  id: number;
  name: string;
  role: string;
  online: boolean;
  unread: number;
  lastMsg: string;
}

interface ChatSidebarProps {
  contacts: ChatContact[];
  activeChat: number;
  onSelectChat: (id: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ contacts, activeChat, onSelectChat }) => {
  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col h-64 md:h-auto shrink-0">
      
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
          />
        </div>
      </div>
      
      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
        {contacts.map(contact => (
          <button 
            key={contact.id}
            onClick={() => onSelectChat(contact.id)}
            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
              activeChat === contact.id ? 'bg-white border border-slate-200 shadow-sm' : 'hover:bg-slate-100 border border-transparent'
            }`}
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeChat === contact.id ? 'bg-blue-50 text-blue-600' : 'bg-white border border-slate-200 text-slate-400'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              {contact.online && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className={`text-xs font-bold truncate ${activeChat === contact.id ? 'text-slate-900' : 'text-slate-700'}`}>
                  {contact.name}
                </p>
                {contact.unread > 0 && (
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {contact.unread}
                  </span>
                )}
              </div>
              <p className={`text-[11px] truncate ${contact.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                {contact.lastMsg}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};