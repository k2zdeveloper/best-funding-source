import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, LogOut, Bell, LayoutGrid, 
  Settings, HelpCircle, CheckCircle2, Circle,
  Briefcase, MessageSquare 
} from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';

// --- STRICT CODE SPLITTING: Lazy Load Views ---
const LenderOverview = lazy(() => import('./views/LenderOverview').then(m => ({ default: m.LenderOverview })));
const LenderMarketplace = lazy(() => import('./views/LenderMarketplace').then(m => ({ default: m.LenderMarketplace })));
const LenderDealDetail = lazy(() => import('./views/LenderDealDetail').then(m => ({ default: m.LenderDealDetail })));
const LenderSettings = lazy(() => import('./views/LenderSettings').then(m => ({ default: m.LenderSettings })));
const LenderHelp = lazy(() => import('./views/LenderHelp').then(m => ({ default: m.LenderHelp })));
const LenderLegal = lazy(() => import('./views/LenderLegal').then(m => ({ default: m.LenderLegal })));
const LenderVerification = lazy(() => import('./views/LenderVerification').then(m => ({ default: m.LenderVerification })));
const LenderMessages = lazy(() => import('./views/LenderMessages').then(m => ({ default: m.LenderMessages })));

export type ViewState = 'overview' | 'marketplace' | 'settings' | 'help' | 'legal' | 'deal-detail' | 'verification' | 'messages';

export const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate('/login', { replace: true });
      
      setUserData({
        ...user.user_metadata,
        id: user.id,
        is_verified: user.user_metadata?.is_verified || false 
      });
      
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

  const handleOpenDeal = (deal: any) => {
    setSelectedDeal(deal);
    setCurrentView('deal-detail');
    window.scrollTo(0, 0); 
  };

  const notifications = [
    { id: 1, title: 'Verification Approved by Compliance.', time: '2h ago', read: false },
    { id: 2, title: 'New Deal: Project Alpha matches your criteria.', time: '1d ago', read: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* --- PREMIUM HEADER --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Enterprise<span className="text-slate-500">Funding</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setCurrentView('overview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Overview
            </button>
            <button onClick={() => setCurrentView('marketplace')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'marketplace' || currentView === 'deal-detail' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Marketplace
            </button>
            <button onClick={() => setCurrentView('settings')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentView === 'settings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Settings
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* MESSAGING ICON */}
          <button 
            onClick={() => setCurrentView('messages')} 
            className={`relative p-2 transition-colors rounded-full ${currentView === 'messages' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* NOTIFICATIONS ICON */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50">
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full border-2 border-white"></span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Activity Feed</span>
                  <span className="text-[10px] font-bold text-slate-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer flex gap-3 items-start transition-colors group">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-slate-200' : 'bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.4)]'}`}></div>
                      <div>
                        <p className={`text-sm leading-snug ${n.read ? 'text-slate-600' : 'text-slate-900 font-bold group-hover:text-slate-700 transition-colors'}`}>{n.title}</p>
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {!userData?.is_verified && currentView !== 'deal-detail' && currentView !== 'verification' && (
          <VerificationBanner onVerifyClick={() => setCurrentView('verification')} />
        )}
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>}>
          
          {currentView === 'overview' && <LenderOverview userData={userData} onOpenDeal={handleOpenDeal} />}
          {currentView === 'marketplace' && <LenderMarketplace userData={userData} onOpenDeal={handleOpenDeal} />}
          {currentView === 'messages' && <LenderMessages userData={userData} />}
          {currentView === 'settings' && <LenderSettings userData={userData} />}
          {currentView === 'help' && <LenderHelp />}
          {currentView === 'legal' && <LenderLegal />}
          
          {currentView === 'deal-detail' && selectedDeal && (
            <LenderDealDetail deal={selectedDeal} userData={userData} onBack={() => setCurrentView('marketplace')} />
          )}

          {currentView === 'verification' && (
            <LenderVerification user={userData} onComplete={() => setCurrentView('overview')} />
          )}
          
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation (4 Icons max for clean UX) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-40 pb-safe">
        <button onClick={() => setCurrentView('overview')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'overview' ? 'text-slate-900' : 'text-slate-400'}`}>
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <button onClick={() => setCurrentView('marketplace')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'marketplace' || currentView === 'deal-detail' ? 'text-slate-900' : 'text-slate-400'}`}>
          <Briefcase className="w-5 h-5" />
          <span className="text-[9px] font-bold">Market</span>
        </button>
        <button onClick={() => setCurrentView('messages')} className={`flex flex-col items-center gap-1 p-2 relative ${currentView === 'messages' ? 'text-slate-900' : 'text-slate-400'}`}>
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          <span className="text-[9px] font-bold">Chat</span>
        </button>
        <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'settings' ? 'text-slate-900' : 'text-slate-400'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};