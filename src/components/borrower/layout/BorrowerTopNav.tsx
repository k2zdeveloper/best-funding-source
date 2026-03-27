import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Bell, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { BorrowerViewState } from '../BorrowerDashboard';
import logo from '../../../assets/logoBFS.png'; 

interface BorrowerTopNavProps {
  currentView: BorrowerViewState;
  setCurrentView: (view: BorrowerViewState) => void;
  onNavigate?: (view: string, id?: string) => void; // <-- ADDED PROP
}

export const BorrowerTopNav: React.FC<BorrowerTopNavProps> = ({ currentView, setCurrentView, onNavigate }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
      }
      setLoadingNotifs(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifs-borrower-${userId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          setNotifications(prev => {
            if (prev.some(n => n.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

  const markAllAsRead = async () => {
    if (!userId || !notifications.some(n => !n.is_read)) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  };

  // --- SPA SAFE ROUTING LOGIC ---
  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    }

    setShowNotifications(false);

    if (notif.link && onNavigate) {
      if (notif.link === 'messages') {
        onNavigate('messages');
      } else if (notif.link.includes('/pitch_detail/')) {
        const pitchId = notif.link.split('/pitch_detail/')[1];
        onNavigate('pitch_detail', pitchId);
      } else {
        onNavigate('overview');
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const NavButton = ({ view, label }: { view: BorrowerViewState, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => onNavigate ? onNavigate(view) : setCurrentView(view)} 
        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
          isActive ? 'bg-white shadow-sm text-[#1B6FA5]' : 'text-slate-500 hover:text-[#21B0A6]'
        }`}
      >
        {label}
      </button>
    );
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-8">
        
        <div className="flex-shrink-0 flex items-center z-50">
          <button 
            onClick={() => onNavigate ? onNavigate('overview') : setCurrentView('overview')}
            className="relative flex items-center justify-center h-10 px-3 bg-white rounded-full overflow-hidden group shadow-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6]"
          >
            <img 
              src={logo} 
              alt="BFS Logo" 
              className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <NavButton view="overview" label="Overview" />
          <NavButton view="pitch" label="Capital Request" />
          <NavButton view="settings" label="Settings" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <button 
          onClick={() => onNavigate ? onNavigate('messages') : setCurrentView('messages')} 
          className={`relative p-2 transition-colors rounded-full ${
            currentView === 'messages' ? 'bg-[#1B6FA5]/10 text-[#1B6FA5]' : 'text-slate-500 hover:text-[#21B0A6] hover:bg-[#21B0A6]/5'
          }`}
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 text-slate-500 hover:text-[#21B0A6] transition-colors rounded-full hover:bg-[#21B0A6]/5"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#21B0A6] rounded-full border-2 border-white animate-pulse"></span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Activity Feed</span>
                {hasUnread && (
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#1B6FA5] hover:text-[#21B0A6] transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className="px-5 py-4 border-b border-slate-50 hover:bg-[#1B6FA5]/5 cursor-pointer flex gap-3 items-start transition-colors group"
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-slate-200' : 'bg-[#21B0A6]'}`}></div>
                      <div className="flex-1">
                        <p className={`text-sm leading-snug ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>{n.title}</p>
                        {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{formatTimeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        
        <button onClick={handleSignOut} className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};