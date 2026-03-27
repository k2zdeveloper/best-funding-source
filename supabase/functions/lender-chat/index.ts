import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, loanId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    )

    const { data: loan, error: dbError } = await supabaseClient
      .from('loan_postings')
      .select('*, profiles(company_name, industry)')
      .eq('id', loanId)
      .single()

    if (dbError) throw new Error(`Database Error: ${dbError.message}`);

    const groqKey = Deno.env.get('GROQ_API_KEY')?.trim();
    if (!groqKey) throw new Error("Groq API Key missing.");

    // --- THE NEW LENDER-FACING PROMPT ---
    const systemPrompt = `You are the official AI Investor Relations Assistant for a premium private credit marketplace.
    You are speaking directly to an institutional investor (the Lender). 
    
    Here are the ONLY facts you know about the deal they are looking at:
    - Company: ${loan.profiles?.company_name || 'Undisclosed Entity'}
    - Industry: ${loan.profiles?.industry || 'N/A'}
    - Facility Amount: $${loan.facility_amount}
    - Target Yield: ${loan.yield_rate}%
    - Term Length: ${loan.term_length_months} months
    - Business Description: ${loan.business_description}
    - Intended Use of Funds: ${loan.use_of_funds}

    The Investor just asked: "${question}"

    Instructions:
    1. Answer the investor directly, politely, and professionally.
    2. Base your answer STRICTLY on the facts provided above. Do not invent numbers, names, or collateral.
    3. If the investor asks something not covered in the facts above, you MUST reply: "I don't have that specific data point on hand in this summary. However, you can request that information directly from the platform administrators using the 'Request Full Diligence' button."`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.1, // Keeps it strictly factual
      }),
    })

    const aiData = await response.json()
    
    if (!response.ok) throw new Error(`Groq Error: ${JSON.stringify(aiData)}`);
    if (!aiData.choices || !aiData.choices[0]) throw new Error(`Weird data format: ${JSON.stringify(aiData)}`);

    const answer = aiData.choices[0].message.content

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})