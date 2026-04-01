import React, { useState, useEffect } from 'react';
import { BrainCircuit, FileText, Loader2, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Activity, DollarSign, XCircle } from 'lucide-react';
// IMPORTANT: Update this import path to match where your Supabase client is initialized in your project
import { supabase } from '../../../lib/supabase'; 

interface AIUnderwritingPanelProps {
  dealId?: string;
  documentName?: string;
  documentPath?: string; // Added to locate the file in Supabase Storage
}

export const AIUnderwritingPanel: React.FC<AIUnderwritingPanelProps> = ({ 
  dealId = "demo-deal", 
  documentName = "2024_Corporate_Tax_Returns.pdf",
  documentPath = ""
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  
  // State to hold the real data returned from your Groq Edge Function
  const [extractedData, setExtractedData] = useState<{
    grossRevenue: number;
    netIncome: number;
    totalLiabilities: number;
    dscr: number;
    riskGrade: string;
    riskLabel: string;
  } | null>(null);

  // LOG 1: Check what props are actually arriving at this component
  useEffect(() => {
    console.log("AI Underwriting Panel Mounted/Updated.", {
      receivedDealId: dealId,
      receivedDocumentName: documentName,
      receivedDocumentPath: documentPath
    });
  }, [dealId, documentName, documentPath]);

  // The Real Async Call to your Edge Function
  // The Real Async Call to your Edge Function
  const runAIScan = async () => {
    // 1. Check if the path is missing or just an empty string
    if (!documentPath || documentPath.trim() === "") {
      
      // 2. Build a highly detailed error message for the UI
      const debugInfo = `Missing document path! 
        Deal ID received: "${dealId}"
        Doc Name received: "${documentName}"
        Path received: "${documentPath === "" ? "EMPTY STRING" : documentPath}"`;
        
      setScanMessage(debugInfo);
      setScanState('error');
      return;
    }

    setScanState('scanning');
    setScanProgress(15);
    setScanMessage('Initializing secure connection to backend...');

    try {
      setScanProgress(40);
      setScanMessage('Extracting document text and querying Groq API...');
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-deal', {
        body: { 
          dealId: dealId,
          documentPath: documentPath 
        }
      });

      if (error) throw error;

      setScanProgress(90);
      setScanMessage('Structuring and formatting financial data...');

      // Small UI delay to make the transition smooth
      await new Promise(res => setTimeout(res, 600)); 

      setExtractedData(data);
      setScanProgress(100);
      setScanState('complete');

    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      // Also make sure backend errors are detailed in the UI
      setScanMessage(`Backend Error: ${err.message || 'Unknown error occurred.'}`);
      setScanState('error');
    }
  };

  // Ensure formatCurrency gracefully handles undefined values while loading/failing
  const formatCurrency = (val?: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(val || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" /> AI Underwriting Engine
          </h3>
          <p className="text-xs text-slate-500 mt-1">Automated PDF extraction and risk modeling.</p>
        </div>
        {scanState === 'complete' && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Extraction Complete
          </span>
        )}
      </div>

      <div className="p-6 md:p-8">
        
        {/* The Document Being Targeted */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{documentName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Target Document</p>
            </div>
          </div>

          {(scanState === 'idle' || scanState === 'error') && (
            <button 
              onClick={runAIScan}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" /> {scanState === 'error' ? 'Retry AI Analysis' : 'Run AI Analysis'}
            </button>
          )}
        </div>

        {/* Scanning Animation State */}
        {scanState === 'scanning' && (
          <div className="py-8 animate-in fade-in flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#8B5CF6] rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center relative shadow-sm">
                <BrainCircuit className="w-8 h-8 text-[#8B5CF6] animate-pulse" />
              </div>
            </div>
            
            <h4 className="text-sm font-bold text-slate-900 mb-2">{scanMessage}</h4>
            
            <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-[#8B5CF6] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{scanProgress}%</p>
          </div>
        )}

        {/* Error State */}
        {scanState === 'error' && (
          <div className="py-8 animate-in fade-in flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Analysis Interrupted</h4>
            {/* Added whitespace-pre-wrap here so our detailed error formats nicely */}
            <p className="text-xs text-slate-500 max-w-md whitespace-pre-wrap">{scanMessage}</p>
          </div>
        )}

        {/* Completed State (The Reveal) */}
        {scanState === 'complete' && extractedData && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
            
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Extracted Financial Data</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(extractedData.grossRevenue)}</p>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Income</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(extractedData.netIncome)}</p>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Liabilities</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(extractedData.totalLiabilities)}</p>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-slate-900/20">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Calculated DSCR</h4>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white">{extractedData.dscr}x</span>
                  <span className={`text-xs font-medium mb-1 ${extractedData.dscr >= 1.25 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {extractedData.dscr >= 1.25 ? 'Strong Coverage' : 'Review Required'}
                  </span>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-700 hidden md:block"></div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Risk Grade</h4>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <div>
                    <span className="text-2xl font-black text-white">{extractedData.riskGrade}</span>
                    <span className="text-sm font-bold text-slate-300 ml-2">({extractedData.riskLabel})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setScanState('idle');
                  setExtractedData(null);
                }}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => {
                  // TODO: Add logic to save to the deals table in Supabase
                  alert('Data ready to save to database!');
                }}
                className="px-6 py-2.5 bg-[#1B6FA5] hover:bg-[#155A8A] text-white text-sm font-bold rounded-xl transition-colors shadow-md"
              >
                Save Metrics to Database
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};