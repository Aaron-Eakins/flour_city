// Supabase Edge Functions use Deno. We use '@ts-ignore' for the Deno global 
// if your local environment is not yet configured with the Deno extension.
// @ts-ignore: Deno is built-in to the Supabase runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// @ts-ignore: Deno is built-in to the Supabase runtime
const FCL_EMAIL = Deno.env.get('FCL_EMAIL') || "lab@flourcitylabs.com"

// Deno.serve is the modern way to handle HTTP in Edge Functions
// @ts-ignore: Deno is built-in to the Supabase runtime
Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const { record, table, type } = payload

    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignore non-insert' }), { status: 200 })
    }

    let emailContent = {
      to: FCL_EMAIL,
      subject: "",
      html: "",
      replyTo: ""
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
          
          <p style="font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 30px;">
            Professional technical review required within 24 hours.
          </p>
        </div>
      `

      // Also send confirmation to user
      await sendEmail({
        to: record.email,
        subject: "FCL LABS: Project Received.",
        html: `
          <div style="font-family: sans-serif; background: #F2F1EF; padding: 40px; color: #1A1B1E; border: 1px solid #D4A017;">
            <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #D4A017; padding-bottom: 20px;">Project Secured.</h1>
            <p style="font-size: 14px; line-height: 1.6;">Hello ${record.name}, your project has successfully entered the Flour City Labs pipeline.</p>
            <p style="font-size: 14px; line-height: 1.6;">A technician is currently reviewing your geometry and configuration for: <strong>${record.material}</strong>.</p>
            <p style="font-size: 14px; line-height: 1.6;">You will receive a formal technical quote via email within 24 hours.</p>
            <div style="margin-top: 30px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #D4A017;">
              FLOUR CITY LABS // ROCHESTER NY
            </div>
          </div>
        `
      })

    } else if (table === 'contacts') {
      emailContent.subject = `Lab Inquiry: New Message`
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
    }

    const res = await sendEmail(emailContent)
    return new Response(JSON.stringify(res), { status: 200 })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 })
  }
})

async function sendEmail({ to, subject, html, replyTo }: { to: any, subject: any, html: any, replyTo?: any }) {
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
      html
    })
  })
  return res.json()
}
