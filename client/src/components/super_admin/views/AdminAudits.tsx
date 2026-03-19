import React, { useState } from 'react';
import { MessageSquareWarning, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
// Note: You will create a `useAdminAudits.ts` hook similar to the users hook to fetch this data.

export const AdminAudits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'loans'>('chats');

  // Mock Data for UI Structure
  const chatReports = [
    { id: 1, reporter: 'Apex Capital', reported: 'Acme Corp', reason: 'Solicitation outside platform', date: 'Oct 24, 2026', status: 'pending' },
    { id: 2, reporter: 'Crestview', reported: 'Nexus Tech', reason: 'Inappropriate language', date: 'Oct 22, 2026', status: 'resolved' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">System Audits & Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Review flagged conversations and anomalous loan applications.</p>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <MessageSquareWarning className="w-4 h-4" /> Chat Reports
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'loans' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <FileText className="w-4 h-4" /> Loan Audits
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {activeTab === 'chats' ? (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reported Entity</th>
                <th className="px-6 py-4">Flag Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chatReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{report.reporter}</td>
                  <td className="px-6 py-4 text-slate-700">{report.reported}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold w-fit">
                      <AlertTriangle className="w-3 h-3" /> {report.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{report.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 shadow-sm">Review Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ShieldCheck className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No anomalous loan applications detected.</p>
            <p className="text-xs mt-1">Our automated risk engine has not flagged any recent pitches.</p>
          </div>
        )}
      </div>

    </div>
  );
};