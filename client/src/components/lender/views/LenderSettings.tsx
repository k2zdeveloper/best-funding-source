import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Loader2, Building2, ShieldCheck, EyeOff, Eye, 
  Bell, Lock, Briefcase, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface LenderProfileSettings {
  aum: string;
  industry_focus: string;
  min_yield_target: string;
  settings: {
    anonymous_mode: boolean;
    auto_nda_required: boolean;
    alerts: {
      new_deals: boolean;
      direct_messages: boolean;
      document_updates: boolean;
    }
  }
}

export const LenderSettings: React.FC<{ userData: any }> = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile & Preferences State
  const [profile, setProfile] = useState<LenderProfileSettings>({
    aum: '',
    industry_focus: '',
    min_yield_target: '',
    settings: {
      anonymous_mode: false,
      auto_nda_required: true,
      alerts: { new_deals: true, direct_messages: true, document_updates: true }
    }
  });

  // --- 1. FETCH CURRENT SETTINGS ---
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userData?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('aum, industry, settings')
          .eq('id', userData.id)
          .single();

        if (error) throw error;

        setProfile(prev => ({
          ...prev,
          aum: data.aum || '',
          industry_focus: data.industry || '',
          settings: data.settings || prev.settings // Fallback to defaults if null
        }));
      } catch (err: any) {
        console.error("Failed to load settings:", err);
      } finally {
        setInitialFetchLoading(false);
      }
    };
    fetchSettings();
  }, [userData?.id]);

  // --- 2. UPDATE SECURITY (AUTH) ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      // Step 1: Retrieve the current session email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error("Could not verify active session.");

      // Step 2: Re-authenticate to prove they know the current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (verifyError) throw new Error("Incorrect current password.");

      // Step 3: Issue the new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      
      setMsg({ text: 'Security credentials updated successfully.', type: 'success' });
      setOldPassword(''); 
      setNewPassword('');
      setShowOldPassword(false);
      setShowNewPassword(false);
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. UPDATE PROFILE & PREFERENCES (DATABASE) ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          aum: profile.aum,
          industry: profile.industry_focus,
          settings: profile.settings // Updates the JSONB column
        })
        .eq('id', userData.id);

      if (error) throw error;
      setMsg({ text: 'Institutional profile and preferences saved.', type: 'success' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      type="button" 
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${checked ? 'translate-x-2' : '-translate-x-2'}`} />
    </button>
  );

  if (initialFetchLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto pb-10">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Institution Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your public profile, deal flow preferences, and security.</p>
      </div>

      {msg.text && (
        <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      {/* --- FORM 1: PROFILE & PREFERENCES --- */}
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* SECTION A: Marketplace Appearance (Privacy) */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Marketplace Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-1">Anonymous Mode</label>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  When enabled, your institution will appear as "Verified Institutional Lender" to borrowers in the marketplace. Your exact legal name will only be revealed if you submit a formal Term Sheet offer.
                </p>
              </div>
              <ToggleSwitch 
                checked={profile.settings.anonymous_mode} 
                onChange={() => setProfile(p => ({...p, settings: {...p.settings, anonymous_mode: !p.settings.anonymous_mode}}))} 
              />
            </div>
            
            <div className="flex items-start justify-between gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-1">Auto-NDA Enforcement</label>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  Require borrowers to digitally sign a standard Non-Disclosure Agreement before your compliance team can view their extended data room and financials.
                </p>
              </div>
              <ToggleSwitch 
                checked={profile.settings.auto_nda_required} 
                onChange={() => setProfile(p => ({...p, settings: {...p.settings, auto_nda_required: !p.settings.auto_nda_required}}))} 
              />
            </div>
          </div>
        </section>

        {/* SECTION B: Institutional Details */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Entity Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Verified Legal Name</label>
              <input 
                type="text" value={userData?.company_name || 'Pending Verification'} disabled
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm rounded-lg text-slate-500 cursor-not-allowed font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold">LOCKED BY COMPLIANCE. Contact support to amend KYC records.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Declared AUM</label>
              <input 
                type="text" placeholder="e.g. $500M"
                value={profile.aum} onChange={(e) => setProfile(p => ({...p, aum: e.target.value}))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Target Industry Focus</label>
              <select 
                value={profile.industry_focus} onChange={(e) => setProfile(p => ({...p, industry_focus: e.target.value}))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              >
                <option value="">Agnostic / All Sectors</option>
                <option value="SaaS & Technology">SaaS & Technology</option>
                <option value="Real Estate">Commercial Real Estate</option>
                <option value="Manufacturing">Manufacturing & Industrials</option>
                <option value="Healthcare">Healthcare & BioTech</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION C: Notifications */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alerts & Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-sm font-semibold text-slate-800">New Deals Matching Criteria</span>
              <ToggleSwitch 
                checked={profile.settings.alerts.new_deals} 
                onChange={() => setProfile(p => ({...p, settings: {...p.settings, alerts: {...p.settings.alerts, new_deals: !p.settings.alerts.new_deals}}}))} 
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-sm font-semibold text-slate-800">Direct Messages from Borrowers</span>
              <ToggleSwitch 
                checked={profile.settings.alerts.direct_messages} 
                onChange={() => setProfile(p => ({...p, settings: {...p.settings, alerts: {...p.settings.alerts, direct_messages: !p.settings.alerts.direct_messages}}}))} 
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-sm font-semibold text-slate-800">Data Room Document Updates</span>
              <ToggleSwitch 
                checked={profile.settings.alerts.document_updates} 
                onChange={() => setProfile(p => ({...p, settings: {...p.settings, alerts: {...p.settings.alerts, document_updates: !p.settings.alerts.document_updates}}}))} 
              />
            </div>
          </div>
        </section>

        {/* Global Save Button for Profile/Preferences */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" disabled={loading}
            className="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            Save Institutional Preferences
          </button>
        </div>
      </form>

      {/* --- FORM 2: SECURITY (Auth API) --- */}
      <form onSubmit={handleUpdatePassword} className="mt-12 bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-red-50/50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Account Security</h2>
        </div>
        
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-500 mb-2">To change your master passphrase, you must first verify your current credentials.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Enter current password"
                />
                <button 
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={12}
                  className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Minimum 12 characters"
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-red-50 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-medium">Session will remain active across devices after update.</p>
            <button 
              type="submit" disabled={loading || !oldPassword || newPassword.length < 12}
              className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Update Security Credentials
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};