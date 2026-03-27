import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { VerificationBanner } from '../dashboard/VerificationBanner';

// --- IMPORT YOUR NEW DYNAMIC NAVIGATION ---
import { BorrowerTopNav } from './layout/BorrowerTopNav';
import { BorrowerBottomNav } from './layout/BorrowerBottomNav';

// --- STRICT CODE SPLITTING: Lazy Load Views ---
const BorrowerOverview = lazy(() => import('./views/BorrowerOverview').then(m => ({ default: m.BorrowerOverview })));
const BorrowerPitchBuilder = lazy(() => import('./views/BorrowerPitchBuilder').then(m => ({ default: m.BorrowerPitchBuilder })));
const BorrowerMessages = lazy(() => import('./views/BorrowerMessages').then(m => ({ default: m.BorrowerMessages })));
const BorrowerSettings = lazy(() => import('./views/BorrowerSettings').then(m => ({ default: m.BorrowerSettings })));
const BorrowerVerification = lazy(() => import('./views/BorrowerVerification').then(m => ({ default: m.BorrowerVerification })));
const BorrowerPitchDetail = lazy(() => import('./views/BorrowerPitchDetail').then(m => ({ default: m.BorrowerPitchDetail })));

export type BorrowerViewState = 'overview' | 'pitch' | 'messages' | 'settings' | 'verification' | 'pitch_detail';

export const BorrowerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  const [currentView, setCurrentView] = useState<BorrowerViewState>('overview');
  const [activePitchId, setActivePitchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate('/login', { replace: true });
      
      setUserData({
        ...user.user_metadata,
        id: user.id 
      });
      
      setLoading(false);
    };
    fetchSession();
  }, [navigate]);

  // CUSTOM NAVIGATION HANDLER
  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view as BorrowerViewState);
    if (id) {
      setActivePitchId(id);
    }
    window.scrollTo(0, 0); // Good UX practice to scroll to top on navigation
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 md:pb-0">
      
      {/* --- NEW DYNAMIC HEADER --- */}
      <BorrowerTopNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onNavigate={handleNavigate} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {!userData?.is_verified && currentView !== 'verification' && (
          <VerificationBanner onVerifyClick={() => setCurrentView('verification')} />
        )}
        
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin" />
          </div>
        }>
          
          {currentView === 'overview' && <BorrowerOverview userData={userData} onNavigate={handleNavigate} />}
          {currentView === 'messages' && <BorrowerMessages userData={userData} onNavigate={handleNavigate} />}
          {currentView === 'settings' && <BorrowerSettings userData={userData} />}
          {currentView === 'pitch' && <BorrowerPitchBuilder userData={userData} onNavigate={handleNavigate} />}
          
          {currentView === 'verification' && (
            <BorrowerVerification user={userData} onComplete={() => handleNavigate('overview')} />
          )}

          {currentView === 'pitch_detail' && activePitchId && (
            <BorrowerPitchDetail 
              pitchId={activePitchId} 
              userData={userData} 
              onBack={() => handleNavigate('overview')} 
            />
          )}

        </Suspense>
      </main>

      {/* --- NEW DYNAMIC MOBILE NAV --- */}
      <BorrowerBottomNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

    </div>
  );
};