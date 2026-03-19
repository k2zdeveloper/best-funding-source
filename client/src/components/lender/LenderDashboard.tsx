import React, { useState, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VerificationBanner } from '../dashboard/VerificationBanner';
import { LenderTopNav } from './layout/LenderTopNav';
import { LenderBottomNav } from './layout/LenderBottomNav';

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
  // Use our robust, enterprise-grade global state instead of local fetching!
  const { user, isVerified, loading: authLoading } = useAuth(); 
  
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  const handleOpenDeal = (deal: any) => {
    setSelectedDeal(deal);
    setCurrentView('deal-detail');
    window.scrollTo(0, 0); 
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Securing environment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 md:pb-0">
      
      {/* Abstracted Header */}
      <LenderTopNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Verification Logic */}
        {!isVerified && !['deal-detail', 'verification'].includes(currentView) && (
          <VerificationBanner onVerifyClick={() => setCurrentView('verification')} />
        )}
        
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        }>
          {currentView === 'overview' && <LenderOverview userData={user} onOpenDeal={handleOpenDeal} />}
          {currentView === 'marketplace' && <LenderMarketplace userData={user} onOpenDeal={handleOpenDeal} />}
          {currentView === 'messages' && <LenderMessages userData={user} />}
          {currentView === 'settings' && <LenderSettings userData={user} />}
          {currentView === 'help' && <LenderHelp />}
          {currentView === 'legal' && <LenderLegal />}
          
          {currentView === 'deal-detail' && selectedDeal && (
            <LenderDealDetail deal={selectedDeal} userData={user} onBack={() => setCurrentView('marketplace')} />
          )}

          {currentView === 'verification' && (
            <LenderVerification user={user} onComplete={() => setCurrentView('overview')} />
          )}
        </Suspense>

      </main>

      {/* Abstracted Mobile Nav */}
      <LenderBottomNav currentView={currentView} setCurrentView={setCurrentView} />

    </div>
  );
};