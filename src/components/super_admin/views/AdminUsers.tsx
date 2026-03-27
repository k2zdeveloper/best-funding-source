import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Edit3, ShieldAlert } from 'lucide-react';
import { useAdminDirectory, type SortOption } from '../hooks/useAdminDirectory';
import { Pagination } from '../../ui/Pagination';
import { Tooltip } from '../../ui/Tooltip';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    paginatedUsers, loading, totalItems,
    searchTerm, setSearchTerm, roleFilter, setRoleFilter,
    sortBy, setSortBy, currentPage, setCurrentPage, totalPages, itemsPerPage
  } = useAdminDirectory();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Identity Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage platform access, override credentials, and enforce legal holds.</p>
        </div>
      </div>

      {/* --- FILTER & SORT CONTROLS --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or entity name..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="borrower">Borrowers</option>
            <option value="lender">Lenders</option>
            <option value="admin">Admins</option>
          </select>
          <select 
            value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">Name (A-Z)</option>
            <option value="z-a">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Account Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status Flags</th>
                <th className="px-6 py-4">Registered On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">No identities match your criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${user.is_blocked ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{user.company_name || user.email}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-md border border-slate-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 flex-wrap max-w-[200px]">
                      {user.is_blocked ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded border border-red-200">Suspended (Banned)</span>
                      ) : user.restricted_until && new Date(user.restricted_until) > new Date() ? (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded border border-orange-200">
                          Restricted Timeout
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">Active</span>
                      )}
                      
                      {user.prevent_deletion && <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300">Legal Hold</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Tooltip text="View 360° Profile">
                        {/* --- THE FIX IS HERE --- */}
                        <button 
                          onClick={() => navigate(`/admin-dashboard/users/${user.id}`)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mount */}
        <Pagination 
          currentPage={currentPage} totalPages={totalPages} 
          totalItems={totalItems} itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};