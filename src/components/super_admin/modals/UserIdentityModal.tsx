import React, { useState } from 'react';
import { ShieldAlert, XCircle, Lock, Ban, UserX, CheckCircle2, Loader2, Save } from 'lucide-react';
import { type UserProfile } from '../hooks/useAdminUsers';

interface UserIdentityModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateFlags: (id: string, flags: Partial<UserProfile>) => Promise<{success: boolean, error?: string}>;
  onOverrideAuth: (id: string, email?: string, pass?: string) => Promise<{success: boolean, error?: string}>;
}

export const UserIdentityModal: React.FC<UserIdentityModalProps> = ({ user, onClose, onUpdateFlags, onOverrideAuth }) => {
  const [newPassword, setNewPassword] = useState('');
  const [isBlocked, setIsBlocked] = useState(user.is_blocked || false);
  const [preventDeletion, setPreventDeletion] = useState(user.prevent_deletion || false);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSave = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });

    // 1. Update Profile Flags
    if (isBlocked !== user.is_blocked || preventDeletion !== user.prevent_deletion) {
      const res = await onUpdateFlags(user.id, { is_blocked: isBlocked, prevent_deletion: preventDeletion });
      if (!res.success) {
        setMsg({ text: res.error || 'Failed to update flags', type: 'error' });
        setLoading(false);
        return;
      }
    }

    // 2. Override Auth Credentials (if password provided)
    if (newPassword) {
      const res = await onOverrideAuth(user.id, undefined, newPassword);
      if (!res.success) {
        setMsg({ text: res.error || 'Failed to override credentials', type: 'error' });
        setLoading(false);
        return;
      }
    }

    setMsg({ text: 'Identity configuration updated successfully.', type: 'success' });
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Identity & Access Control</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">{user.email}</p>
            </div>
          </div>
          <button onClick={() => !loading && onClose()} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {msg.text && (
            <div className={`p-3 text-xs font-bold rounded-lg flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />} {msg.text}
            </div>
          )}

          {/* Access Toggles */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Ban className="w-4 h-4 text-red-500" /> Suspend Account</p>
                <p className="text-xs text-slate-500 mt-0.5">Immediately revokes all login access.</p>
              </div>
              <button onClick={() => setIsBlocked(!isBlocked)} className={`w-11 h-6 rounded-full relative transition-colors ${isBlocked ? 'bg-red-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBlocked ? 'left-6' : 'left-1'}`}></span>
              </button>
            </div>
            
            <div className="w-full border-t border-slate-200"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><UserX className="w-4 h-4 text-orange-500" /> Restrict Deletion</p>
                <p className="text-xs text-slate-500 mt-0.5">Prevents user from deleting account (Legal Hold).</p>
              </div>
              <button onClick={() => setPreventDeletion(!preventDeletion)} className={`w-11 h-6 rounded-full relative transition-colors ${preventDeletion ? 'bg-orange-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preventDeletion ? 'left-6' : 'left-1'}`}></span>
              </button>
            </div>
          </div>

          {/* Credential Override */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Force Password Reset
            </label>
            <input 
              type="text" 
              placeholder="Enter new password to override..." 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 px-4 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-2">Leave blank to keep existing password. Action is logged.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};