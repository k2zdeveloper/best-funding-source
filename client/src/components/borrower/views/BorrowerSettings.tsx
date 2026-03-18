import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Loader2, Bell, ShieldCheck, Building2, CheckCircle2, 
  EyeOff, Clock, Smartphone, Lock, AlertCircle, Key, Laptop,
  DollarSign, Shield
} from 'lucide-react';

interface BorrowerSettingsProps {
  userData: any;
}

export const BorrowerSettings: React.FC<BorrowerSettingsProps> = ({ userData }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // --- PREFERENCES STATE ---
  const [preferences, setPreferences] = useState({
    anonymous_mode: false,
    funding_timeline: '1-3_months',
    alerts: {
      direct_messages: true,
      document_downloads: true,
      term_sheet_offers: true,
    }
  });

  // --- CORPORATE STATES ---
  const [revenue, setRevenue] = useState('');
  const [industry, setIndustry] = useState('');

  // --- SECURITY STATES ---
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [passError, setPassError] = useState('');

  // --- 1. SECURE DATA FETCHING ---
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!userData?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('revenue, industry, settings')
          .eq('id', userData.id)
          .single();

        // We ignore the "Row not found" error because they might be a new user
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setRevenue(data.revenue || '');
          setIndustry(data.industry || 'Technology');
          if (data.settings) setPreferences(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileSettings();
  }, [userData]);

  // --- 2. PASSWORD STRENGTH ALGORITHM ---
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strengthScore = calculatePasswordStrength(passwords.new);
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Enterprise Grade'];

  // --- 3. FIX: THE UPSERT HANDLER ---
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg({ text: '', type: '' });
    
    try {
      // ENTERPRISE FIX: Use upsert so if the row doesn't exist, it creates it!
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id, // You MUST include the ID for an upsert
          role: userData.role || 'borrower', // Preserve role
          email: userData.email,
          revenue: revenue,
          industry: industry,
          settings: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMsg({ text: 'Corporate preferences securely saved to database.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // --- 4. ROBUST PASSWORD HANDLER ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    
    if (strengthScore < 3) {
      setPassError('Password is not strong enough to meet compliance standards.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError('Passwords do not match.');
      return;
    }

    setSaving(true); setMsg({ text: '', type: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      setMsg({ text: 'Security credentials updated and encrypted successfully.', type: 'success' });
      setPasswords({ new: '', confirm: '' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (error: any) {
      setPassError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val: string) => {
    const raw = val.replace(/\D/g, '');
    return raw ? parseInt(raw, 10).toLocaleString('en-US') : '';
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      type="button" onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-6' : 'left-1'}`}></span>
    </button>
  );

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your corporate profile, marketplace privacy, and security constraints.</p>
      </div>

      {msg.text && (
        <div className={`p-4 mb-6 border rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm ${msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {msg.text}
        </div>
      )}

      <form onSubmit={handleUpdatePreferences} className="space-y-10">
        
        {/* --- MARKETPLACE PRIVACY --- */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-blue-600" /> Marketplace Privacy & Intent
          </h2>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Anonymous Marketplace Listing <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase rounded-full tracking-wider">Pro Feature</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                  Hide your Legal Entity Name in the public marketplace. Lenders will only see your industry and financials until they request access.
                </p>
              </div>
              <Toggle checked={preferences.anonymous_mode} onChange={() => setPreferences({...preferences, anonymous_mode: !preferences.anonymous_mode})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Target Funding Timeline
              </label>
              <select 
                value={preferences.funding_timeline}
                onChange={(e) => setPreferences({...preferences, funding_timeline: e.target.value})}
                className="w-full sm:w-1/2 bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="asap">ASAP (Immediate Capital Need)</option>
                <option value="1-3_months">1 to 3 Months</option>
                <option value="3-6_months">3 to 6 Months</option>
                <option value="exploratory">Exploratory / Refinancing Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* --- CORPORATE PROFILE --- */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Corporate Details
          </h2>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Legal Entity Name</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" value={userData?.company_name || 'Unverified Entity'} disabled 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Primary Industry</label>
                <select 
                  value={industry} onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Technology / SaaS</option>
                  <option>Manufacturing</option>
                  <option>Commercial Real Estate</option>
                  <option>Healthcare / Medical</option>
                  <option>Logistics & Supply Chain</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Reported Revenue (Trailing 12 Months)</label>
                <div className="relative max-w-md">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" value={revenue} onChange={(e) => setRevenue(formatCurrency(e.target.value))} 
                    placeholder="2,500,000"
                    className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 text-base font-bold text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ALERT PREFERENCES --- */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Notification Routing
          </h2>
          <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 rounded-2xl transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-900">Term Sheet Offers</p>
                <p className="text-xs text-slate-500">Immediate email alerts for new term sheets.</p>
              </div>
              <Toggle checked={preferences.alerts.term_sheet_offers} onChange={() => setPreferences({...preferences, alerts: {...preferences.alerts, term_sheet_offers: !preferences.alerts.term_sheet_offers}})} />
            </div>
            <div className="w-full border-t border-slate-100"></div>
            <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 rounded-2xl transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-900">Document Access</p>
                <p className="text-xs text-slate-500">Alert me when files are downloaded.</p>
              </div>
              <Toggle checked={preferences.alerts.document_downloads} onChange={() => setPreferences({...preferences, alerts: {...preferences.alerts, document_downloads: !preferences.alerts.document_downloads}})} />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 pb-6">
          <button type="submit" disabled={saving} className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Save Configuration
          </button>
        </div>
      </form>

      {/* --- SECTION 4: SECURITY --- */}
      <section className="mt-8 pt-10 border-t border-slate-200">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Security & Access Control
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Robust Password Update Form */}
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

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">New Password</label>
                  <input 
                    type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold rounded-xl focus:border-blue-500"
                  />
                  {/* Visual Password Strength Meter */}
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

          {/* Active Sessions & Global Logout */}
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
      </section>
    </div>
  );
};