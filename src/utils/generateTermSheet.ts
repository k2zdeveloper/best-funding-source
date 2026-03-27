import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';

interface TermSheetParams {
  dealId: string;
  borrowerName: string;
  lenderName: string;
  facilityAmount: string;
  yieldRate: string;
  termLength: string;
  originationFee: string;
  expirationDate: string;
  notes: string;
  lenderSignatureBase64?: string; // <-- NEW: The signature image data
}

export const generateAndUploadTermSheet = async (params: TermSheetParams): Promise<string> => {
  const doc = new jsPDF({ format: 'letter', unit: 'in' });

  const margin = 1;
  let cursorY = margin;

  // --- HEADER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(27, 111, 165); 
  doc.text("OFFICIAL TERM SHEET", margin, cursorY);
  
  cursorY += 0.4;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, cursorY);
  doc.text(`Reference ID: ${params.dealId}`, 4.5, cursorY);

  cursorY += 0.5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, cursorY, 7.5, cursorY); 

  // --- PARTIES ---
  cursorY += 0.5;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  doc.setFont("helvetica", "bold");
  doc.text("LENDER (ISSUER):", margin, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(params.lenderName, margin, cursorY + 0.2);

  doc.setFont("helvetica", "bold");
  doc.text("BORROWER:", 4.5, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(params.borrowerName, 4.5, cursorY + 0.2);

  // --- CORE TERMS ---
  cursorY += 0.8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 111, 165);
  doc.text("1. SUMMARY OF TERMS", margin, cursorY);

  cursorY += 0.3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const terms = [
    `Facility Amount:  $${params.facilityAmount}`,
    `Interest Rate (Yield):  ${params.yieldRate}% per annum`,
    `Term Length:  ${params.termLength} Months`,
    `Origination Fee:  ${params.originationFee}% (Deducted at closing)`,
    `Offer Expiration:  ${params.expirationDate}`
  ];

  terms.forEach(term => {
    cursorY += 0.3;
    doc.text(term, margin + 0.2, cursorY);
  });

  // --- STIPULATIONS & NOTES ---
  if (params.notes) {
    cursorY += 0.6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(27, 111, 165);
    doc.text("2. CONDITIONS PRECEDENT", margin, cursorY);

    cursorY += 0.3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    const splitNotes = doc.splitTextToSize(params.notes, 6.5);
    doc.text(splitNotes, margin, cursorY);
    cursorY += (splitNotes.length * 0.2);
  }

  // --- LEGAL DISCLAIMER ---
  cursorY += 0.8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const disclaimer = "This Term Sheet represents an indication of interest and is not a legally binding commitment to lend. It is subject to final due diligence, credit committee approval, and the execution of definitive loan documentation. By signing below, the Borrower agrees to a 45-day exclusivity period to finalize underwriting.";
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 6.5);
  doc.text(splitDisclaimer, margin, cursorY);

  // --- SIGNATURE BLOCK ---
  cursorY = 9.0; 
  
  // NEW: STAMP THE SIGNATURE IMAGE IF IT EXISTS
  if (params.lenderSignatureBase64) {
    try {
      // Determines image type based on base64 string header
      const imageType = params.lenderSignatureBase64.includes('jpeg') || params.lenderSignatureBase64.includes('jpg') ? 'JPEG' : 'PNG';
      // X, Y, Width, Height (Stamps it right above the line)
      doc.addImage(params.lenderSignatureBase64, imageType, margin, cursorY - 0.6, 2, 0.5);
    } catch (e) {
      console.error("Failed to embed signature image:", e);
    }
  }

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, cursorY, margin + 2.5, cursorY);
  doc.text("Authorized Lender Signature", margin, cursorY + 0.2);

  doc.line(4.5, cursorY, 7.0, cursorY);
  doc.text("Authorized Borrower Signature", 4.5, cursorY + 0.2);

  // Output and Upload
  const pdfBlob = doc.output('blob');
  const fileName = `term_sheets/TS_${params.dealId}_${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('documents') 
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) throw error;
  return data.path; 
};