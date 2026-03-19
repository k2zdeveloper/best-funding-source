import React, { useState } from 'react';
import { AlertCircle, Loader2, Lock, Mail, UserPlus, XCircle } from 'lucide-react';

interface CreateAdminModalProps {
  isOpen: boolean;
  processing: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (email: string, password: string) => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen, processing, error, onClose, onSubmit
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <div className="p-1.5 bg-slate-200 rounded-md text-slate-700"><UserPlus className="w-4 h-4" /></div>
            Provision New Admin
          </h3>
          <button onClick={handleClose} disabled={processing} className="text-slate-400 hover:text-slate-700 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="email" required disabled={processing}
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@yourcompany.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Temporary Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="password" required minLength={12} disabled={processing}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" disabled={processing}
              className="w-full py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin Account'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 px-4">
              Upon creation, this identity will immediately inherit full administrative privileges.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};