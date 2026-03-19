import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Save, XCircle } from 'lucide-react';
import type { Role } from '../../../context/AuthContext';

export interface UserProfileStub {
  id: string;
  email: string | null;
  role: Role;
}

interface EditRoleModalProps {
  isOpen: boolean;
  user: UserProfileStub | null;
  processing: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (userId: string, newRole: Role) => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen, user, processing, error, onClose, onSave
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  // Sync internal state when a new user is passed in
  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Modify System Role</h3>
            <button onClick={onClose} disabled={processing} className="text-slate-400 hover:text-slate-700 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-6 truncate">Editing permissions for <span className="font-semibold text-slate-700">{user.email}</span></p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1 mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Assign New Role</label>
            <select 
              value={selectedRole || ''} 
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              disabled={processing}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white disabled:opacity-50"
            >
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button 
              disabled={processing}
              onClick={onClose}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              disabled={processing || selectedRole === user.role}
              onClick={() => onSave(user.id, selectedRole)}
              className="flex-1 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Save Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};