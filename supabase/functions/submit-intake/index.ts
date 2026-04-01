import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { dealId, riskGrade } = await req.json();

    if (!dealId || !riskGrade) {
      throw new Error("Missing required parameters: dealId or riskGrade.");
    }

    // We MUST use the Service Role Key to bypass RLS and move data securely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. PULL FROM QUARANTINE
    const { data: preQual, error: fetchError } = await supabaseAdmin
      .from('pre_qualifications')
      .select('*')
      .eq('id', dealId)
      .single();

    if (fetchError || !preQual) throw new Error(`Could not find intake deal: ${fetchError?.message}`);

    // 2. INSERT INTO LIVE MARKETPLACE (loan_postings)
    // We keep headquarters and phone number safely stored in the deal description 
    // since they aren't in your main profiles table.
    const { data: liveDeal, error: insertError } = await supabaseAdmin
      .from('loan_postings')
      .insert({
        borrower_id: preQual.borrower_id,
        facility_amount: preQual.requested_amount,
        yield_rate: 12.0, 
        term_length_months: 12, 
        business_description: `Industry: ${preQual.industry} | Years in Business: ${preQual.years_in_business} | Annual Rev: $${preQual.annual_revenue} | HQ: ${preQual.headquarters} | Phone: ${preQual.phone_number}`,
        use_of_funds: preQual.use_of_funds,
        status: 'active',
        risk_grade: riskGrade,
        documents: preQual.document_paths 
      })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to create live deal: ${insertError.message}`);

    // 3. UPDATE PERMANENT BORROWER PROFILE
    // Mapped EXACTLY to your schema (converting numbers to text)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        company_name: preQual.company_name,
        industry: preQual.industry,
        revenue: preQual.annual_revenue.toString(), 
        loan_amount: preQual.requested_amount.toString(), 
        is_verified: true 
      })
      .eq('id', preQual.borrower_id);

    if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`);

    // 4. ARCHIVE THE QUARANTINED LEAD
    const { error: archiveError } = await supabaseAdmin
      .from('pre_qualifications')
      .update({ status: 'converted_to_deal' })
      .eq('id', dealId);

    if (archiveError) throw new Error(`Failed to archive intake form: ${archiveError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Deal successfully verified and migrated to the live marketplace.",
        newDealId: liveDeal.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Edge Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});