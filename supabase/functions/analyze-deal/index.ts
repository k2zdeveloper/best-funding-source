import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// unpdf is designed specifically for Serverless/Edge environments
import { extractText, getDocumentProxy } from "npm:unpdf";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 1. Handle Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { dealId, documentPath } = await req.json();

    if (!dealId || !documentPath) {
      throw new Error("Missing dealId or documentPath");
    }

    // 2. Setup Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Download File from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents') 
      .download(documentPath);

    if (downloadError) throw new Error(`Storage Error: ${downloadError.message}`);

    // 4. Extract Text using unpdf (Edge-safe)
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Load the PDF into a document proxy
    const pdf = await getDocumentProxy(uint8Array);
    
    // Extract text and merge all pages into a single string automatically
    const { text: extractedText } = await extractText(pdf, { mergePages: true });

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("Could not extract meaningful text from PDF");
    }

   // 5. Query Groq
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const systemPrompt = `You are a professional commercial loan underwriter. Analyze the provided text from a financial document. 
    Return ONLY a JSON object with: grossRevenue (number), netIncome (number), totalLiabilities (number), dscr (number), riskGrade (A-D), riskLabel (string).`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Updated from llama3-70b-8192 to llama-3.3-70b-versatile
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: extractedText.substring(0, 30000) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!groqResponse.ok) throw new Error(`Groq API Error: ${await groqResponse.text()}`);

    const groqData = await groqResponse.json();
    const result = JSON.parse(groqData.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});