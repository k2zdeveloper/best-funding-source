import React, { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Clock, Briefcase, Star, Lock, PieChart, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const LenderOverview: React.FC<{ 
  userData: any; 
  onOpenDeal: (deal: any) => void; 
}> = ({ userData, onOpenDeal }) => {
  
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  
  const [recommendedDeals, setRecommendedDeals] = useState<any[]>([]);
  const [activeDeals, setActiveDeals] = useState<any[]>([]);

  // --- NEW: Dynamic Portfolio Metrics ---
  const [portfolioStats, setPortfolioStats] = useState({
    totalDeployed: 0,
    activeDealCount: 0,
    avgYield: 0,
    allocations: [] as { industry: string, percentage: number, color: string }[]
  });

  useEffect(() => {
    const fetchLiveStatusAndDeals = async () => {
      if (!userData?.id) {
        setCheckingStatus(false);
        return;
      }
      try {
        // 1. Check Verification
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', userData.id)
          .single();
          
        if (profileError) throw profileError;
        
        const verified = profile?.is_verified || false;
        setIsVerified(verified);

        if (verified) {
          // 2. Fetch Active Marketplace Deals
          const { data: deals, error: dealsError } = await supabase
            .from('loan_postings')
            .select('*, profiles(company_name)')
            .in('status', ['active', 'fully_funded'])
            .order('created_at', { ascending: false })
            .limit(10);

          if (dealsError) throw dealsError;
          
          const allDeals = deals || [];
          const sortedByYield = [...allDeals].sort((a, b) => b.yield_rate - a.yield_rate);
          const topRecommendations = sortedByYield.slice(0, 2);
          setRecommendedDeals(topRecommendations);

          const recommendedIds = topRecommendations.map(d => d.id);
          const remainingDeals = allDeals.filter(d => !recommendedIds.includes(d.id));
          setActiveDeals(remainingDeals);

          // 3. NEW: Fetch this Lender's ACTUAL Commitments for the Charts
          const { data: commitments } = await supabase
            .from('loan_commitments')
            .select('amount, loan_postings(yield_rate, industry)')
            .eq('lender_id', userData.id);

          if (commitments && commitments.length > 0) {
            let totalMoney = 0;
            let yieldWeight = 0;
            const industryTally: Record<string, number> = {};

          commitments.forEach(c => {
              const amt = Number(c.amount);
              
              // THE FIX: Safely handle the Supabase join type
              const posting = Array.isArray(c.loan_postings) 
                ? c.loan_postings[0] 
                : (c.loan_postings as any);
              
              const yld = Number(posting?.yield_rate || 0);
              const ind = posting?.industry || 'Other';
              
              totalMoney += amt;
              yieldWeight += (amt * yld);
              industryTally[ind] = (industryTally[ind] || 0) + amt;
            });
            // Build Allocation Chart Data
            const colors = ['bg-[#1B6FA5]', 'bg-[#21B0A6]', 'bg-blue-300', 'bg-slate-300'];
            const allocations = Object.keys(industryTally).map((ind, idx) => ({
              industry: ind,
              percentage: (industryTally[ind] / totalMoney) * 100,
              color: colors[idx % colors.length]
            })).sort((a, b) => b.percentage - a.percentage);

            setPortfolioStats({
              totalDeployed: totalMoney,
              activeDealCount: commitments.length,
              avgYield: totalMoney > 0 ? (yieldWeight / totalMoney) : 0,
              allocations
            });
          }
        }
      } catch (err) {
        console.error("Error fetching overview data:", err);
        setIsVerified(userData?.is_verified === true);
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchLiveStatusAndDeals();
  }, [userData?.id]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Portfolio Overview</h1>
        <p className="text-sm text-slate-500">Institutional capital deployment and active requests.</p>
      </div>

      {checkingStatus ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
          <div className="h-64 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : !isVerified ? (
        /* --- RESTRICTED STATE --- */
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
        /* --- SECURE DATA VIEW --- */
        <>
          {/* DYNAMIC TOP METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Capital Deployed</p>
              <h2 className="text-3xl font-light text-slate-900">{formatCurrency(portfolioStats.totalDeployed)}</h2>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Active Deals</p>
              <h2 className="text-3xl font-light text-slate-900">{portfolioStats.activeDealCount}</h2>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5"><TrendingUp className="w-24 h-24" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Weighted Avg Yield</p>
              <h2 className="text-3xl font-light text-emerald-600">{portfolioStats.avgYield.toFixed(1)}%</h2>
            </div>
          </div>

          {/* NEW: CSS PORTFOLIO ALLOCATION CHART */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#1B6FA5]" /> Sector Allocation
            </h2>
            
            {portfolioStats.totalDeployed === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 italic">No capital deployed yet. Fund a deal to see your portfolio breakdown.</div>
            ) : (
              <div>
                {/* The Stacked Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex mb-4">
                  {portfolioStats.allocations.map((alloc, idx) => (
                    <div key={idx} className={`h-full ${alloc.color} transition-all duration-1000`} style={{ width: `${alloc.percentage}%` }}></div>
                  ))}
                </div>
                {/* The Legend */}
                <div className="flex flex-wrap gap-4">
                  {portfolioStats.allocations.map((alloc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${alloc.color}`}></div>
                      <span className="text-xs font-bold text-slate-700">{alloc.industry} <span className="text-slate-400 font-medium">({alloc.percentage.toFixed(0)}%)</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RECOMMENDED DEALS GRID */}
          {recommendedDeals.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#1B6FA5]" /> Top Yield Opportunities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    onClick={() => onOpenDeal(deal)} 
                    className="p-5 bg-white border border-slate-200 hover:border-[#21B0A6]/50 rounded-2xl cursor-pointer transition-colors group relative overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 bg-[#21B0A6]/10 text-[#21B0A6] text-[9px] font-bold uppercase px-2 py-1 rounded-bl-lg">High Yield</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-[#1B6FA5] transition-colors truncate pr-16">
                      {deal.profiles?.company_name || 'Undisclosed Entity'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{deal.business_description}</p>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                      <span className="text-sm font-bold text-emerald-600">{deal.yield_rate}% Target</span>
                      <span className="text-xs text-slate-400 font-medium group-hover:text-[#21B0A6] transition-colors">Review Deal &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE DEAL FLOW LIST */}
          <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Live Deal Flow</h2>
          </div>

          <div className="space-y-3">
            {activeDeals.length === 0 && recommendedDeals.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
                No active deals on the platform right now.
              </div>
            ) : activeDeals.length === 0 ? (
              <div className="text-center py-6 bg-transparent text-sm text-slate-500">
                You've viewed all current deals.
              </div>
            ) : (
              activeDeals.map((deal) => {
                const fundingPercentage = deal.facility_amount > 0 
                  ? Math.min((deal.funded_amount / deal.facility_amount) * 100, 100) 
                  : 0;

                return (
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
                          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#1B6FA5] transition-colors truncate max-w-[200px] sm:max-w-xs">
                            {deal.profiles?.company_name || 'Undisclosed Entity'}
                          </h3>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> {deal.yield_rate}% Yield</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.term_length_months} mo</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="flex-1 md:w-32">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Funded</span>
                          <span className="text-slate-900">{Math.floor(fundingPercentage)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-[#1B6FA5] h-1.5 rounded-full" style={{ width: `${fundingPercentage}%` }}></div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 min-w-[80px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Facility</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(deal.facility_amount)}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#21B0A6] transition-colors hidden sm:block" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};