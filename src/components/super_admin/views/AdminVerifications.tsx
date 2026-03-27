import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Building2, User, ShieldAlert, BarChart3, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { type KYCItem, type BorrowerKYC, type LenderKYC, type VerificationStatus, isBorrowerKYC } from '../../../types/kyc';
import { StatusBadge } from '../../ui/StatusBadge';
import { Tooltip } from '../../ui/Tooltip';

// --- UI COMPONENT: STATS CARD ---
const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

export const AdminVerifications: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'borrowers' | 'lenders'>('borrowers');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [borrowers, setBorrowers] = useState<BorrowerKYC[]>([]);
  const [lenders, setLenders] = useState<LenderKYC[]>([]);

  // --- SECURE DATA FETCHING ---
  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      // Parallelize queries to cut loading time in half
      const [borrowerRes, lenderRes] = await Promise.all([
        supabase.from('borrower_verifications').select('*').order('created_at', { ascending: false }),
        supabase.from('lender_verifications').select('*').order('created_at', { ascending: false })
      ]);
      
      if (borrowerRes.error) throw borrowerRes.error;
      if (lenderRes.error) throw lenderRes.error;

      setBorrowers(borrowerRes.data || []);
      setLenders(lenderRes.data || []);
    } catch (err) {
      console.error("Error fetching verifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ensure data refreshes when component mounts (e.g., when returning from User Detail page)
  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const activeData = activeTab === 'borrowers' ? borrowers : lenders;

  const filteredData = useMemo(() => {
    if (!searchTerm) return activeData;
    const lowerQuery = searchTerm.toLowerCase();
    return activeData.filter((item) => {
      const name = isBorrowerKYC(item) ? item.company_name : item.legal_name;
      const id = isBorrowerKYC(item) ? item.ein : item.tax_id;
      return name.toLowerCase().includes(lowerQuery) || id.toLowerCase().includes(lowerQuery);
    });
  }, [activeData, searchTerm]);

  // --- DYNAMIC STATISTICS ---
  const stats = useMemo(() => {
    const total = activeData.length;
    const approved = activeData.filter(d => d.status === 'approved').length;
    const rejected = activeData.filter(d => d.status === 'rejected').length;
    const pending = activeData.filter(d => d.status === 'pending').length;
    
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    return { total, pending, approvalRate, rejected };
  }, [activeData]);

  // --- ROUTING ENGINE ---
  const handleAuditClick = (userId: string) => {
    // Navigate directly to the 360 User Detail page and pass a state parameter 
    // telling the page to automatically open the "compliance" tab.
    navigate(`/admin-dashboard/users/${userId}`, { state: { activeTab: 'compliance' } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Compliance & KYC</h2>
          <p className="text-sm text-slate-500 mt-1">Audit entity documentation and manage platform access.</p>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('borrowers')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'borrowers' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Building2 className="w-4 h-4" /> Borrowers
          </button>
          <button
            onClick={() => setActiveTab('lenders')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'lenders' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <User className="w-4 h-4" /> Lenders
          </button>
        </div>
      </div>

      {/* --- STATISTICS ROW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={stats.total} subtext={`All time ${activeTab}`} icon={BarChart3} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Pending Review" value={stats.pending} subtext="Requires immediate action" icon={Clock} colorClass="bg-amber-100 text-amber-600" />
        <StatCard title="Approval Rate" value={`${stats.approvalRate}%`} subtext="System average" icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" />
        <StatCard title="Rejected Entities" value={stats.rejected} subtext="Failed compliance" icon={XCircle} colorClass="bg-red-100 text-red-600" />
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab} by name or ID...`} 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Entity Identity</th>
                <th className="px-6 py-4">Registration ID</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ShieldAlert className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-sm font-medium text-slate-600">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{isBorrowerKYC(item) ? item.company_name : item.legal_name}</p>
                      {!isBorrowerKYC(item) && <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{item.lender_type} LENDER</p>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{isBorrowerKYC(item) ? item.ein : item.tax_id}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Tooltip text="Review & Manage in 360° Profile">
                        <button 
                          onClick={() => handleAuditClick(item.user_id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Audit Profile
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};