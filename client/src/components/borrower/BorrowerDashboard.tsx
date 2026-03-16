import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, LogOut, Clock, FileText, ChevronRight, AlertCircle } from 'lucide-react';

export const BorrowerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/login';
        return;
      }
      // Read directly from metadata for instant load after signup
      setUserData(user.user_metadata);
      setLoading(false);
    };
    fetchSession();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Securing portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Building2 className="h-5 w-5 text-white" /></div>
          <span className="font-bold text-xl tracking-tight">Enterprise<span className="text-blue-600">Funding</span></span>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
          <LogOut className="h-4 w-4" /> Secure Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-slate-900">Borrower Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {userData?.company_name || 'Partner'}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Entity Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Company Name</p>
                <p className="font-semibold text-lg">{userData?.company_name || 'Pending'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Target Loan Amount</p>
                <p className="font-semibold text-lg text-blue-600">{userData?.loan_amount || 'Pending'}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-950 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Application Status</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-500/20 p-2 rounded-full border border-yellow-500/50">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-bold text-lg">Under Review</p>
                <p className="text-xs text-blue-200">Pending initial due diligence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Action Required
          </h2>
          <div className="border border-slate-100 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-700">Complete Pre-Qualification Form</p>
                <p className="text-xs text-slate-500">Provide deeper metrics for underwriters.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </main>
    </div>
  );
};