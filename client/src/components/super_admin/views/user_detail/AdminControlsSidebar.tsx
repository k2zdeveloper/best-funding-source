// src/components/super_admin/views/user_detail/AdminControlsSidebar.tsx
import React from 'react';
import { Ban, UserX, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { type FullUserProfile } from '../../hooks/useAdminDirectory';

interface AdminControlsSidebarProps {
  user: FullUserProfile;
  updating: boolean;
  updateFlags: (updates: Partial<FullUserProfile>) => Promise<{ success: boolean; error?: string }>;
}

export const AdminControlsSidebar: React.FC<AdminControlsSidebarProps> = ({ user, updating, updateFlags }) => {
  const handleToggleBlock = async () => {
    const confirmMsg = user.is_blocked ? "Restore this user's access?" : "Suspend this user's access?";
    if (window.confirm(confirmMsg)) {
      const res = await updateFlags({ is_blocked: !user.is_blocked });
      if (!res.success) alert(`Action failed: ${res.error}`);
    }
  };

  const handleToggleDeletion = async () => {
    const res = await updateFlags({ prevent_deletion: !user.prevent_deletion });
    if (!res.success) alert(`Action failed: ${res.error}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
        {updating && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}
        
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" /> Security & Access
        </h3>
        
        <div className="space-y-3">
          <button onClick={handleToggleBlock} disabled={updating} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.is_blocked ? 'bg-red-500/10 border-red-500/50 text-red-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
            <div className="text-left">
              <p className="text-xs font-bold mb-0.5">{user.is_blocked ? 'Restore Access' : 'Suspend Account'}</p>
              <p className="text-[10px] opacity-60 font-mono">{user.is_blocked ? 'Status: Revoked' : 'Status: Active'}</p>
            </div>
            <Ban className={`w-5 h-5 ${user.is_blocked ? 'text-red-400' : 'text-slate-500'}`} />
          </button>

          <button onClick={handleToggleDeletion} disabled={updating} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.prevent_deletion ? 'bg-amber-500/10 border-amber-500/50 text-amber-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
            <div className="text-left">
              <p className="text-xs font-bold mb-0.5">{user.prevent_deletion ? 'Remove Legal Hold' : 'Enforce Legal Hold'}</p>
              <p className="text-[10px] opacity-60 font-mono">{user.prevent_deletion ? 'Deletion Locked' : 'Can Delete Account'}</p>
            </div>
            <UserX className={`w-5 h-5 ${user.prevent_deletion ? 'text-amber-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>
      
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
         <div className="flex gap-3 text-slate-600">
           <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
           <p className="text-[10px] leading-relaxed font-medium">All administrative actions taken on this screen are permanently recorded in the <strong>public.audit_logs</strong> table tied to your Administrator ID.</p>
         </div>
      </div>
    </div>
  );
};