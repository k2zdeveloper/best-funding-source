import React from 'react';
import type { Role } from '../../context/AuthContext';

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  if (!role) return <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Unassigned</span>;
  
  const styles: Record<string, string> = {
    super_admin: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-slate-100 text-slate-700 border-slate-300',
    lender: 'bg-blue-50 text-blue-700 border-blue-200',
    borrower: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[role] || styles.borrower}`}>
      {role.replace('_', ' ')}
    </span>
  );
};