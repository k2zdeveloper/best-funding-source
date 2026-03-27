import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ViewState } from '../LenderDashboard';

// Ensure this path matches where your logo is stored!
import logo from '../../../assets/logoBFS.png'; 

interface LenderTopNavProps {
  currentView: ViewState | 'deal-detail';
  setCurrentView: (view: ViewState | 'deal-detail') => void;
  onViewDeal?: (dealId: string) => void; // <-- ADDED: Passes the Deal ID to the parent
}

export const LenderTopNav: React.FC<LenderTopNavProps> = ({ currentView, setCurrentView, onViewDeal }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // --- 1. GET USER AND INITIAL FETCH ---
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

  // --- 2. REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    if (!userId) return;

    // Listen for new notifications specifically for this user
    const channel = supabase
      .channel(`notifs-${userId}`)
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
            // Prevent duplicates if Postgres fires twice
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

  // --- 3. UI HANDLERS ---
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

    // Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  // --- 4. CLICK HANDLER WITH REDIRECT (SPA SAFE) ---
  const handleNotificationClick = async (notif: any) => {
    // Mark as read optimistically
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    }

    // Close the dropdown
    setShowNotifications(false);

    // Smooth State-Based Redirect (No Reloading!)
    if (notif.link) {
      if (notif.link.includes('/deal/')) {
        // Extract the ID from the end of the link
        const dealId = notif.link.split('/deal/')[1]; 
        
        if (onViewDeal && dealId) {
          onViewDeal(dealId); // Tell the parent dashboard to open this specific deal
        } else {
          setCurrentView('marketplace'); // Fallback if no specific view handler exists
        }
      } else {
        setCurrentView('overview');
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

  const NavButton = ({ view, label }: { view: ViewState | ViewState[] | 'deal-detail', label: string }) => {
    const isActive = Array.isArray(view) ? view.includes(currentView) : currentView === view;
    return (
      <button 
        onClick={() => setCurrentView(Array.isArray(view) ? view[0] : view)} 
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
            onClick={() => setCurrentView('overview')}
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
          <NavButton view={['marketplace', 'deal-detail']} label="Marketplace" />
          <NavButton view="settings" label="Settings" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 text-slate-500 hover:text-[#21B0A6] transition-colors rounded-full hover:bg-[#21B0A6]/5"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#21B0A6] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Activity Feed</span>
                {hasUnread && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-[#1B6FA5] hover:text-[#21B0A6] transition-colors"
                  >
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
                        <p className={`text-sm leading-snug ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                          {n.title}
                        </p>
                        {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          {formatTimeAgo(n.created_at)}
                        </p>
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
          <LogOut className="w-4 h-4" /> 
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};