import React from 'react';
import { ShieldAlert, XCircle, FileText, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { isBorrowerKYC, type KYCItem, type VerificationStatus } from '../../../types/kyc';
import { StatusBadge } from '../../ui/StatusBadge';

interface VerificationReviewModalProps {
  item: KYCItem | null;
  activeTab: 'borrowers' | 'lenders';
  adminNotes: string;
  processing: boolean;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onUpdateStatus: (status: VerificationStatus) => void;
}

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  item, activeTab, adminNotes, processing, onNotesChange, onClose, onUpdateStatus
}) => {
  if (!item) return null;

  const isBorrower = isBorrowerKYC(item);
  const entityName = isBorrower ? item.company_name : item.legal_name;
  const entityId = isBorrower ? item.ein : item.tax_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Identity Verification Review</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">REF: {item.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>
          <button onClick={() => !processing && onClose()} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Entity Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Legal Entity Name</p>
                <p className="font-bold text-slate-900">{entityName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Registration / Tax ID</p>
                <p className="font-mono text-sm font-bold text-slate-900">{entityId}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Submitted Documents</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                    {activeTab === 'borrowers' ? 'Valid Identification' : 'Signatory ID'}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                    {activeTab === 'borrowers' ? 'Business Registration' : 'Accreditation Proof'}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Audit Notes (Internal)</h4>
            <textarea 
              value={adminNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              disabled={processing}
              placeholder="Leave reasoning here before approving or rejecting..."
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none min-h-[120px] resize-none placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Current Status:</span>
            <StatusBadge status={item.status} />
          </div>
          
          <div className="flex w-full sm:w-auto gap-2">
            <button 
              disabled={processing}
              onClick={() => onUpdateStatus('rejected')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button 
              disabled={processing}
              onClick={() => onUpdateStatus('action_required')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Request Edits
            </button>
            <button 
              disabled={processing}
              onClick={() => onUpdateStatus('approved')}
              className="flex-1 sm:flex-none px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve User
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};