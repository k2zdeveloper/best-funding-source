import React, { useState } from 'react';
import { Building2, Circle, MoreVertical, Paperclip, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { ChatContact } from './ChatSidebar';

export interface ChatMessage {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatWindowProps {
  contact: ChatContact | undefined;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!contact) return <div className="flex-1 bg-white flex items-center justify-center text-slate-400">Select a conversation</div>;

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{contact.name}</h2>
            {contact.online ? (
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Active Now
              </p>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offline</p>
            )}
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">Today</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'them' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 mb-1">
                  <Building2 className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'me' 
                  ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-600/10' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5 px-10">
              <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
              {msg.sender === 'me' && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <button type="button" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a secure message..."
            className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none overflow-y-auto leading-relaxed"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" /> End-to-end AES-256 encrypted communication
        </p>
      </div>

    </div>
  );
};