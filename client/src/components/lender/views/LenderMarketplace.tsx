import React from 'react';
import { Search, Filter, TrendingUp, Clock, ArrowRight } from 'lucide-react';

export const LenderMarketplace: React.FC<{ onOpenDeal: (deal: any) => void }> = ({ onOpenDeal }) => {
  const allDeals = [
    { id: '1', name: 'Project Alpha', sector: 'Manufacturing', target: '$2,500,000', yield: '11.5%', term: '24 mo', funded: 60 },
    { id: '2', name: 'Project Horizon', sector: 'Logistics', target: '$750,000', yield: '9.0%', term: '12 mo', funded: 85 },
    { id: '3', name: 'Project Nexus', sector: 'SaaS / Tech', target: '$1,200,000', yield: '14.0%', term: '36 mo', funded: 20 },
    { id: '4', name: 'Project Titan', sector: 'Commercial RE', target: '$5,000,000', yield: '8.5%', term: '48 mo', funded: 95 },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Deal Marketplace</h1>
          <p className="text-sm text-slate-500">Explore and fund fully-vetted institutional credit opportunities.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search deals..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* The Marketplace List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="col-span-5 sm:col-span-4">Entity & Sector</div>
          <div className="col-span-3 sm:col-span-2 hidden sm:block">Target Yield</div>
          <div className="col-span-4 sm:col-span-3">Facility Size</div>
          <div className="col-span-3 text-right hidden sm:block">Status</div>
        </div>

        <div className="divide-y divide-slate-100">
          {allDeals.map((deal) => (
            <div 
              key={deal.id} 
              onClick={() => onOpenDeal(deal)}
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50/30 transition-colors cursor-pointer group"
            >
              {/* Name & Sector */}
              <div className="col-span-7 sm:col-span-4">
                <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{deal.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{deal.sector}</p>
              </div>
              
              {/* Yield & Term */}
              <div className="col-span-3 sm:col-span-2 hidden sm:block">
                <div className="flex items-center gap-1.5 text-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium text-slate-700">{deal.yield}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" /> {deal.term}
                </div>
              </div>

              {/* Amount */}
              <div className="col-span-5 sm:col-span-3">
                <p className="font-semibold text-slate-900">{deal.target}</p>
              </div>

              {/* Status / Action */}
              <div className="col-span-12 sm:col-span-3 mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-4">
                <div className="flex-1 sm:w-24">
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${deal.funded}%` }}></div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};