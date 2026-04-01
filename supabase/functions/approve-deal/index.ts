// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// 1. We MUST set up CORS headers so your React app is allowed to talk to this Edge Function securely
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. Handle the CORS Preflight request from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. Extract the payload sent from AdminIntakeQueue.tsx
    const { intakeId, borrowerId, riskGrade } = await req.json()

    // 4. Initialize a secure connection to your Supabase database
    // We pass the Authorization header from the request so this function acts with your Admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 5. FETCH: Grab the financial details from the original Intake Form
    const { data: intakeData, error: fetchError } = await supabaseClient
      .from('pre_qualifications')
      .select('annual_revenue, industry, requested_amount')
      .eq('id', intakeId)
      .single()

    if (fetchError) throw new Error(`Failed to fetch intake: ${fetchError.message}`)

    // 6. UPDATE PROFILE: Copy the data to the permanent user profile
    // Note: Converting the numbers to strings because your profiles table expects text!
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        revenue: intakeData.annual_revenue.toString(), 
        industry: intakeData.industry, 
        loan_amount: intakeData.requested_amount.toString() 
      })
      .eq('id', borrowerId)

    if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`)

    // 7. UPDATE QUEUE: Close out the intake ticket and push it live!
    const { error: preQualError } = await supabaseClient
      .from('pre_qualifications')
      .update({ 
        status: 'active', 
        risk_grade: riskGrade 
      })
      .eq('id', intakeId)

    if (preQualError) throw new Error(`Failed to update queue: ${preQualError.message}`)

    // 8. Send a success signal back to the React app
    return new Response(
      JSON.stringify({ success: true, message: 'Deal successfully approved and listed!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    // If anything fails in steps 5, 6, or 7, it falls down here and alerts the admin UI safely
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})