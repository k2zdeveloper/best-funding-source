import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

export const LenderSettings: React.FC<{ userData: any }> = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // Interactive States
  const [password, setPassword] = useState('');
  const [aum, setAum] = useState(userData?.aum || '');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      // Direct integration: Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setMsg({ text: 'Password updated successfully.', type: 'success' });
      setPassword(''); // Clear input on success
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      // Simulate profile update logic (In reality, update the 'profiles' table)
      await new Promise(res => setTimeout(res, 1000));
      setMsg({ text: 'Profile details updated.', type: 'success' });
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your institutional profile and security preferences.</p>
      </div>

      {msg.text && (
        <div className={`p-3 mb-6 border rounded-lg text-xs font-medium ${msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Strict Minimalist Security Form */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Security</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">New Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              className="w-full bg-white border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
              placeholder="Minimum 12 characters"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Minimalist Profile Form */}
      <section>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Institutional Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Entity Name</label>
            <input 
              type="text"
              value={userData?.company_name || ''}
              disabled
              className="w-full bg-slate-100 border border-slate-200 px-3 py-2 text-sm rounded-lg text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Contact support to change legal entity name.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Declared AUM</label>
            <input 
              type="text"
              value={aum}
              onChange={(e) => setAum(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Details'}
          </button>
        </form>
      </section>
    </div>
  );
};