import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Bell, MessageSquare } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { BorrowerViewState } from '../BorrowerDashboard';

interface BorrowerTopNavProps {
  currentView: BorrowerViewState;
  setCurrentView: (view: BorrowerViewState) => void;
}

export const BorrowerTopNav: React.FC<BorrowerTopNavProps> = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Mock notifications - in production, fetch these from Supabase
  const notifications = [
    { id: 1, title: 'Apex Institutional downloaded your Financials.', time: '10m ago', read: false },
    { id: 2, title: 'New message from Crestview Capital.', time: '1h ago', read: false },
    { id: 3, title: 'Welcome to BestFunding.', time: '2d ago', read: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const NavButton = ({ view, label }: { view: BorrowerViewState, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => setCurrentView(view)} 
        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
          isActive ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            Best<span className="text-blue-600">Funding</span>
          </span>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <NavButton view="overview" label="Overview" />
          <NavButton view="pitch" label="Capital Request" />
          <NavButton view="settings" label="Settings" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* Messages */}
        <button 
          onClick={() => setCurrentView('messages')} 
          className={`relative p-2 transition-colors rounded-full ${
            currentView === 'messages' ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
          }`}
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Activity Feed</span>
                <button className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="px-5 py-4 border-b border-slate-50 hover:bg-blue-50/30 cursor-pointer flex gap-3 items-start transition-colors group">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-slate-200' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'}`}></div>
                    <div>
                      <p className={`text-sm leading-snug ${n.read ? 'text-slate-600' : 'text-slate-900 font-bold group-hover:text-blue-700 transition-colors'}`}>{n.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        
        <button onClick={handleSignOut} className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};