import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, LogOut, Bell, LayoutGrid, 
  Settings, CheckCircle2, Circle, Briefcase, MessageSquare, PlusCircle
} from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';

// --- STRICT CODE SPLITTING: Lazy Load Views ---
const BorrowerOverview = lazy(() => import('./views/BorrowerOverview').then(m => ({ default: m.BorrowerOverview })));
const BorrowerPitchBuilder = lazy(() => import('./views/BorrowerPitchBuilder').then(m => ({ default: m.BorrowerPitchBuilder })));
const BorrowerMessages = lazy(() => import('./views/BorrowerMessages').then(m => ({ default: m.BorrowerMessages })));
const BorrowerSettings = lazy(() => import('./views/BorrowerSettings').then(m => ({ default: m.BorrowerSettings })));

export type BorrowerViewState = 'overview' | 'pitch' | 'messages' | 'settings';

export const BorrowerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<BorrowerViewState>('overview');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate('/login', { replace: true });
      setUserData(user.user_metadata);
      setLoading(false);
    };
    fetchSession();
  }, [navigate]);

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

  // Mock Notifications - Specifically highlighting Lender Engagement
  const notifications = [
    { id: 1, title: 'Apex Institutional downloaded your Financials.', time: '10m ago', read: false, type: 'download' },
    { id: 2, title: 'New message from Crestview Capital.', time: '1h ago', read: false, type: 'message' },
    { id: 3, title: 'Verification Complete.', time: '2d ago', read: true, type: 'system' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* --- PREMIUM HEADER --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Best<span className="text-blue-600">Funding</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setCurrentView('overview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Overview
            </button>
            <button onClick={() => setCurrentView('pitch')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'pitch' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Capital Request
            </button>
            <button onClick={() => setCurrentView('messages')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'messages' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Messages
            </button>
            <button onClick={() => setCurrentView('settings')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'settings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Settings
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* INTERACTIVE NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Activity Feed</span>
                  <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">Mark all read</span>
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
          
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <VerificationBanner />
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
          {currentView === 'overview' && <BorrowerOverview userData={userData} onNavigate={setCurrentView} />}
          {currentView === 'pitch' && <BorrowerPitchBuilder userData={userData} />}
          {currentView === 'messages' && <BorrowerMessages />}
          {currentView === 'settings' && <BorrowerSettings userData={userData} />}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-40 pb-safe">
        <button onClick={() => setCurrentView('overview')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'overview' ? 'text-blue-600' : 'text-slate-400'}`}>
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <button onClick={() => setCurrentView('pitch')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'pitch' ? 'text-blue-600' : 'text-slate-400'}`}>
          <PlusCircle className="w-5 h-5" />
          <span className="text-[9px] font-bold">Pitch</span>
        </button>
        <button onClick={() => setCurrentView('messages')} className={`flex flex-col items-center gap-1 p-2 relative ${currentView === 'messages' ? 'text-blue-600' : 'text-slate-400'}`}>
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[9px] font-bold">Chat</span>
        </button>
        <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};