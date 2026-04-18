import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore: Deno is built-in to the Supabase runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// @ts-ignore: Deno is built-in to the Supabase runtime
const FCL_EMAIL = Deno.env.get('FCL_EMAIL') || "lab@flourcitylabs.com"
// @ts-ignore: Deno is built-in to the Supabase runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
// @ts-ignore: Deno is built-in to the Supabase runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const ALLOWED_ORIGINS = ['https://flourcitylabs.com', 'http://localhost:5173']
const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

/**
 * Basic HTML escaping to prevent injection in email templates.
 */
function sanitizeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// @ts-ignore: Deno is built-in to the Supabase runtime
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin')
  const authHeader = req.headers.get('Authorization')
  
  // Dynamic CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { record, table, type, turnstile_token } = payload

    // 1. Verify Authentication / Bridge Secret
    const hasBridgeSecret = authHeader?.includes(Deno.env.get('FCL_INBOUND_SECRET') || 'NONE')
    let isUserAuthenticated = false;

    // Cryptographically verify the user using getUser()
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (user && !authError) {
            isUserAuthenticated = true;
            console.log(`Authenticated user: ${user.email}`);
        }
    }

    // 2. Security Logic
    if (!isUserAuthenticated && !hasBridgeSecret) {
        if (!turnstile_token) {
            console.error('Security violation: No auth and no turnstile token.')
            return new Response(JSON.stringify({ error: 'Security verification required' }), { 
                status: 403, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            })
        }

        console.log('Verifying Turnstile token...')
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${TURNSTILE_SECRET_KEY}&response=${turnstile_token}`,
        })
        const turnstileData = await turnstileRes.json()
        
        if (!turnstileData.success) {
            console.error('Turnstile verification failed:', JSON.stringify(turnstileData))
            return new Response(JSON.stringify({ error: 'Security verification failed' }), { 
                status: 403, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            })
        }
    }

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignore non-insert' }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (table === 'quotes') {
      console.log(`Processing Quote for: ${record.name}`)
      
      const sName = sanitizeHtml(record.name);
      const sEmail = sanitizeHtml(record.email);
      const sFileName = sanitizeHtml(record.file_name || 'Project');
      const sMaterial = sanitizeHtml(record.material);
      const sIntent = sanitizeHtml(record.intent);
      const sAddress = sanitizeHtml(record.shipping_address);
      const sCity = sanitizeHtml(record.city);
      const sState = sanitizeHtml(record.state);
      const sZip = sanitizeHtml(record.zip);

      const unifiedSubject = `Project Inquiry: ${sName}`;

      // 1. Auto-Reply to Customer (Sent first to establish thread)
      const customerEmailResult = await sendEmail({
        to: record.email,
        replyTo: FCL_EMAIL,
        subject: unifiedSubject,
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <p>Hi ${sName},</p>
            <p>Your file (<strong>${sFileName}</strong>) is in. I'll take a look at the technical details and follow up with a quote and timeline within 24 hours.</p>
            <p style="margin-top: 30px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #D4A017;">
              FLOUR CITY LABS // ROCHESTER NY
            </p>
          </div>
        `
      })

      // Extract Resend ID for threading
      const threadId = customerEmailResult?.id;
      const threadHeaders = threadId ? {
        'In-Reply-To': `<${threadId}@resend.dev>`,
        'References': `<${threadId}@resend.dev>`
      } : {};

      // 2. Lead Alert to Admin (Threaded to customer email)
      await sendEmail({
        to: FCL_EMAIL,
        replyTo: record.email,
        subject: unifiedSubject,
        headers: threadHeaders,
        html: `
          <div style="font-family: sans-serif; color: #1A1B1E; line-height: 1.6;">
            <p><strong>Project Inquiry:</strong> ${sName}</p>
            <p>
              <strong>Partner:</strong> ${sName} (${sEmail})<br />
              <strong>Project:</strong> ${sFileName}<br />
              <strong>Material:</strong> ${sMaterial}
            </p>
            <p><strong>Intent:</strong> ${sIntent}</p>
            <p style="font-size: 11px; color: #666; margin-top: 20px; border-top: 1px solid #eee; pt-10;">
              <strong>Shipping Destination:</strong><br />
              ${sAddress}<br />
              ${sCity}, ${sState} ${sZip}
            </p>
          </div>
        `
      })

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })

    } else if (table === 'contacts') {
      const sName = sanitizeHtml(record.name);
      const sMessage = sanitizeHtml(record.message);

      await sendEmail({
        to: FCL_EMAIL,
        replyTo: record.email,
        subject: `Lab Inquiry: ${sName}`,
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <p><strong>New message from:</strong> ${sName}</p>
            <div style="background: white; padding: 20px; border: 1px solid #ccc; margin-top: 20px; font-style: italic;">
              "${sMessage}"
            </div>
          </div>
        `
      })

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })

    } else if (table === 'project_notes') {
      const { data: quote, error: quoteError } = await supabaseAdmin
        .from('quotes')
        .select('name, email')
        .eq('id', record.quote_id)
        .single()

      if (quoteError) throw quoteError

      const sName = sanitizeHtml(quote.name);
      const sContent = sanitizeHtml(record.content);

      await sendEmail({
        to: FCL_EMAIL,
        replyTo: quote.email,
        subject: `Project Update: ${sName}`,
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <p><strong>Update on ${sName}:</strong></p>
            <div style="background: white; padding: 20px; border: 1px solid #ccc; margin-top: 20px; font-style: italic;">
              "${sContent}"
            </div>
          </div>
        `
      })

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    return new Response(JSON.stringify({ message: 'Unhandled Table' }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Fatal Function Error:', errorMsg)
    return new Response(JSON.stringify({ error: errorMsg }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})

async function sendEmail({ to, subject, html, replyTo, headers }: { to: any, subject: any, html: any, replyTo?: any, headers?: Record<string, string> }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: `The Lab <${FCL_EMAIL}>`,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      html,
      headers: headers || undefined
    })
  })
  return res.json()
}
