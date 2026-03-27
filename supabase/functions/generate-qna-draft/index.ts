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
    if (!groqKey) throw new Error("Groq API Key is missing in Supabase Secrets.");

    const systemPrompt = `You are a professional credit analyst and platform admin for a private credit marketplace.
    A lender has asked a diligence question about a specific deal. 
    
    Here is the exact data from our database regarding this deal:
    - Company: ${loan.profiles?.company_name || 'Undisclosed'}
    - Industry: ${loan.profiles?.industry || 'N/A'}
    - Facility Amount: $${loan.facility_amount}
    - Target Yield: ${loan.yield_rate}%
    - Term Length: ${loan.term_length_months} months
    - Business Description: ${loan.business_description}
    - Intended Use of Funds: ${loan.use_of_funds}

    Lender Question: "${question}"

    Instructions:
    Draft a highly professional, concise, and factual answer based ONLY on the context above. Do not invent numbers. If the provided database context does not contain the answer, reply strictly with: "We are currently verifying this specific data point with the borrower's management team and will update this memo shortly."`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // <--- THE FIX IS RIGHT HERE
        messages: [{ role: 'system', content: systemPrompt }],
        
        temperature: 0.1,
      }),
    })

    const aiData = await response.json()
    
    console.log("HTTP Status from Groq:", response.status);
    console.log("Raw Response from Groq:", JSON.stringify(aiData));
    
    if (!response.ok) {
        throw new Error(`Groq Rejected Request: ${JSON.stringify(aiData)}`);
    }

    if (!aiData.choices || !aiData.choices[0]) {
        throw new Error(`Groq returned weird data format: ${JSON.stringify(aiData)}`);
    }

    const draftText = aiData.choices[0].message.content

    return new Response(JSON.stringify({ draftText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Function Crash:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})