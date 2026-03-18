import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, TrendingUp, Clock, ArrowRight, Loader2, AlertCircle, Building2, Lock, ShieldAlert } from 'lucide-react';
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
  const [deals, setDeals] = useState<LoanPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- ENTERPRISE FIX: Live Database Status State ---
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

  // 2. CORE FETCH FUNCTION (Only runs if verified)
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
        .select(`id, facility_amount, funded_amount, yield_rate, term_length_months, business_description, status, profiles!inner(company_name)`)
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

  useEffect(() => {
    if (isVerified && !checkingStatus) {
      setPage(0); 
      fetchDeals(false, 0);
    }
  }, [fetchDeals, isVerified, checkingStatus]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(true, nextPage);
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  // --- LOADING STATE ---
  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Verifying access credentials...</p>
      </div>
    );
  }

  // --- RESTRICTED STATE UI ---
  if (!isVerified) {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10">
            <Lock className="w-6 h-6 text-slate-700" />
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

  // --- STANDARD MARKETPLACE UI ---
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Deal Marketplace</h1>
          <p className="text-sm text-slate-500">Explore and fund fully-vetted institutional credit opportunities.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search descriptions..." 
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" 
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Min Yield (%)</label>
            <input 
              type="number" placeholder="e.g. 10" 
              value={filters.minYield}
              onChange={(e) => setFilters(prev => ({ ...prev, minYield: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Max Term (Months)</label>
            <input 
              type="number" placeholder="e.g. 24" 
              value={filters.maxTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, maxTerm: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
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
              const fundingPercentage = (deal.funded_amount / deal.facility_amount) * 100;
              
              return (
                <div 
                  key={deal.id} 
                  onClick={() => onOpenDeal(deal)}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="col-span-8 sm:col-span-5">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors truncate">
                      {deal.profiles?.company_name || 'Undisclosed Entity'}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate pr-4">
                      {deal.business_description}
                    </p>
                  </div>
                  
                  <div className="col-span-4 sm:col-span-2 flex flex-col items-end sm:items-start">
                    <div className="flex items-center gap-1.5 text-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500 hidden sm:block" />
                      <span className="font-bold text-emerald-600 sm:text-slate-700">{deal.yield_rate}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1">
                      <Clock className="w-3 h-3 hidden sm:block" /> {deal.term_length_months} mo
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-3 mt-2 sm:mt-0">
                    <p className="font-bold text-slate-900 text-sm mb-1.5">{formatCurrency(deal.facility_amount)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{Math.floor(fundingPercentage)}%</span>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-2 mt-3 sm:mt-0 flex items-center justify-end">
                    <button className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
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
  );
};