import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import EmailReplyParser from "npm:email-reply-parser"
import PostalMime from 'npm:postal-mime'

// @ts-ignore: Deno is built-in to the Supabase runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// @ts-ignore: Deno is built-in to the Supabase runtime
const FCL_EMAIL = Deno.env.get('FCL_EMAIL') || "lab@flourcitylabs.com"
// @ts-ignore: Deno is built-in to the Supabase runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
// @ts-ignore: Deno is built-in to the Supabase runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
// @ts-ignore: Deno is built-in to the Supabase runtime
const FCL_INBOUND_SECRET = Deno.env.get('FCL_INBOUND_SECRET')

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

// @ts-ignore: Deno is built-in to the Supabase runtime
Deno.serve(async (req: Request) => {
  // 1. Authorization Check (Shared Secret from Cloudflare)
  const authHeader = req.headers.get('Authorization')
  if (!FCL_INBOUND_SECRET || authHeader !== `Bearer ${FCL_INBOUND_SECRET}`) {
    console.error('Unauthorized request attempt: Invalid or missing FCL_INBOUND_SECRET.')
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await req.json()
    const { raw, from, to } = payload

    if (!raw) {
        throw new Error('No raw email data received')
    }

    // 2. Parse the Raw Email using PostalMime (Deno/NPM)
    const parser = new PostalMime()
    const email = await parser.parse(raw)
    
    // 3. Extract Quote ID from "To" address
    // Expected format: reply+QUOTE_ID@flourcitylabs.com
    const toAddress = to || email.to?.[0]?.address || ''
    const match = toAddress.match(/reply\+([^@]+)@/)
    const quoteId = match ? match[1] : null

    if (!quoteId) {
      console.error('Could not extract Quote ID from address:', toAddress)
      return new Response('No Quote ID found', { status: 200 })
    }

    // 4. Fetch Parent Quote
    // Note: We MUST fetch user_id so we can associate the note with the correct user for RLS
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select('id, name, email, last_resend_message_id, file_name, user_id')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      console.error('Error fetching quote:', quoteError?.message)
      return new Response('Quote not found', { status: 200 })
    }

    // 5. Parse and Clean Reply
    // Use EmailReplyParser to strip out the old thread/signature
    const parsed = new EmailReplyParser().read(email.text || email.html || '')
    const cleanReply = parsed.getFragments()
      .filter(f => !f.isHidden() && !f.isQuoted() && !f.isSignature())
      .map(f => f.getContent())
      .join('\n')
      .trim()

    if (!cleanReply) {
      console.log('Parsed reply is empty, skipping.')
      return new Response('Empty reply ignored', { status: 200 })
    }

    console.log(`Processing clean reply for Project: ${quote.name}`)

    // 6. Insert into Project Notes as 'lab'
    // Note: setting user_id ensures the partner can see the note in their dashboard (RLS)
    const { error: insertError } = await supabaseAdmin
      .from('project_notes')
      .insert({
        quote_id: quote.id,
        user_id: quote.user_id,
        content: cleanReply,
        author_role: 'lab'
      })

    if (insertError) {
      console.error('Error inserting note:', insertError.message)
      throw insertError
    }

    // 7. Threaded Forwarding to Client via Resend
    console.log(`Forwarding threaded reply to client: ${quote.email}`)
    const forwardRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `The Lab <lab@flourcitylabs.com>`,
        to: [quote.email],
        reply_to: `reply+${quote.id}@flourcitylabs.com`,
        subject: `Re: Your Quote for ${quote.file_name || 'Project'}`,
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${cleanReply}</p>
            <div style="margin-top: 30px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #D4A017;">
              FLOUR CITY LABS // ROCHESTER NY
            </div>
          </div>
        `,
        headers: {
          'In-Reply-To': email.messageId || quote.last_resend_message_id || undefined,
          'References': email.messageId || quote.last_resend_message_id || undefined
        }
      })
    })

    const forwardData = await forwardRes.json()
    console.log('Resend Forwarding Result:', JSON.stringify(forwardData, null, 2))

    // 8. Update last_resend_message_id with the NEW reply ID for future threading
    if (forwardData.id) {
       await supabaseAdmin
        .from('quotes')
        .update({ last_resend_message_id: forwardData.id })
        .eq('id', quote.id)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (err) {
    console.error('Fatal error in inbound-reply-bridge:', err)
    return new Response('Internal Error', { status: 500 })
  }
})
