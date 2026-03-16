import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, LogOut, Briefcase, TrendingUp, Search, ChevronRight } from 'lucide-react';

export const LenderDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/login';
        return;
      }
      setUserData(user.user_metadata);
      setLoading(false);
    };
    fetchSession();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Securing environment...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-blue-950 border-b border-blue-900 px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner"><ShieldCheck className="h-5 w-5 text-white" /></div>
          <span className="font-bold text-xl tracking-tight">Partner<span className="text-blue-400">Capital</span></span>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Institution Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">{userData?.company_name || 'Investor Portal'}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium ${userData?.is_accredited ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              <ShieldCheck className="h-4 w-4" />
              {userData?.is_accredited ? 'Verified Accredited' : 'Pending Verification'}
            </div>
            <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full font-bold text-slate-700">
              AUM: <span className="text-blue-600">{userData?.aum || 'N/A'}</span>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Active Deal Flow
            </h2>
            <button className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {/* Example Deal Row */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-4 mb-4 md:mb-0">
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <Briefcase className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">Project Alpha</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manufacturing</span>
                  </div>
                  <p className="text-sm text-slate-500">Seeking mezzanine debt for equipment expansion.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:w-1/3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                  <p className="font-semibold text-slate-900">$2,500,000</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};