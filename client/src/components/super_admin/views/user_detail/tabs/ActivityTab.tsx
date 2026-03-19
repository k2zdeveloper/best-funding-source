import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { type FullUserProfile } from '../../../hooks/useAdminDirectory';

interface ActivityTabProps {
  user: FullUserProfile;
  loans: any[];
  participation: any[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ user, loans, participation }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4">
      {user.role === 'borrower' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            Loan Application History
          </h3>
          {loans.length > 0 ? (
            <div className="space-y-4">
              {loans.map(loan => (
                <div 
                  key={loan.id} 
                  className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-white" 
                  onClick={() => navigate(`/admin-dashboard/loans/${loan.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-lg font-bold text-slate-900">${Number(loan.facility_amount).toLocaleString()}</p>
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">{loan.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{loan.business_description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No loan postings found for this borrower.</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
            Participation & Interest
          </h3>
          {participation.length > 0 ? (
            <div className="space-y-4">
              {participation.map(part => (
                <div key={part.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-bold text-slate-900">Expressed Interest in Deal #{part.deal_id?.substring(0,8)}</p>
                  </div>
                  <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
                    "{part.message_text}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">This lender has not participated in any deals yet.</p>
          )}
        </div>
      )}
    </div>
  );
};