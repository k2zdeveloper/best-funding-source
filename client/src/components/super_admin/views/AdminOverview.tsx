import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, ArrowRight, ShieldAlert, Clock, 
  RefreshCw, AlertTriangle, AlertCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

// --- TYPES ---
interface DashboardMetrics {
  pendingKyc: number;
  activeLoans: number;
  openTickets: number;
}

interface AuditLogStub {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
}

// --- INTERACTIVE SAAS COMPONENTS ---

const DashboardStatCard = ({ title, value, subtitle, icon: Icon, loading, accent, delay, onClick }: any) => {
  // Mapping our minimalist colors, colored shadows, and icon tints
  const accents: Record<string, string> = {
    blue: 'border-l-blue-500 text-blue-600 bg-blue-50 hover:shadow-blue-900/10',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-50 hover:shadow-emerald-900/10',
    orange: 'border-l-orange-500 text-orange-600 bg-orange-50 hover:shadow-orange-900/10',
  };
  const activeAccent = accents[accent] || accents.blue;
  const [borderColor, iconColor, bgColor, shadowHover] = activeAccent.split(' ');

  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden w-full text-left bg-white border border-slate-200 border-l-4 rounded-2xl shadow-sm p-5 flex items-start gap-4 transition-all duration-300 ease-out hover:-translate-y-1 ${shadowHover} animate-in fade-in slide-in-from-bottom-4 fill-mode-both group ${borderColor}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* SaaS Watermark / Shadow Icon */}
      <Icon className={`absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none ${iconColor}`} />

      {/* Floating Icon Box */}
      <div className={`relative z-10 p-3 rounded-xl border border-white/50 shrink-0 transition-colors duration-300 shadow-sm ${bgColor} ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-1 mb-1" />
        ) : (
          <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
        )}
        <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>
      </div>
    </button>
  );
};

const DashboardActionCard = ({ title, subtitle, icon: Icon, onClick, accent, delay }: any) => {
  const hoverBorders: Record<string, string> = {
    blue: 'hover:border-blue-400 hover:shadow-blue-900/5 group-hover:bg-blue-50 group-hover:text-blue-600',
    purple: 'hover:border-purple-400 hover:shadow-purple-900/5 group-hover:bg-purple-50 group-hover:text-purple-600',
    orange: 'hover:border-orange-400 hover:shadow-orange-900/5 group-hover:bg-orange-50 group-hover:text-orange-600',
  };
  const activeHover = hoverBorders[accent] || hoverBorders.blue;

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md group text-left animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${activeHover.split(' ')[0]} ${activeHover.split(' ')[1]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 transition-colors duration-300 ${activeHover.split(' ').slice(2).join(' ')}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900 transition-colors tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-1.5 rounded-full bg-slate-50 group-hover:bg-white transition-colors">
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all duration-300 group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};

// Semantic Badge Generator
const getEntityBadge = (entity: string) => {
  if (entity.includes('profile') || entity.includes('user')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (entity.includes('loan') || entity.includes('deal')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (entity.includes('verif') || entity.includes('kyc')) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

// --- MAIN COMPONENT ---
export const AdminOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({ pendingKyc: 0, activeLoans: 0, openTickets: 0 });
  const [recentLogs, setRecentLogs] = useState<AuditLogStub[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    try {
      const [borrowerReq, lenderReq, loansReq, ticketsReq, logsReq] = await Promise.all([
        supabase.from('borrower_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('lender_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('loan_postings').select('*', { count: 'exact', head: true }).in('status', ['pending_review', 'active']),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('audit_logs').select('id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      if (borrowerReq.error) throw borrowerReq.error;
      if (logsReq.error) throw logsReq.error;

      setMetrics({
        pendingKyc: (borrowerReq.count || 0) + (lenderReq.count || 0),
        activeLoans: loansReq.count || 0,
        openTickets: ticketsReq.count || 0,
      });

      setRecentLogs(logsReq.data || []);
      
    } catch (err: any) {
      console.error("[DASHBOARD] Fetch failed:", err);
      setError("Failed to synchronize latest platform metrics. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 antialiased tracking-tight">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.email?.split('@')[0] || 'Admin'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" /> {currentDate}
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-white border border-l-4 border-slate-200 border-l-red-500 rounded-xl shadow-sm p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Connection Interrupted</h4>
            <p className="text-xs font-medium text-slate-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* --- METRICS ROW (Now Clickable!) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardStatCard 
          loading={loading} 
          title="Pending KYC" 
          value={metrics.pendingKyc} 
          subtitle="Entities awaiting review" 
          icon={ShieldAlert} 
          accent="blue" 
          delay={0} 
          onClick={() => navigate('verifications')} 
        />
        <DashboardStatCard 
          loading={loading} 
          title="Active Deals" 
          value={metrics.activeLoans} 
          subtitle="Currently on marketplace" 
          icon={Activity} 
          accent="emerald" 
          delay={100} 
          onClick={() => navigate('loans')} 
        />
        <DashboardStatCard 
          loading={loading} 
          title="Open Tickets" 
          value={metrics.openTickets} 
          subtitle="Unresolved inquiries" 
          icon={AlertCircle} 
          accent="orange" 
          delay={200} 
          onClick={() => navigate('support')} 
        />
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Activity Table */}
        <div className="lg:col-span-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">System Activity</h3>
            <button className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-1 transition-all duration-300 group">
              View Logs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-bold">Action Event</th>
                    <th className="px-6 py-4 font-bold">Entity / Module</th>
                    <th className="px-6 py-4 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg w-32" /></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg w-24" /></td>
                        <td className="px-6 py-4 flex justify-end"><div className="h-4 bg-slate-100 rounded-lg w-20" /></td>
                      </tr>
                    ))
                  ) : recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                        <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto mb-3 border border-slate-100">
                          <Activity className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">No recent activity detected.</p>
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                        <td className="px-6 py-4 text-xs font-bold text-slate-900 capitalize tracking-tight group-hover:text-blue-600 transition-colors">
                          {log.action.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-md ${getEntityBadge(log.entity_type)}`}>
                            {log.entity_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono font-medium group-hover:text-slate-600 transition-colors">
                          {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(log.created_at))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1 animate-in fade-in fill-mode-both" style={{ animationDelay: '400ms' }}>
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            <DashboardActionCard title="Review KYC" subtitle="Approve pending entities" icon={ShieldAlert} accent="blue" delay={400} onClick={() => navigate('verifications')} />
            <DashboardActionCard title="Manage Users" subtitle="Provision admin roles" icon={Users} accent="purple" delay={500} onClick={() => navigate('users')} />
            <DashboardActionCard title="Support Desk" subtitle="Resolve user tickets" icon={AlertCircle} accent="orange" delay={600} onClick={() => navigate('support')} />
          </div>
        </div>

      </div>
    </div>
  );
};