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

// @ts-ignore: Deno is built-in to the Supabase runtime
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin')
  
  // Dynamic CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { record, table, type, turnstile_token } = payload

    // 1. Bot Verification (Turnstile)
    if (turnstile_token) {
      console.log('Verifying Turnstile token...')
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${TURNSTILE_SECRET_KEY}&response=${turnstile_token}`,
      })
      const turnstileData = await turnstileRes.json()
      
      if (!turnstileData.success) {
        console.error('Turnstile verification failed:', JSON.stringify(turnstileData))
        return new Response(JSON.stringify({ error: 'Security verification failed (Bot detected)' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      console.log('Turnstile verified successfully.')
    } else {
      // For now, keep it compatible with background webhooks by checking for token presence
      // If no token is provided and it's from a browser (has Origin), reject it
      if (origin && !TURNSTILE_SECRET_KEY?.startsWith('0x4AAAAAAA')) { // Skip check for test keys
        console.error('Missing Turnstile token from browser origin.')
        return new Response(JSON.stringify({ error: 'Security verification required' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
    }

    console.log('Incoming Payload:', JSON.stringify(payload, null, 2))

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignore non-insert' }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let emailContent = {
      to: FCL_EMAIL,
      subject: "",
      html: "",
      replyTo: "",
      headers: {} as Record<string, string>
    }

    if (table === 'quotes') {
      emailContent.subject = `Quote Request: ${record.name}`
      emailContent.replyTo = record.email
      emailContent.html = `
        <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
          <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #D4A017; padding-bottom: 20px;">Project Secured in Pipeline</h1>
          
          <div style="background: white; padding: 30px; border: 1px solid #ccc; margin-top: 20px;">
            <p><strong>Partner:</strong> ${record.name} (${record.email})</p>
            <p><strong>Material:</strong> ${record.material}</p>
            <p><strong>Colors:</strong> ${record.colors?.join(', ') || 'Standard'}</p>
            <p><strong>Intent:</strong> ${record.intent}</p>
            <p><strong>Visual Validation:</strong> ${record.visual_validation ? 'YES' : 'NO'}</p>
            <p><strong>Storage Path:</strong> ${record.file_path}</p>
          </div>

          <div style="background: white; padding: 20px; border: 1px solid #ccc; margin-top: 10px; font-size: 12px;">
            <p style="font-weight: bold; text-transform: uppercase; margin-bottom: 15px; color: #D4A017; border-bottom: 1px solid #eee; padding-bottom: 5px;">Advanced Technical Specs</p>
            <table style="width: 100%; text-align: left; font-size: 11px;">
              <tr><td style="color: #666;">Nozzle:</td><td>${record.nozzle || 'Standard'}</td></tr>
              <tr><td style="color: #666;">Core Infill:</td><td>${record.infill || 'Standard'}</td></tr>
              <tr><td style="color: #666;">Walls:</td><td>${record.walls || 'Standard'}</td></tr>
              <tr><td style="color: #666;">Speed:</td><td>${record.speed || 'Standard'}</td></tr>
              <tr><td style="color: #666;">Layer Height:</td><td>${record.layer_height || 'Standard'}</td></tr>
              <tr><td style="color: #666;">Scaffolding:</td><td>${record.supports || 'Standard'}</td></tr>
            </table>
          </div>
          
          <p style="font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 30px;">
            Professional technical review required within 24 hours.
          </p>
        </div>
      `

      // Send to Admin
      const res = await sendEmail(emailContent)
      console.log('Resend Response (Admin):', JSON.stringify(res, null, 2))
      
      if (res.error) {
        throw new Error(`Resend Admin Error: ${res.error.message || JSON.stringify(res.error)}`)
      }

      // Persist the message ID for threading
      if (res?.id) {
        await supabaseAdmin
          .from('quotes')
          .update({ last_resend_message_id: res.id })
          .eq('id', record.id)
      }

      // Also send confirmation to user
      const userRes = await sendEmail({
        to: record.email,
        subject: "Your quote request is in.",
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #D4A017; padding-bottom: 20px;">Got it.</h1>
            <p style="font-size: 14px; line-height: 1.6;">Hi ${record.name}, your file is in and I'll take a look within 24 hours.</p>
            <p style="font-size: 14px; line-height: 1.6;">I'll be reviewing your request for <strong>${record.material}</strong> and will follow up with a quote and timeline.</p>
            <p style="font-size: 14px; line-height: 1.6;">If you have questions in the meantime, reply to this email.</p>
            <div style="margin-top: 30px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #D4A017;">
              FLOUR CITY LABS // ROCHESTER NY
            </div>
          </div>
        `
      })
      console.log('Resend Response (User):', JSON.stringify(userRes, null, 2))

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })

    } else if (table === 'contacts') {
      emailContent.subject = `Lab Inquiry: ${record.name}`
      emailContent.replyTo = record.email
      emailContent.html = `
        <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
          <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #D4A017; padding-bottom: 20px;">Direct Inquiry Received</h1>
          <div style="background: white; padding: 30px; border: 1px solid #ccc; margin-top: 20px;">
            <p><strong>From:</strong> ${record.name} (${record.email})</p>
            <p><strong>Message:</strong></p>
            <p style="font-style: italic;">${record.message}</p>
          </div>
        </div>
      `
      const res = await sendEmail(emailContent)
      console.log('Resend Response (Contact):', JSON.stringify(res, null, 2))

      if (res.error) {
        throw new Error(`Resend Contact Error: ${res.error.message || JSON.stringify(res.error)}`)
      }

      return new Response(JSON.stringify(res), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })

    } else if (table === 'project_notes') {
      // 1. Fetch parent quote details
      const { data: quote, error: quoteError } = await supabaseAdmin
        .from('quotes')
        .select('name, email, last_resend_message_id')
        .eq('id', record.quote_id)
        .single()

      if (quoteError) {
        console.error('Database Error (Quotes):', quoteError.message)
        throw quoteError
      }

      if (!quote) {
        console.error('No quote found for ID:', record.quote_id)
        throw new Error('Associated project not found')
      }

      console.log('Found Parent Project:', quote.name)

      emailContent.subject = `Quote Request: ${quote.name}`
      emailContent.to = FCL_EMAIL
      emailContent.html = `
        <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
          <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #D4A017; padding-bottom: 20px;">New Project Note</h1>
          <div style="background: white; padding: 30px; border: 1px solid #ccc; margin-top: 20px;">
            <p><strong>Update from Partner:</strong> ${quote.name}</p>
            <p style="font-style: italic;">${record.content}</p>
          </div>
        </div>
      `
      
      if (quote.last_resend_message_id) {
        emailContent.headers = {
          'In-Reply-To': quote.last_resend_message_id,
          'References': quote.last_resend_message_id
        }
      }

      const res = await sendEmail(emailContent)
      console.log('Resend Response (Note):', JSON.stringify(res, null, 2))

      if (res.error) {
        throw new Error(`Resend Note Error: ${res.error.message || JSON.stringify(res.error)}`)
      }

      return new Response(JSON.stringify(res), { 
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
      from: `FCL Labs <${FCL_EMAIL}>`,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      html,
      headers: headers || undefined
    })
  })
  return res.json()
}
