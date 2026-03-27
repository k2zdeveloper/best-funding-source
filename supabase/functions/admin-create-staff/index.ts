// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 1. CORS HEADERS: These tell the browser that your React app (localhost) 
// is allowed to talk to this specific backend function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 2. THE PREFLIGHT CHECK: Browsers send an 'OPTIONS' request first to check security.
  // If we don't return an 'ok' response here, you get the CORS red error in React.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. GET DATA: Grab the email, password, and role sent from your React form.
    const { email, password, role } = await req.json()

    // 4. ADMIN CLIENT: We initialize Supabase using the SERVICE_ROLE_KEY.
    // This is a "Master Key" that bypasses normal security rules, allowing 
    // an admin to create another account without that person having to verify their email first.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. CREATE AUTH USER: This adds the user to the Supabase Auth system.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirms so the new admin can log in immediately
    })

    if (authError) throw authError

    // 6. UPDATE PROFILE: This adds their specific role (admin or super_admin) 
    // to your custom 'profiles' table so the dashboard knows their permissions.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    // 7. ERROR HANDLING: If anything fails (e.g., email already exists), 
    // we send the error message back to React so you can show an alert.
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})