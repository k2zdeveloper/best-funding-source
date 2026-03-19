import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShieldCheck, FileText, LifeBuoy, Settings, 
  LogOut, AlertCircle, ChevronLeft, ChevronRight, Users, 
  MessageSquareWarning, Ban, X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Tooltip } from '../../ui/Tooltip';

// EXPANDED PROVISIONS: Added all requested enterprise routes
const NAV_ITEMS = [
  { path: '.', label: 'Overview Metrics', icon: LayoutDashboard, exact: true },
  { path: 'users', label: 'Identity Directory', icon: Users },
  { path: 'verifications', label: 'KYC & Compliance', icon: ShieldCheck },
  { path: 'loans', label: 'Loan Audits', icon: FileText },
  { path: 'reports', label: 'Chat & Abuse', icon: MessageSquareWarning },
  { path: 'restrictions', label: 'Access Control', icon: Ban },
  { path: 'support', label: 'Support Desk', icon: LifeBuoy },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, closeMobile }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const safeRole = String(role || '').toLowerCase().trim();
  const isSuperAdmin = safeRole === 'super_admin';
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'A';

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setLogoutError(err.message || "Sign out failed.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* --- MOBILE BACKDROP (Light Glassmorphism) --- */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-50 bg-white text-slate-600 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 
        ${isCollapsed ? 'w-20' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none'}`}
      >
        
        {/* --- BRAND HEADER --- */}
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-100 shrink-0">
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Enterprise</h1>
              <p className="text-[9px] text-blue-600 uppercase tracking-[0.2em] font-bold mt-0.5">{safeRole.replace('_', ' ')}</p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center animate-in zoom-in duration-300">
              <div className="w-8 h-8 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold tracking-tighter">
                EN
              </div>
            </div>
          )}
          {/* Mobile Close Button */}
          <button onClick={closeMobile} className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.path} text={item.label} disabled={!isCollapsed}>
              <NavLink
                to={item.path} 
                end={item.exact} 
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center mx-3 transition-all duration-200 group ${
                    isCollapsed ? 'justify-center p-3 rounded-xl' : 'px-3 py-2.5 gap-3 rounded-lg'
                  } ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold border border-transparent'}`
                }
              >
                <item.icon className={`shrink-0 transition-colors ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
              </NavLink>
            </Tooltip>
          ))}

          {/* System Settings (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <Tooltip text="System Settings" disabled={!isCollapsed}>
                <NavLink
                  to="settings" 
                  onClick={closeMobile}
                  className={({ isActive }) => 
                    `flex items-center mx-3 transition-all duration-200 group ${
                      isCollapsed ? 'justify-center p-3 rounded-xl' : 'px-3 py-2.5 gap-3 rounded-lg'
                    } ${isActive 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold border border-transparent'}`
                  }
                >
                  <Settings className={`shrink-0 transition-colors ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {!isCollapsed && <span className="tracking-tight">System Settings</span>}
                </NavLink>
              </Tooltip>
            </div>
          )}
        </nav>

        {/* --- FOOTER & USER PROFILE --- */}
        <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
          
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:flex w-full items-center justify-center p-2 mb-3 text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Error Message */}
          {logoutError && !isCollapsed && (
            <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-[10px] font-semibold leading-tight shadow-sm">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" /> <p>{logoutError}</p>
            </div>
          )}

          {/* User Profile Card */}
          <div className={`flex items-center gap-3 bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 border border-blue-100">
              {userInitials}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{user?.email}</p>
                <p className="text-[10px] font-semibold text-slate-500 truncate uppercase tracking-wider mt-0.5">Super Admin</p>
              </div>
            )}
            
            {!isCollapsed && (
              <Tooltip text="Sign Out" disabled={true}>
                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut} 
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};