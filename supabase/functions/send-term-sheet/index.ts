// supabase/functions/send-term-sheet/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers so your React app can talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pdfUrl, borrowerEmail, borrowerName, lenderEmail, lenderName, dealId } = await req.json()

    // Grab your secret API key from Supabase environment variables
    const DROPBOX_SIGN_API_KEY = Deno.env.get('DROPBOX_SIGN_API_KEY')

    // Prepare the payload for the Dropbox Sign API
    const formData = new FormData();
    formData.append('title', `Official Term Sheet - Facility ${dealId}`);
    formData.append('subject', 'Signature Required: Formal Term Sheet');
    formData.append('message', 'Please review and sign the attached formal term sheet to begin the exclusivity and underwriting period.');
    
    // We are passing the URL of the PDF we just generated and saved in Supabase
    formData.append('file_url[0]', pdfUrl); 
    
    // Signer 1: The Lender (They issue it, they sign first)
    formData.append('signers[0][email_address]', lenderEmail);
    formData.append('signers[0][name]', lenderName);
    formData.append('signers[0][order]', '0'); // Signs first

    // Signer 2: The Borrower (They review it, they sign second)
    formData.append('signers[1][email_address]', borrowerEmail);
    formData.append('signers[1][name]', borrowerName);
    formData.append('signers[1][order]', '1'); // Signs second

    // Enable Test Mode (Sandbox) - 1 means true, you won't be charged!
    formData.append('test_mode', '1');

    // Call the Dropbox Sign (HelloSign) API
    const response = await fetch('https://api.hellosign.com/v3/signature_request/send', {
      method: 'POST',
      headers: {
        // Base64 encode the API key for Basic Auth (Standard for Dropbox Sign)
        'Authorization': `Basic ${btoa(DROPBOX_SIGN_API_KEY + ':')}`,
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Dropbox Sign API Error: ${result.error.error_msg}`);
    }

    // Success! Return the signature request ID
    return new Response(
      JSON.stringify({ success: true, signatureRequestId: result.signature_request.signature_request_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})