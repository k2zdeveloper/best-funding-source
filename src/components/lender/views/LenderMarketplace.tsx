import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, TrendingUp, Clock, ArrowRight, Loader2, AlertCircle, Building2, Lock, ShieldAlert, Globe, Briefcase, Bookmark, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; 

interface LoanPosting {
  id: string;
  facility_amount: number;
  funded_amount: number;
  yield_rate: number;
  term_length_months: number;
  business_description: string;
  status: string;
  profiles: { company_name: string } | null; 
}

export const LenderMarketplace: React.FC<{ userData: any; onOpenDeal: (deal: any) => void }> = ({ userData, onOpenDeal }) => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio' | 'watchlist'>('marketplace');

  // Core Data States
  const [deals, setDeals] = useState<LoanPosting[]>([]);
  const [portfolioDeals, setPortfolioDeals] = useState<any[]>([]);
  const [watchlistDeals, setWatchlistDeals] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const PAGE_SIZE = 10;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: '', minYield: '', maxTerm: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 1. DYNAMIC STATUS CHECK
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
        console.error("Live status check failed, falling back to session data:", err);
        setIsVerified(userData?.is_verified === true);
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchLiveStatus();
  }, [userData?.id]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.searchTerm), 500);
    return () => clearTimeout(handler);
  }, [filters.searchTerm]);

  // 2. FETCH MARKETPLACE DEALS
  const fetchDeals = useCallback(async (isLoadMore = false, currentPage = 0) => {
    if (!isVerified) return;

    if (!isLoadMore) setLoading(true);
    else setFetchingMore(true);
    setError(null);

    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('loan_postings')
        .select(`id, facility_amount, funded_amount, yield_rate, term_length_months, business_description, status, profiles(company_name)`)
        .in('status', ['active', 'fully_funded']) 
        .order('created_at', { ascending: false })
        .range(from, to);

      if (debouncedSearch) query = query.ilike('business_description', `%${debouncedSearch}%`);
      if (filters.minYield) query = query.gte('yield_rate', parseFloat(filters.minYield));
      if (filters.maxTerm) query = query.lte('term_length_months', parseInt(filters.maxTerm, 10));

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;

      const typedData = data as unknown as LoanPosting[];
      
      if (isLoadMore) setDeals(prev => [...prev, ...typedData]);
      else setDeals(typedData);

      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err: any) {
      setError("Failed to load marketplace deals. Please try again.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [debouncedSearch, filters.minYield, filters.maxTerm, isVerified]);

  // 3. FETCH PORTFOLIO & WATCHLIST
  const fetchPersonalTabs = useCallback(async () => {
    if (!isVerified || !userData?.id) return;
    
    try {
      // Fetch Portfolio
      const { data: commitments } = await supabase
        .from('loan_commitments')
        .select('amount, loan_postings(*, profiles(company_name))')
        .eq('lender_id', userData.id);

      if (commitments) {
        const processedPortfolio: any[] = [];
        commitments.forEach(c => {
          const amt = Number(c.amount);
          const posting = Array.isArray(c.loan_postings) ? c.loan_postings[0] : (c.loan_postings as any);
          if (posting && posting.id) {
            processedPortfolio.push({ ...posting, my_commitment: amt });
          }
        });
        setPortfolioDeals(processedPortfolio);
      }

      // Fetch Watchlist
      const { data: saved } = await supabase
        .from('saved_deals')
        .select('loan_postings(*, profiles(company_name))')
        .eq('lender_id', userData.id);

      if (saved) {
        const processedWatchlist = saved.map(s => {
          return Array.isArray(s.loan_postings) ? s.loan_postings[0] : (s.loan_postings as any);
        }).filter(d => d && d.id);
        setWatchlistDeals(processedWatchlist);
      }
    } catch (err) {
      console.error("Failed to load personal tabs", err);
    }
  }, [userData?.id, isVerified]);

  useEffect(() => {
    if (isVerified && !checkingStatus) {
      setPage(0); 
      fetchDeals(false, 0);
      fetchPersonalTabs();
    }
  }, [fetchDeals, fetchPersonalTabs, isVerified, checkingStatus]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(true, nextPage);
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  // --- LOADING STATE ---
  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Verifying access credentials...</p>
      </div>
    );
  }

  // --- RESTRICTED STATE UI ---
  if (!isVerified) {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1B6FA5] via-transparent to-transparent pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10">
            <Lock className="w-6 h-6 text-[#1B6FA5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Marketplace Locked</h2>
          <p className="text-sm text-slate-500 mb-8 relative z-10">
            For regulatory compliance, institutional deal flow and borrower identities are hidden until your KYC verification is approved by our compliance team.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg relative z-10">
            <ShieldAlert className="w-4 h-4" /> Verification Pending or Required
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD TABBED UI ---
  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Deal Explorer</h1>
          <p className="text-sm text-slate-500">Discover, track, and manage your institutional credit opportunities.</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-fit overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('marketplace')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'marketplace' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Globe className="w-4 h-4" /> Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Briefcase className="w-4 h-4" /> My Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('watchlist')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'watchlist' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Bookmark className="w-4 h-4" /> Watchlist
          </button>
        </div>
      </div>

      {/* --- TAB 1: MARKETPLACE --- */}
      {activeTab === 'marketplace' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex w-full mb-6 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search descriptions or entity names..." 
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#21B0A6] transition-all shadow-sm" 
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-[#1B6FA5] text-white border-[#1B6FA5]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Min Yield (%)</label>
                <input 
                  type="number" placeholder="e.g. 10" 
                  value={filters.minYield}
                  onChange={(e) => setFilters(prev => ({ ...prev, minYield: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21B0A6]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Max Term (Months)</label>
                <input 
                  type="number" placeholder="e.g. 24" 
                  value={filters.maxTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxTerm: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21B0A6]" 
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 rounded-xl text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="col-span-12 sm:col-span-5">Borrower & Setup</div>
              <div className="col-span-6 sm:col-span-2 hidden sm:block">Target Yield</div>
              <div className="col-span-6 sm:col-span-3">Facility Size</div>
              <div className="col-span-12 sm:col-span-2 text-right hidden sm:block">Action</div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">Securing deal flow...</p>
              </div>
            ) : deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No active deals found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or check back later for new institutional opportunities.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {deals.map((deal) => {
                  const fundingPercentage = deal.facility_amount > 0 ? (deal.funded_amount / deal.facility_amount) * 100 : 0;
                  
                  return (
                    <div 
                      key={deal.id} 
                      onClick={() => onOpenDeal(deal)}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <p className="font-bold text-slate-900 text-sm group-hover:text-[#1B6FA5] transition-colors truncate">
                          {deal.profiles?.company_name || 'Undisclosed Entity'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate pr-4">
                          {deal.business_description || 'Confidential deal in market.'}
                        </p>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-2 flex flex-col items-start">
                        <div className="flex items-center gap-1.5 text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 hidden sm:block" />
                          <span className="font-bold text-emerald-600 sm:text-slate-700">{deal.yield_rate}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1">
                          <Clock className="w-3 h-3 hidden sm:block" /> {deal.term_length_months} mo
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-3 mt-2 sm:mt-0">
                        <p className="font-bold text-slate-900 text-sm mb-1.5">{formatCurrency(deal.facility_amount)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-[#1B6FA5] h-1.5 rounded-full" style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">{Math.floor(fundingPercentage)}%</span>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-2 mt-3 sm:mt-0 flex items-center justify-end">
                        <button className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg group-hover:bg-[#1B6FA5] group-hover:text-white transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                          Review <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {deals.length > 0 && hasMore && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={fetchingMore}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {fetchingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {fetchingMore ? 'Loading more deals...' : 'Load More Opportunities'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: MY PORTFOLIO --- */}
      {activeTab === 'portfolio' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          {portfolioDeals.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-base font-bold text-slate-900">No Active Commitments</p>
              <p className="text-sm text-slate-500 mt-1">Deploy capital in the marketplace to build your portfolio.</p>
            </div>
          ) : (
            portfolioDeals.map((deal) => (
              <div key={deal.id} onClick={() => onOpenDeal(deal)} className="p-5 bg-white border border-[#1B6FA5]/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1B6FA5]"></div>
                <div className="flex gap-4 items-center mb-4 md:mb-0 ml-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#1B6FA5] transition-colors truncate">
                      {deal.profiles?.company_name || 'Undisclosed Entity'}
                    </h3>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-bold text-emerald-600"><TrendingUp className="w-3 h-3" /> {deal.yield_rate}% Target Yield</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.term_length_months} mo</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">My Commitment</p>
                    <p className="font-black text-blue-900 text-lg">{formatCurrency(deal.my_commitment)}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B6FA5] transition-colors hidden sm:block" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 3: WATCHLIST --- */}
      {activeTab === 'watchlist' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          {watchlistDeals.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-base font-bold text-slate-900">Your Watchlist is Empty</p>
              <p className="text-sm text-slate-500 mt-1">Save deals from the marketplace to track them here.</p>
            </div>
          ) : (
            watchlistDeals.map((deal) => (
              <div key={deal.id} onClick={() => onOpenDeal(deal)} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-slate-400 transition-colors cursor-pointer group shadow-sm">
                <div className="flex gap-4 items-center mb-4 md:mb-0">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#1B6FA5] transition-colors truncate">
                      {deal.profiles?.company_name || 'Undisclosed Entity'}
                    </h3>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> {deal.yield_rate}% Yield</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.term_length_months} mo</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Facility</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(deal.facility_amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};