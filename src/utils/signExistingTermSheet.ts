import { PDFDocument } from 'pdf-lib';
import { supabase } from '../lib/supabase';

export const addBorrowerSignature = async (documentPath: string, signatureBase64: string): Promise<string> => {
  try {
    // 1. Download the existing PDF the Lender signed
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(documentPath);
      
    if (downloadError) throw downloadError;

    const existingPdfBytes = await pdfData.arrayBuffer();

    // 2. Load the PDF into memory
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 

    // 3. Strip the "data:image/png;base64," prefix from the image string
    const base64Data = signatureBase64.split(',')[1];

    // 4. Embed the signature image
    let signatureImage;
    if (signatureBase64.includes('image/png')) {
      signatureImage = await pdfDoc.embedPng(base64Data);
    } else if (signatureBase64.includes('image/jpeg') || signatureBase64.includes('image/jpg')) {
      signatureImage = await pdfDoc.embedJpg(base64Data);
    } else {
      throw new Error("Unsupported image format. Please use PNG or JPEG.");
    }

    // 5. Stamp it onto the Borrower line!
    // Note: pdf-lib uses points (72 per inch) and bottom-left origin.
    // 4.5 inches from left = 324 points. 2 inches from bottom = 144 points.
    firstPage.drawImage(signatureImage, {
      x: 324, 
      y: 150, 
      width: 144, // 2 inches wide
      height: 36, // 0.5 inches tall
    });

    // 6. Save the newly signed PDF
    const pdfBytes = await pdfDoc.save();
    
    // Create a new filename for the fully executed version
    const newFileName = documentPath.replace('.pdf', '_EXECUTED.pdf');

    // 7. Upload the final version back to Supabase
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(newFileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    return newFileName;

  } catch (error) {
    console.error("Failed to stamp PDF:", error);
    throw error;
  }
};