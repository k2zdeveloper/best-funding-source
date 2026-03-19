import React from 'react';
import { 
  Loader2, Bell, ShieldCheck, Building2, CheckCircle2, 
  EyeOff, Clock, Lock, DollarSign
} from 'lucide-react';

import { useBorrowerSettings } from './settings/useBorrowerSettings';
import { SecurityControls } from './settings/SecurityControls';
import { Toggle } from '../../ui/Toggle'; // Reusable component

interface BorrowerSettingsProps {
  userData: any;
}

export const BorrowerSettings: React.FC<BorrowerSettingsProps> = ({ userData }) => {
  const { 
    loading, saving, msg, 
    revenue, industry, preferences, 
    handleRevenueChange, setIndustry, setPreferences, saveSettings 
  } = useBorrowerSettings(userData);

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

      <form onSubmit={saveSettings} className="space-y-10">
        
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
              <Toggle 
                checked={preferences.anonymous_mode} 
                onChange={() => setPreferences({...preferences, anonymous_mode: !preferences.anonymous_mode})} 
              />
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
                    type="text" value={revenue} onChange={(e) => handleRevenueChange(e.target.value)} 
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
              <Toggle 
                checked={preferences.alerts.term_sheet_offers} 
                onChange={() => setPreferences({...preferences, alerts: {...preferences.alerts, term_sheet_offers: !preferences.alerts.term_sheet_offers}})} 
              />
            </div>
            <div className="w-full border-t border-slate-100"></div>
            <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 rounded-2xl transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-900">Document Access</p>
                <p className="text-xs text-slate-500">Alert me when files are downloaded.</p>
              </div>
              <Toggle 
                checked={preferences.alerts.document_downloads} 
                onChange={() => setPreferences({...preferences, alerts: {...preferences.alerts, document_downloads: !preferences.alerts.document_downloads}})} 
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 pb-6">
          <button type="submit" disabled={saving} className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50">
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
        <SecurityControls />
      </section>

    </div>
  );
};