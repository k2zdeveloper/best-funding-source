import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, Bell, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

interface BorrowerSettingsProps {
  userData: any;
}

export const BorrowerSettings: React.FC<BorrowerSettingsProps> = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // States
  const [password, setPassword] = useState('');
  const [revenue, setRevenue] = useState(userData?.revenue || '');
  
  // Notification Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [docAlerts, setDocAlerts] = useState(true);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg({ text: 'Security credentials updated successfully.', type: 'success' });
      setPassword('');
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      // Simulate Database Update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMsg({ text: 'Corporate profile updated.', type: 'success' });
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your corporate profile, security, and notification preferences.</p>
      </div>

      {msg.text && (
        <div className={`p-4 mb-6 border rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {msg.text}
        </div>
      )}

      {/* --- NOTIFICATION PREFERENCES --- */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" /> Alert Preferences
        </h2>
        <div className="space-y-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-2">
            <div>
              <p className="text-sm font-bold text-slate-900">Direct Messages</p>
              <p className="text-xs text-slate-500 mt-0.5">Email me when an institution sends a direct message.</p>
            </div>
            <button 
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailAlerts ? 'left-7' : 'left-1'}`}></span>
            </button>
          </div>
          <div className="w-full border-t border-slate-100"></div>
          <div className="flex items-center justify-between p-2">
            <div>
              <p className="text-sm font-bold text-slate-900">Document Downloads</p>
              <p className="text-xs text-slate-500 mt-0.5">Alert me immediately when a lender downloads my secure data room files.</p>
            </div>
            <button 
              onClick={() => setDocAlerts(!docAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative ${docAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${docAlerts ? 'left-7' : 'left-1'}`}></span>
            </button>
          </div>
        </div>
      </section>

      {/* --- CORPORATE PROFILE --- */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" /> Corporate Details
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Legal Entity Name</label>
              <input 
                type="text" value={userData?.company_name || ''} disabled 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed" 
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">To change your entity name, contact underwriting support.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Reported Revenue (TTM)</label>
              <input 
                type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} 
                className="w-full bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </section>

      {/* --- SECURITY --- */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Security
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="max-w-sm">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Change Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12}
              className="w-full bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Minimum 12 characters"
            />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading || !password} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
};