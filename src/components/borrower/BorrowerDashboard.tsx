import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
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

  // --- NEW: PASSWORD SETUP STATE ---
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate('/login', { replace: true });
      
      // THE FIX: Fetch the LIVE profile data from the database!
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserData({
        ...user.user_metadata, // Keep the base auth metadata
        ...profile,            // Overwrite with the LIVE database truth!
        id: user.id 
      });
      
      setLoading(false);
    };
    fetchSession();

    // --- NEW: CHECK FOR INVITE HASH ---
    if (window.location.hash.includes('type=invite') || window.location.hash.includes('type=recovery')) {
      setShowPasswordSetup(true);
      // Clean the URL bar so it looks professional
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [navigate]);

  // --- NEW: PASSWORD SAVE HANDLER ---
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setShowPasswordSetup(false);
    } catch (err: any) {
      alert(`Failed to set password: ${err.message}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

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
      
      {/* --- NEW: MANDATORY PASSWORD SETUP MODAL --- */}
      {showPasswordSetup && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-blue-100 text-[#1B6FA5] rounded-full flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Your Vault</h2>
            <p className="text-sm text-slate-500 mb-6">
              Because you are logging in via an email invitation, you must set a permanent password to secure your account before proceeding.
            </p>
            
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  required 
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#21B0A6] outline-none" 
                  placeholder="Minimum 8 characters..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSavingPassword || newPassword.length < 8}
                className="w-full py-3 bg-[#21B0A6] hover:bg-[#1B6FA5] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Password & Enter'} 
                {!isSavingPassword && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

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