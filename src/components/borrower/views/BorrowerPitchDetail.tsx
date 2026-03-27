import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, FileText, MessageSquare, FileSignature, Loader2, Download, Building2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { addBorrowerSignature } from '../../../utils/signExistingTermSheet';

interface BorrowerPitchDetailProps {
  pitchId: string;
  userData: any;
  onBack: () => void;
}

export const BorrowerPitchDetail: React.FC<BorrowerPitchDetailProps> = ({ pitchId, userData, onBack }) => {
  const [deal, setDeal] = useState<any>(null);
  const [termSheets, setTermSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- MODAL & VALIDATION STATES ---
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedTermSheet, setSelectedTermSheet] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawPdfUrl, setRawPdfUrl] = useState<string | null>(null); // For the "open in new tab" link
  
  const [borrowerSignatureBase64, setBorrowerSignatureBase64] = useState<string | null>(null);
  const [legalConsent, setLegalConsent] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchDealAndOffers = async () => {
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('loan_postings')
        .select('*')
        .eq('id', pitchId)
        .single();

      if (dealError) throw dealError;
      setDeal(dealData);

      const { data: tsData, error: tsError } = await supabase
        .from('term_sheets')
        .select('*, profiles:lender_id(company_name)')
        .eq('loan_id', pitchId)
        .order('created_at', { ascending: false });

      if (tsError) throw tsError;
      setTermSheets(tsData || []);

    } catch (err) {
      console.error("Error fetching deal details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pitchId) fetchDealAndOffers();
  }, [pitchId]);

  const handleDownloadTermSheet = async (ts: any) => {
    if (!ts.document_url) return;
    setDownloadingId(ts.id);
    try {
      const { data, error } = await supabase.storage.from('documents').download(ts.document_url);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TermSheet_${ts.profiles?.company_name || 'Offer'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading term sheet:', error);
      alert('Failed to download the document.');
    } finally {
      setDownloadingId(null);
    }
  };

  // --- THE URL HACK ---
  const openSigningModal = async (ts: any) => {
    setSelectedTermSheet(ts);
    setBorrowerSignatureBase64(null);
    setLegalConsent(false);
    
    // Create the temporary URL
    const { data } = await supabase.storage.from('documents').createSignedUrl(ts.document_url, 3600);
    
    if (data?.signedUrl) {
      setRawPdfUrl(data.signedUrl);
      // Append the magic parameters to hide the toolbar and fit the page perfectly!
      setPreviewUrl(`${data.signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`);
    }
    
    setShowSignModal(true);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Validation Failed: File is too large. Signatures must be under 1MB.");
      e.target.value = ''; 
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        if (img.height >= img.width) {
          alert("Validation Failed: Invalid format. Signatures must be wider than they are tall (landscape orientation). Please do not upload photos.");
          setBorrowerSignatureBase64(null);
          e.target.value = ''; 
        } else {
          setBorrowerSignatureBase64(base64String);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAcceptOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerSignatureBase64 || !selectedTermSheet || !legalConsent) return;

    setIsAccepting(true);
    try {
      const executedPdfPath = await addBorrowerSignature(selectedTermSheet.document_url, borrowerSignatureBase64);

      const { data: updatedRow, error: updateError } = await supabase
        .from('term_sheets')
        .update({ status: 'accepted', document_url: executedPdfPath })
        .eq('id', selectedTermSheet.id)
        .select();

      if (updateError) throw updateError;
      if (!updatedRow || updatedRow.length === 0) throw new Error("Database security blocked the update.");

      await supabase.from('notifications').insert({
        user_id: selectedTermSheet.lender_id,
        title: 'Term Sheet Executed!',
        message: `The borrower has officially signed and accepted your term sheet. The fully executed PDF is ready for download.`,
        link: `/deal_detail/${deal.id}` 
      });

      alert("Term Sheet Fully Executed!");
      setShowSignModal(false);
      setBorrowerSignatureBase64(null);
      fetchDealAndOffers(); 

    } catch (error: any) {
      console.error("Error accepting offer:", error);
      alert(`Failed to accept offer: ${error.message}`);
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32"><Loader2 className="w-8 h-8 text-[#1B6FA5] animate-spin mb-4" /><p className="text-sm font-medium text-slate-500">Loading workspace...</p></div>
  );

  if (!deal) return null;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
  const fundingPercentage = deal.facility_amount > 0 ? (deal.funded_amount / deal.facility_amount) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(deal.facility_amount)} Facility
            </h1>
            {deal.status === 'pending_review' && <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-3 py-1 rounded-md border border-amber-200"><Clock className="w-3.5 h-3.5" /> Under Review</span>}
            {deal.status === 'active' && <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Live in Market</span>}
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Submitted on {new Date(deal.created_at).toLocaleDateString()}</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full md:w-72 shrink-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between text-xs font-bold mb-2"><span className="text-slate-500">Syndication Progress</span><span className={fundingPercentage > 0 ? "text-[#1B6FA5]" : "text-slate-400"}>{Math.floor(fundingPercentage)}%</span></div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-[#21B0A6] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div></div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest"><span>{formatCurrency(deal.funded_amount)}</span><span>{formatCurrency(deal.facility_amount)}</span></div>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* LEFT COLUMN: Docs & Pitch details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B6FA5]" /> Your Data Room
            </h3>
            <div className="space-y-3">
              {deal.documents && deal.documents.length > 0 ? (
                deal.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${doc.color}-100 text-${doc.color}-600`}><FileText className="w-4 h-4" /></div>
                      <div><p className="text-xs font-bold text-slate-900">{doc.title}</p><p className="text-[10px] text-slate-500 uppercase">{doc.meta}</p></div>
                    </div>
                  </div>
                ))
              ) : (<p className="text-xs text-slate-500 italic">No documents attached.</p>)}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interaction Hub */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TERM SHEETS SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><FileSignature className="w-5 h-5 text-[#21B0A6]" /> Received Term Sheets</h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${termSheets.length > 0 ? 'bg-[#1B6FA5]/10 text-[#1B6FA5]' : 'bg-slate-100 text-slate-500'}`}>{termSheets.length} Offers</span>
            </div>
            
            {termSheets.length > 0 ? (
              <div className="space-y-4">
                {termSheets.map((ts) => (
                  <div key={ts.id} className={`p-5 border rounded-xl transition-colors bg-white shadow-sm flex flex-col gap-4 ${ts.status === 'accepted' ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'}`}>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-slate-400" /><h4 className="text-sm font-bold text-slate-900">{ts.profiles?.company_name || 'Institutional Lender'}</h4></div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-2">
                          <span className="text-[#1B6FA5]">{formatCurrency(ts.facility_amount)}</span><span className="w-1 h-1 bg-slate-300 rounded-full"></span><span>{ts.yield_rate}% Yield</span><span className="w-1 h-1 bg-slate-300 rounded-full"></span><span>{ts.term_length_months} Mo. Term</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">Issued: {new Date(ts.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="shrink-0">
                        {ts.status === 'accepted' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Fully Executed</span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200"><AlertCircle className="w-3.5 h-3.5" /> Pending Your Signature</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                      <button onClick={() => handleDownloadTermSheet(ts)} disabled={downloadingId === ts.id || !ts.document_url} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {downloadingId === ts.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Review PDF
                      </button>

                      {ts.status !== 'accepted' && (
                        <button onClick={() => openSigningModal(ts)} className="px-5 py-2 bg-[#21B0A6] text-white text-xs font-bold rounded-lg hover:bg-[#1C968D] transition-colors shadow-sm flex items-center gap-2">
                          <FileSignature className="w-4 h-4" /> Review & Sign
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-3"><FileSignature className="w-5 h-5 text-slate-300" /></div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">Awaiting Offers</h4>
                <p className="text-xs text-slate-500 max-w-sm">When institutional lenders issue term sheets, they will appear here for your review.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- THE PAPER DESK MODAL --- */}
      {showSignModal && selectedTermSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          
          {/* We made the modal taller: 90vh */}
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white shrink-0 z-20">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <CheckCircle2 className="w-6 h-6 text-[#21B0A6]" /> Document Execution Workspace
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Review the binding document below before attaching your signature.</p>
              </div>
              <button onClick={() => setShowSignModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-200">
              
              {/* LEFT SIDE: The "Desk" */}
              <div className="flex-1 flex flex-col relative overflow-hidden border-r border-slate-300">
                
                {/* Tiny header bar for the open tab link */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-300 shrink-0 z-10 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Preview</h4>
                  <a href={rawPdfUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#1B6FA5] hover:text-[#155A8A] transition-colors uppercase">
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                  </a>
                </div>
                
                {/* The Scrolling Desk Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative flex justify-center">
                  {previewUrl ? (
                    /* The "Bond Paper" Container - 8.5 x 11 aspect ratio */
                    <div className="w-full max-w-[800px] bg-white shadow-2xl ring-1 ring-slate-900/5 aspect-[8.5/11] relative overflow-hidden my-auto shrink-0">
                      <iframe 
                        src={previewUrl} 
                        className="absolute inset-0 w-full h-full border-0 pointer-events-auto" 
                        title="Term Sheet PDF"
                        style={{ backgroundColor: 'white' }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: Action Panel */}
              <div className="w-full md:w-[400px] p-6 bg-white overflow-y-auto shrink-0 flex flex-col shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <FileSignature className="w-5 h-5 text-[#21B0A6]" /> Signature Attachment
                </h4>

                <form onSubmit={handleAcceptOffer} className="flex-1 flex flex-col">
                  
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                      Attach E-Signature
                    </label>
                    <div className="space-y-4">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg"
                        onChange={handleSignatureUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#21B0A6]/10 file:text-[#21B0A6] hover:file:bg-[#21B0A6]/20 transition-colors cursor-pointer"
                      />
                      {borrowerSignatureBase64 && (
                        <div className="w-full h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 overflow-hidden shadow-inner relative group">
                          <img src={borrowerSignatureBase64} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                          <div className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">Valid Format</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="legalConsent" 
                      checked={legalConsent}
                      onChange={(e) => setLegalConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#21B0A6] border-amber-300 rounded focus:ring-[#21B0A6] cursor-pointer"
                    />
                    <label htmlFor="legalConsent" className="text-xs text-amber-800 leading-relaxed cursor-pointer select-none">
                      <strong>Legal Affirmation:</strong> I have reviewed the document on the left. By checking this box and clicking "Sign & Accept", I intend to electronically execute this Term Sheet and agree to its stipulations. I affirm this uploaded image represents my legally binding signature.
                    </label>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={isAccepting || !borrowerSignatureBase64 || !legalConsent}
                      className="w-full py-3.5 bg-[#21B0A6] text-white text-sm font-bold rounded-xl hover:bg-[#1C968D] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSignature className="w-5 h-5" />}
                      {isAccepting ? 'Executing Document...' : 'Sign & Accept Offer'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowSignModal(false)}
                      className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};