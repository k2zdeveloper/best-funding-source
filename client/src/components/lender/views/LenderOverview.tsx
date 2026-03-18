import React, { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Clock, Briefcase, Star, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const LenderOverview: React.FC<{ 
  userData: any; 
  onOpenDeal: (deal: any) => void; 
}> = ({ userData, onOpenDeal }) => {
  
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // DYNAMIC STATUS CHECK
  useEffect(() => {
    const fetchLiveStatus = async () => {
      if (!userData?.id) {
        setCheckingStatus(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', userData.id)
          .single();
          
        if (error) throw error;
        setIsVerified(data?.is_verified || false);
      } catch (err) {
        setIsVerified(userData?.is_verified === true);
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchLiveStatus();
  }, [userData?.id]);

  const activeDeals = [
    { id: '1', name: 'Project Alpha', sector: 'Manufacturing', target: '$2,500,000', yield: '11.5%', term: '24 mo', funded: 60 },
    { id: '2', name: 'Project Horizon', sector: 'Logistics', target: '$750,000', yield: '9.0%', term: '12 mo', funded: 85 },
  ];

  const recommendedDeals = [
    { id: '3', name: 'Project Titan', sector: 'Commercial RE', target: '$5,000,000', yield: '8.5%', term: '48 mo', funded: 95 },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Portfolio Overview</h1>
        <p className="text-sm text-slate-500">Institutional capital deployment and active requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Capital</p>
          <h2 className="text-3xl font-light text-slate-900">$0.00</h2>
        </div>
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Deployments</p>
          <h2 className="text-3xl font-light text-slate-900">$0.00</h2>
        </div>
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Declared AUM</p>
          <h2 className="text-3xl font-light text-slate-900">{userData?.aum || 'Pending'}</h2>
        </div>
      </div>

      {/* Show skeleton loader while verifying database status */}
      {checkingStatus ? (
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
          <div className="h-24 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : !isVerified ? (
        /* --- RESTRICTED STATE INTERCEPT --- */
        <div className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center overflow-hidden mb-10">
          <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
              <Lock className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Deal Flow Locked</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Complete institutional verification to unlock active loan requests and live deployments.
            </p>
          </div>
          
          <div className="opacity-40 blur-[4px] pointer-events-none select-none flex flex-col gap-4">
            <div className="h-32 w-full bg-slate-100 rounded-xl border border-slate-200"></div>
            <div className="h-32 w-full bg-slate-100 rounded-xl border border-slate-200 hidden sm:block"></div>
          </div>
        </div>
      ) : (
        /* --- SECURE DATA VIEW (Only renders if verified) --- */
        <>
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" /> Recommended For You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedDeals.map(deal => (
                <div 
                  key={deal.id} 
                  onClick={() => onOpenDeal(deal)} 
                  className="p-5 bg-white border border-blue-100 hover:border-blue-300 rounded-xl cursor-pointer transition-colors group relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase px-2 py-1 rounded-bl-lg">High Match</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">{deal.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{deal.sector} • {deal.target}</p>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-sm font-bold text-emerald-600">{deal.yield} Target</span>
                    <span className="text-xs text-slate-400 font-medium group-hover:text-blue-600 transition-colors">Review Deal &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Live Deal Flow</h2>
          </div>

          <div className="space-y-3">
            {activeDeals.map((deal) => (
              <div 
                key={deal.id} 
                onClick={() => onOpenDeal(deal)}
                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-slate-400 transition-colors cursor-pointer group shadow-sm"
              >
                <div className="flex gap-4 items-center mb-4 md:mb-0">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{deal.name}</h3>
                      <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{deal.sector}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> {deal.yield} Yield</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.term}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="flex-1 md:w-32">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Funded</span>
                      <span className="text-slate-900">{deal.funded}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${deal.funded}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Facility</p>
                    <p className="font-semibold text-slate-900">{deal.target}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};