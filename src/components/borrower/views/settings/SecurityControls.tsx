import React, { useState } from 'react';
import { Key, AlertCircle, Loader2, Smartphone, Shield, Laptop } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

export const SecurityControls: React.FC = () => {
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Password Strength Algorithm
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(passwords.new);
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Enterprise Grade'];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setSuccessMsg('');
    
    if (strengthScore < 3) return setPassError('Password is not strong enough to meet compliance standards.');
    if (passwords.new !== passwords.confirm) return setPassError('Passwords do not match.');

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      setSuccessMsg('Security credentials updated and encrypted successfully.');
      setPasswords({ new: '', confirm: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error: any) {
      setPassError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleUpdatePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-900">Update Password</h3>
          </div>
          
          {passError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-start gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {passError}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-start gap-2 animate-in slide-in-from-top-2">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" /> {successMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">New Password</label>
              <input 
                type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold rounded-xl focus:border-blue-500"
              />
              {passwords.new && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`flex-1 ${strengthScore >= level ? strengthColors[strengthScore] : 'bg-transparent'} transition-colors duration-300`}></div>
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold text-right ${strengthScore < 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {strengthLabels[strengthScore]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Confirm New Password</label>
              <input 
                type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold rounded-xl focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <button type="submit" disabled={saving || !passwords.new || strengthScore < 3} className="w-full py-3 mt-6 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Password Change'}
        </button>
      </form>

      {/* Active Sessions */}
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Smartphone className="w-24 h-24" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Strict Security</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-xs">
              For enterprise compliance, you can terminate all active sessions across all devices immediately.
            </p>
            <button type="button" className="py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-colors backdrop-blur-sm">
              Sign Out of All Devices
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-400" /> Active Network Sessions
          </h3>
          <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-900">Current Workstation</p>
              <p className="text-[10px] text-slate-500">Secure connection established</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded-md">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};