import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Building2, TrendingUp, Clock, ShieldCheck, ArrowLeft, 
  CheckCircle2, MapPin, Users, Lock, Loader2, Bookmark,
  FileSignature, X, DollarSign, Percent, AlertCircle, Download
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { generateAndUploadTermSheet } from '../../../utils/generateTermSheet';

const DealExecutionPanel = lazy(() => import('./deal-tabs/DealExecutionPanel').then(m => ({ default: m.DealExecutionPanel })));
const OverviewTab = lazy(() => import('./deal-tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));
const DiligenceTab = lazy(() => import('./deal-tabs/DiligenceTab').then(m => ({ default: m.DiligenceTab })));
const DiscussionTab = lazy(() => import('./deal-tabs/DiscussionTab').then(m => ({ default: m.DiscussionTab })));

interface LenderDealDetailProps {
  deal: any;
  userData: any; 
  onBack: () => void;
}

type TabState = 'overview' | 'diligence' | 'discussion';

export const LenderDealDetail: React.FC<LenderDealDetailProps> = ({ deal, userData, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // --- NEW: TERM SHEET TRACKING STATE ---
  const [myTermSheets, setMyTermSheets] = useState<any[]>([]);

  const [showTermSheetModal, setShowTermSheetModal] = useState<boolean>(false);
  const [submittingTermSheet, setSubmittingTermSheet] = useState<boolean>(false);
  const [signatureImageBase64, setSignatureImageBase64] = useState<string | null>(null);
  
  const [termSheetData, setTermSheetData] = useState({
    facilityAmount: '',
    yieldRate: '',
    termLength: '',
    originationFee: '0',
    expirationDate: '',
    notes: ''
  });

  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [downloadedDocs, setDownloadedDocs] = useState<string[]>([]);
  
  const fallbackImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565610222536-f1c699564f0b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
  ];

  // 1. Pulled fetch function out to refresh it easily
  const fetchInitialData = async () => {
    if (!userData?.id || !deal?.id) {
      setCheckingStatus(false);
      return;
    }
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', userData.id)
        .single();
        
      if (profileError) throw profileError;
      setIsVerified(profile?.is_verified || false);

      const { data: savedData } = await supabase
        .from('saved_deals')
        .select('id')
        .eq('lender_id', userData.id)
        .eq('loan_id', deal.id)
        .maybeSingle();

      if (savedData) setIsSaved(true);

      // --- NEW: FETCH LENDER'S OWN TERM SHEETS FOR THIS DEAL ---
      const { data: tsData } = await supabase
        .from('term_sheets')
        .select('*')
        .eq('loan_id', deal.id)
        .eq('lender_id', userData.id)
        .order('created_at', { ascending: false });
        
      if (tsData) setMyTermSheets(tsData);

    } catch (err) {
      setIsVerified(userData?.is_verified === true);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [userData?.id, deal?.id]);

  const handleToggleWatchlist = async () => {
    if (!userData?.id || !deal?.id) return;
    setSaving(true);
    try {
      if (isSaved) {
        await supabase.from('saved_deals').delete().eq('lender_id', userData.id).eq('loan_id', deal.id);
        setIsSaved(false);
      } else {
        await supabase.from('saved_deals').insert({ lender_id: userData.id, loan_id: deal.id });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Failed to update watchlist.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenTermSheetModal = () => {
    setTermSheetData({
      facilityAmount: deal.facility_amount?.toString() || '',
      yieldRate: deal.yield_rate?.toString() || '',
      termLength: deal.term_length_months?.toString() || '',
      originationFee: '1.5',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setSignatureImageBase64(null);
    setShowTermSheetModal(true);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSignatureImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleIssueTermSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureImageBase64) {
      alert("Please upload your signature to execute this term sheet.");
      return;
    }

    setSubmittingTermSheet(true);

    try {
      const pdfFilePath = await generateAndUploadTermSheet({
        dealId: deal.id,
        borrowerName: deal.company_name || deal.profiles?.company_name || 'Borrower',
        lenderName: userData?.company_name || 'Institutional Lender', 
        facilityAmount: termSheetData.facilityAmount,
        yieldRate: termSheetData.yieldRate,
        termLength: termSheetData.termLength,
        originationFee: termSheetData.originationFee,
        expirationDate: termSheetData.expirationDate,
        notes: termSheetData.notes,
        lenderSignatureBase64: signatureImageBase64
      });

      const { error: tsError } = await supabase.from('term_sheets').insert({
        loan_id: deal.id,
        lender_id: userData.id,
        facility_amount: Number(termSheetData.facilityAmount.replace(/,/g, '')),
        yield_rate: Number(termSheetData.yieldRate),
        term_length_months: Number(termSheetData.termLength),
        origination_fee_percent: Number(termSheetData.originationFee),
        expiration_date: termSheetData.expirationDate ? new Date(termSheetData.expirationDate).toISOString() : null,
        notes: termSheetData.notes,
        document_url: pdfFilePath
      });

      if (tsError) throw tsError;

      if (deal.borrower_id) {
        await supabase.from('notifications').insert({
          user_id: deal.borrower_id,
          title: 'Official Term Sheet Received',
          message: `An institutional lender has issued a fully signed term sheet for your facility.`,
          link: `/pitch_detail/${deal.id}` 
        });
      }

      setShowTermSheetModal(false);
      setSignatureImageBase64(null);
      alert('Term Sheet Executed & Transmitted Successfully!');
      
      // REFRESH DATA TO SHOW THE NEW TERM SHEET IN THE TRACKER!
      fetchInitialData();
      
    } catch (error: any) {
      console.error('Error submitting term sheet:', error);
      alert(`Failed to issue term sheet: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setSubmittingTermSheet(false);
    }
  };

  const handleDownload = async (docId: string, filePath: string, customName?: string) => {
    if (downloadedDocs.includes(docId) || !filePath) return; 
    setDownloadingDoc(docId);

    try {
      const { data, error } = await supabase.storage.from('documents').download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', customName || filePath.split('/').pop() || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setDownloadedDocs(prev => [...prev, docId]);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  const getRiskDetails = (grade: string) => {
    switch (grade) {
      case 'A+': return { label: 'Prime', colorClass: 'text-emerald-600' };
      case 'A': return { label: 'Low Risk', colorClass: 'text-emerald-500' };
      case 'B': return { label: 'Med Risk', colorClass: 'text-[#1B6FA5]' };
      case 'C': return { label: 'High Risk', colorClass: 'text-amber-500' };
      default: return { label: 'Unrated', colorClass: 'text-slate-400' };
    }
  };

  if (!deal) return null;

  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Securing data room...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="animate-in fade-in duration-500 pb-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
        </button>
        <div className="max-w-xl mx-auto mt-10 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Deal Room Restricted</h2>
          <p className="text-sm text-slate-500 mb-6">
            You are attempting to access a secured data room. Your institutional status must be fully verified by our compliance team before accessing proprietary deal information and diligence materials.
          </p>
          <button onClick={onBack} className="px-6 py-2.5 bg-[#1B6FA5] text-white text-sm font-bold rounded-lg hover:bg-[#155A8A] transition-colors shadow-md">
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const displayImages = deal.media_urls?.length >= 3 ? deal.media_urls : fallbackImages;
  const riskProps = getRiskDetails(deal.risk_grade);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1B6FA5] transition-colors uppercase tracking-wider mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-7 h-7 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {deal.company_name || deal.profiles?.company_name || 'Confidential Listing'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {deal.industry || 'Business'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> United States</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <button 
              onClick={handleToggleWatchlist}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                isSaved 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B6FA5] hover:text-[#1B6FA5]'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />}
              <span className="hidden sm:inline">{saving ? 'Updating...' : isSaved ? 'Saved to Watchlist' : 'Save Deal'}</span>
            </button>

            {/* ISSUE TERM SHEET BUTTON (Only show if no term sheet has been accepted yet) */}
            {!myTermSheets.some(ts => ts.status === 'accepted') && (
              <button 
                onClick={handleOpenTermSheetModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#21B0A6] text-white text-xs font-bold rounded-lg hover:bg-[#1C968D] transition-all shadow-sm shadow-[#21B0A6]/20"
              >
                <FileSignature className="w-4 h-4" /> Issue Term Sheet
              </button>
            )}
          </div>

          <button className="text-xs font-bold text-slate-500 hover:text-[#1B6FA5] transition-colors flex items-center gap-1 mt-1">
            <Users className="w-3.5 h-3.5" /> Schedule Management Call
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Facility Size</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(deal.facility_amount)}</p>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Yield</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-2xl font-semibold text-emerald-600">{deal.yield_rate || 0}%</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Term Length</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <p className="text-2xl font-semibold text-slate-900">{deal.term_length_months || 0} mo</p>
          </div>
        </div>
        <div className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-colors shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Risk Rating</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${deal.risk_grade ? 'text-[#1B6FA5]' : 'text-slate-300'}`} />
            <p className={`text-2xl font-semibold ${deal.risk_grade ? 'text-slate-900' : 'text-slate-400'}`}>
              {deal.risk_grade || 'N/A'} <span className={`text-sm font-medium ${riskProps.colorClass}`}>({riskProps.label})</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- NEW: MY ISSUED OFFERS TRACKER --- */}
      {myTermSheets.length > 0 && (
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-[#1B6FA5]" /> Issued Offers Tracking
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded">
              {myTermSheets.length} Offer{myTermSheets.length !== 1 ? 's' : ''} Sent
            </span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {myTermSheets.map(ts => (
              <div key={ts.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${ts.status === 'accepted' ? 'bg-emerald-50/30' : 'bg-white'}`}>
                
                {/* Info Block */}
                <div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900 mb-1">
                    <span>{formatCurrency(ts.facility_amount)}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{ts.yield_rate}% Yield</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{ts.term_length_months} Mo.</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Issued to Borrower on {new Date(ts.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Status & Actions Block */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Dynamic Status Badge */}
                  {ts.status === 'accepted' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Executed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Awaiting Borrower Signature
                    </span>
                  )}
                  
                  {/* View Document Button */}
                  <button 
                    onClick={() => handleDownload(ts.id, ts.document_url, `TermSheet_${deal.company_name}.pdf`)}
                    disabled={downloadingDoc === ts.id || !ts.document_url}
                    className="p-2 text-slate-400 hover:text-[#1B6FA5] hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 disabled:opacity-50"
                    title="Download Document"
                  >
                    {downloadingDoc === ts.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS & MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-[#1B6FA5] border-b-2 border-[#1B6FA5]' : 'text-slate-400 hover:text-slate-900'}`}>Overview</button>
            <button onClick={() => setActiveTab('diligence')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'diligence' ? 'text-[#1B6FA5] border-b-2 border-[#1B6FA5]' : 'text-slate-400 hover:text-slate-900'}`}>Due Diligence</button>
            <button onClick={() => setActiveTab('discussion')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'discussion' ? 'text-[#1B6FA5] border-b-2 border-[#1B6FA5]' : 'text-slate-400 hover:text-slate-900'}`}>Discussion & Memos</button>
          </div>

          <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>}>
            {activeTab === 'overview' && <OverviewTab deal={deal} images={displayImages} openLightbox={() => {}} />}
            {activeTab === 'diligence' && <DiligenceTab deal={deal} />}
            {activeTab === 'discussion' && <DiscussionTab deal={deal} />}
          </Suspense>
        </div>

        <div className="lg:col-span-5">
          <Suspense fallback={<div className="h-96 bg-slate-50 rounded-3xl animate-pulse"></div>}>
            <DealExecutionPanel 
              deal={deal} 
              downloadedDocs={downloadedDocs} 
              downloadingDoc={downloadingDoc} 
              onDownload={(id, path) => handleDownload(id, path)} 
              currentUserId={userData?.id} 
            />
          </Suspense>
        </div>
      </div>

      {/* --- TERM SHEET MODAL OVERLAY --- */}
      {showTermSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <FileSignature className="w-5 h-5 text-[#21B0A6]" /> Issue Formal Term Sheet
                </h3>
                <p className="text-xs text-slate-500 mt-1">This offer will be transmitted securely to the borrower.</p>
              </div>
              <button 
                onClick={() => setShowTermSheetModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleIssueTermSheet} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Facility Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={termSheetData.facilityAmount} 
                      onChange={(e) => setTermSheetData({...termSheetData, facilityAmount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Yield Rate</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={termSheetData.yieldRate} 
                      onChange={(e) => setTermSheetData({...termSheetData, yieldRate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white" 
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Term Length (Months)</label>
                  <input 
                    type="number" 
                    required
                    value={termSheetData.termLength} 
                    onChange={(e) => setTermSheetData({...termSheetData, termLength: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Origination Fee (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      value={termSheetData.originationFee} 
                      onChange={(e) => setTermSheetData({...termSheetData, originationFee: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white" 
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Offer Expiration Date</label>
                <input 
                  type="date" 
                  required
                  value={termSheetData.expirationDate} 
                  onChange={(e) => setTermSheetData({...termSheetData, expirationDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Additional Stipulations (Optional)</label>
                <textarea 
                  rows={3}
                  value={termSheetData.notes} 
                  onChange={(e) => setTermSheetData({...termSheetData, notes: e.target.value})}
                  placeholder="e.g., Subject to final review of Q4 financials..."
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#21B0A6] focus:bg-white resize-none" 
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  Attach E-Signature (Required)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg"
                      onChange={handleSignatureUpload}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B6FA5]/10 file:text-[#1B6FA5] hover:file:bg-[#1B6FA5]/20 transition-colors cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Upload a transparent PNG or clean JPEG of your signature.</p>
                  </div>
                  {signatureImageBase64 && (
                    <div className="w-24 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img src={signatureImageBase64} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowTermSheetModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingTermSheet || !signatureImageBase64}
                  className="px-6 py-2.5 bg-[#1B6FA5] text-white text-sm font-bold rounded-xl hover:bg-[#155A8A] transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submittingTermSheet ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                  {submittingTermSheet ? 'Transmitting...' : 'Execute & Submit Offer'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};