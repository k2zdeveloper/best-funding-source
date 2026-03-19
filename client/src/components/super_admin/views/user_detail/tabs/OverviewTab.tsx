// src/components/super_admin/views/user_detail/tabs/OverviewTab.tsx
import React from 'react';
import { Building2, FileText, Landmark, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { type FullUserProfile } from '../../../hooks/useAdminDirectory';

interface OverviewTabProps {
  user: FullUserProfile;
  preQuals: any[];
  loans: any[];
  verification: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ user, preQuals, loans, verification }) => {
  const renderStatusBadge = () => {
    if (!verification) return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">NOT SUBMITTED</span>;
    if (verification.status === 'approved') return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> APPROVED</span>;
    if (verification.status === 'rejected') return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> REJECTED</span>;
    return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> PENDING REVIEW</span>;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      
      {/* NEW FEATURE: Historical Journey Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Historical Pre-Quals</p>
            <p className="text-2xl font-black text-blue-950">{preQuals.length} <span className="text-sm font-medium text-blue-700">submitted</span></p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-600 text-white p-3 rounded-xl"><Landmark className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Historical Loan Apps</p>
            <p className="text-2xl font-black text-emerald-950">{loans.length} <span className="text-sm font-medium text-emerald-700">submitted</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
          <Building2 className="w-4 h-4 text-blue-600" /> Corporate Profile
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Industry</p><p className="text-sm font-semibold">{user.industry || 'N/A'}</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p><p className="text-sm font-semibold">{new Date(user.created_at || '').toLocaleDateString()}</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Revenue (Reported)</p><p className="text-sm font-bold text-emerald-600">${user.revenue || '0'}</p></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current KYC Status</p>
            {renderStatusBadge()}
          </div>
        </div>
      </div>

      {preQuals.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">Detailed Pre-Qualification History</h3>
          <div className="space-y-3">
            {preQuals.map(pq => (
              <div key={pq.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">${Number(pq.requested_amount).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{pq.industry} • {new Date(pq.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">{pq.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};