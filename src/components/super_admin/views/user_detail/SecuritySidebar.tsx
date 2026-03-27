import React, { useState } from 'react';
import { Ban, UserX, Lock } from 'lucide-react';
import { type FullUserProfile } from '../../hooks/useAdminDirectory';

interface SecuritySidebarProps {
  user: FullUserProfile;
  updating: boolean;
  updateFlags: (updates: Partial<any>) => Promise<any>;
  forcePasswordReset: (password: string) => Promise<any>;
}

export const SecuritySidebar: React.FC<SecuritySidebarProps> = ({ user, updating, updateFlags, forcePasswordReset }) => {
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 8) return;
    await forcePasswordReset(newPassword);
    setNewPassword('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
      {updating && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />}
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5" /> Security & Access
      </h3>
      
      <div className="space-y-3">
        <button onClick={() => updateFlags({ is_blocked: !user.is_blocked })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.is_blocked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
          <div className="text-left">
            <p className="text-xs font-bold mb-0.5">{user.is_blocked ? 'Restore Access' : 'Suspend Account'}</p>
            <p className={`text-[10px] font-mono ${user.is_blocked ? 'text-red-500' : 'text-slate-400'}`}>{user.is_blocked ? 'Status: Revoked' : 'Status: Active'}</p>
          </div>
          <Ban className={`w-5 h-5 ${user.is_blocked ? 'text-red-500' : 'text-slate-400'}`} />
        </button>

        <button onClick={() => updateFlags({ prevent_deletion: !user.prevent_deletion })} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.prevent_deletion ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
          <div className="text-left">
            <p className="text-xs font-bold mb-0.5">{user.prevent_deletion ? 'Remove Legal Hold' : 'Enforce Legal Hold'}</p>
            <p className={`text-[10px] font-mono ${user.prevent_deletion ? 'text-amber-600' : 'text-slate-400'}`}>{user.prevent_deletion ? 'Deletion Locked' : 'Can Delete Account'}</p>
          </div>
          <UserX className={`w-5 h-5 ${user.prevent_deletion ? 'text-amber-500' : 'text-slate-400'}`} />
        </button>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Lock className="w-3 h-3"/> Force Password Reset</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="New password..." 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handlePasswordReset} 
              disabled={!newPassword || newPassword.length < 8} 
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};