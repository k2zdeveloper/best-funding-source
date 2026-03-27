import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { 
  ArrowLeft, Loader2, ShieldCheck, Building2, 
  FileSearch, History, AlertCircle
} from 'lucide-react';
import { useAdminUserDetail } from '../../hooks/useAdminUserDetail';
import { SecureDocumentViewer } from '../user_detail/SecureDocumentViewer';
import { SecuritySidebar } from '../user_detail/SecuritySidebar';
import { ComplianceTab } from '../user_detail/tabs/ComplianceTab';

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    user, loans, participation, verification, 
    loading, updating, error, updateFlags, reviewVerification, forcePasswordReset
  } = useAdminUserDetail(id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'activity'>(
    (location.state?.activeTab as any) || 'overview'
  );
  
  const [docLoading, setDocLoading] = useState(false);
  const [activeDocument, setActiveDocument] = useState<{ url: string; type: 'pdf' | 'image'; title: string } | null>(null);

  const handleViewSecureDocument = async (path: string | undefined, documentTitle: string) => {
    if (!path) return alert("Document path is missing from the database.");
    setDocLoading(true);
    try {
      const { data, error: signError } = await supabase.storage.from('verification_documents').createSignedUrl(path, 60);
      if (signError) throw signError;
      if (data?.signedUrl) {
        setActiveDocument({ url: data.signedUrl, type: path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image', title: documentTitle });
      }
    } catch (err: any) {
      alert("Security Error: Unable to generate secure access token.");
    } finally {
      setDocLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  if (error) return <div className="p-10 max-w-2xl mx-auto mt-10"><div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4 items-start"><AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" /><div><h3 className="font-bold text-red-900 text-lg mb-1">{error.title}</h3><p className="text-sm text-red-700">{error.message}</p></div></div></div>;
  if (!user) return <div className="p-10 text-center text-slate-500">User profile could not be loaded.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      <SecureDocumentViewer activeDocument={activeDocument} onClose={() => setActiveDocument(null)} />

      {docLoading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-50">
           <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="text-sm font-bold text-slate-700">Generating secure session...</p>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin-dashboard/users')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{user.company_name || 'Individual Account'}</h2>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${user.role === 'borrower' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{user.role}</span>
            </div>
            <p className="text-sm text-slate-500 font-mono mt-1">{user.email}</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: FileSearch },
            { id: 'compliance', label: 'KYC/Docs', icon: ShieldCheck },
            { id: 'activity', label: 'Marketplace', icon: History }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: TABS */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]"><Building2 className="w-4 h-4 text-blue-600" /> Corporate Profile</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Industry</p><p className="text-sm font-semibold">{user.industry || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p><p className="text-sm font-semibold">{new Date(user.created_at || '').toLocaleDateString()}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Revenue / AUM</p><p className="text-sm font-bold text-emerald-600">${user.revenue || user.aum || '0'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Verification</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${user.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.is_verified ? 'VERIFIED' : 'UNVERIFIED'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
             <ComplianceTab 
               user={user} 
               verification={verification} 
               updating={updating} 
               onViewDocument={handleViewSecureDocument} 
               reviewVerification={reviewVerification} 
             />
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">Platform History</h3>
                <p className="text-xs text-slate-500 italic">User has {loans.length} active loans and {participation.length} deal engagements.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ADMIN CONTROLS */}
        <div className="space-y-6">
          <SecuritySidebar 
            user={user} 
            updating={updating} 
            updateFlags={updateFlags} 
            forcePasswordReset={forcePasswordReset} 
          />
        </div>

      </div>
    </div>
  );
};