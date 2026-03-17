import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, LogOut, Bell, LayoutGrid, 
  Settings, HelpCircle, FileText, CheckCircle2, Circle,
  Briefcase
} from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';

// --- STRICT CODE SPLITTING: Lazy Load Views ---
const LenderOverview = lazy(() => import('./views/LenderOverview').then(m => ({ default: m.LenderOverview })));
const LenderMarketplace = lazy(() => import('./views/LenderMarketplace').then(m => ({ default: m.LenderMarketplace })));
const LenderDealDetail = lazy(() => import('./views/LenderDealDetail').then(m => ({ default: m.LenderDealDetail })));
const LenderSettings = lazy(() => import('./views/LenderSettings').then(m => ({ default: m.LenderSettings })));
const LenderHelp = lazy(() => import('./views/LenderHelp').then(m => ({ default: m.LenderHelp })));
const LenderLegal = lazy(() => import('./views/LenderLegal').then(m => ({ default: m.LenderLegal })));

export type ViewState = 'overview' | 'marketplace' | 'settings' | 'help' | 'legal' | 'deal-detail';

export const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // View Routing State
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  
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

  // --- NEW: Routing Handler for Deals ---
  // Sets the selected deal and changes the view to the full page layout
  const handleOpenDeal = (deal: any) => {
    setSelectedDeal(deal);
    setCurrentView('deal-detail');
    window.scrollTo(0, 0); // Scroll to top when opening a new page
  };

  const notifications = [
    { id: 1, title: 'Verification Approved', time: '2h ago', read: false },
    { id: 2, title: 'New Deal: Project Alpha matches your criteria.', time: '1d ago', read: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      
      {/* --- MINIMALIST HEADER --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
            <span className="font-bold text-sm tracking-tight">EnterpriseFunding</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setCurrentView('overview')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentView === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Dashboard
            </button>
            <button onClick={() => setCurrentView('marketplace')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentView === 'marketplace' || currentView === 'deal-detail' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Marketplace
            </button>
            <button onClick={() => setCurrentView('settings')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentView === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Settings
            </button>
            <button onClick={() => setCurrentView('help')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentView === 'help' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              FAQ & Contact
            </button>
            <button onClick={() => setCurrentView('legal')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentView === 'legal' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              Legal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-1.5 text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-50">
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-slate-900 rounded-full"></span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</span>
                  <span className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-900">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 items-start transition-colors">
                      {n.read ? <Circle className="w-3 h-3 text-slate-200 mt-0.5" /> : <CheckCircle2 className="w-3 h-3 text-slate-900 mt-0.5" />}
                      <div>
                        <p className={`text-xs ${n.read ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>{n.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Hide verification banner if looking at a specific deal to maximize space */}
        {currentView !== 'deal-detail' && <VerificationBanner />}
        
        {/* Render the selected view dynamically */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>}>
          
          {currentView === 'overview' && <LenderOverview userData={userData} onOpenDeal={handleOpenDeal} />}
          {currentView === 'marketplace' && <LenderMarketplace onOpenDeal={handleOpenDeal} />}
          {currentView === 'settings' && <LenderSettings userData={userData} />}
          {currentView === 'help' && <LenderHelp />}
          {currentView === 'legal' && <LenderLegal />}
          
          {/* NEW: Render the Full Page Deal Details */}
          {currentView === 'deal-detail' && selectedDeal && (
            <LenderDealDetail 
              deal={selectedDeal} 
              onBack={() => setCurrentView('marketplace')} 
            />
          )}
          
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-40">
        <button onClick={() => setCurrentView('overview')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'overview' ? 'text-slate-900' : 'text-slate-400'}`}><LayoutGrid className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('marketplace')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'marketplace' || currentView === 'deal-detail' ? 'text-slate-900' : 'text-slate-400'}`}><Briefcase className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'settings' ? 'text-slate-900' : 'text-slate-400'}`}><Settings className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('help')} className={`flex flex-col items-center gap-1 p-2 ${currentView === 'help' ? 'text-slate-900' : 'text-slate-400'}`}><HelpCircle className="w-5 h-5" /></button>
      </div>
    </div>
  );
};