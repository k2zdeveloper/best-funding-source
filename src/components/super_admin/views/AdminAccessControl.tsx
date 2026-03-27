import React, { useState } from 'react';
import { 
  ShieldCheck, UserPlus, ShieldAlert, Key, 
  Loader2, Ban, Mail, AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import { useAdminAccessControl } from '../hooks/useAdminAccessControl';

export const AdminAccessControl: React.FC = () => {
  const { staff, loading, error, processingId, updateStaffRole, revokeAccess, inviteAdmin } = useAdminAccessControl();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'admin' as 'admin' | 'super_admin', password: '' });
  const [inviting, setInviting] = useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteData.password.length < 12) return alert("Enterprise passwords must be at least 12 characters.");
    
    setInviting(true);
    const res = await inviteAdmin(inviteData.email, inviteData.role, inviteData.password);
    setInviting(false);
    
    if (res.success) {
      setIsModalOpen(false);
      setInviteData({ email: '', role: 'admin', password: '' });
    } else {
      alert(`Provisioning Failed: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- PROVISION ADMIN MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> Provision Administrator
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input required type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin@yourplatform.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Access Level (Role)</label>
                <select value={inviteData.role} onChange={e => setInviteData({...inviteData, role: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                  <option value="admin">Standard Admin (Support & Audits)</option>
                  <option value="super_admin">Super Admin (Full System Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Temporary Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input required minLength={12} type="text" value={inviteData.password} onChange={e => setInviteData({...inviteData, password: e.target.value})} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Minimum 12 characters..." />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">The user will be required to change this upon first login.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={inviting} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 flex justify-center items-center gap-2 shadow-sm disabled:opacity-50">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Access Control</h2>
          <p className="text-sm text-slate-500 mt-1">Manage internal team roles, privileges, and system access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Provision Admin
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col justify-center items-center z-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Team Member</th>
                <th className="px-6 py-4">Access Level (RBAC)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Provisioned On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {staff.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No active team members found.</p>
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className={`hover:bg-slate-50/80 transition-colors ${member.is_blocked ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{member.company_name || 'Staff Member'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{member.email}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <select 
                        disabled={member.is_blocked || processingId === member.id}
                        value={member.role}
                        onChange={(e) => updateStaffRole(member.id, e.target.value as 'admin' | 'super_admin')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors
                          ${member.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' : 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500'}
                          ${member.is_blocked ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      {member.is_blocked ? (
                        <span className="flex items-center gap-1 w-fit px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded border border-red-200"><Ban className="w-3 h-3"/> Revoked</span>
                      ) : (
                        <span className="flex items-center gap-1 w-fit px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Active</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => revokeAccess(member.id)}
                        disabled={member.is_blocked || processingId === member.id}
                        className="px-3 py-1.5 text-xs font-bold bg-white text-red-600 border border-slate-200 rounded-lg hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 transition-colors shadow-sm"
                      >
                        {processingId === member.id ? 'Processing...' : 'Revoke Access'}
                      </button>
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