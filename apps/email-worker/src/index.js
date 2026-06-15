import { parseReceivedChain, parseAllHeaders } from './parser.js';
import { analyze, getSenderDomain, getSenderEmail, getDkimSelector } from './analyzer.js';
import { lookupAll } from './dns.js';
import { formatReport, getProblems } from './report.js';
import { formatReportHtml } from './report-html.js';

async function readRaw(stream) {
  return new Response(stream).text();
}

export default {
  async email(message, env, ctx) {
    let rawEmail;
    try {
      rawEmail = await readRaw(message.raw);
    } catch (err) {
      console.error('Failed to read raw email:', err);
      return;
    }

    const headers = parseAllHeaders(rawEmail);
    const hops = parseReceivedChain(rawEmail);
    const headerAnalysis = analyze(headers, hops);
    const domain = getSenderDomain(headers);
    const senderEmail = getSenderEmail(headers) || message.from;
    const dkimSelector = getDkimSelector(headers);

    let dns = { spf: { found: false }, dmarc: { found: false }, dkim: { found: false, selector: null }, mx: { found: false, records: [] } };
    if (domain) {
      try {
        dns = await lookupAll(domain, dkimSelector);
      } catch (err) {
        console.error('DNS lookup failed:', err);
      }
    }

    const reportDomain = domain || message.from;
    const { warns, fails } = getProblems({ dns, flags: headerAnalysis.flags });
    const plainBody = formatReport({ domain: reportDomain, headerAnalysis, dns });
    const htmlBody = formatReportHtml({ domain: reportDomain, headerAnalysis, dns });

    const subject = `Re: ${message.headers.get('subject') || 'Header Analysis Request'} — Deliverability report for ${reportDomain}`;

    // Send report to client (BCC yourself to keep a copy)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Flour City Labs <lab@flourcitylabs.com>',
          to: senderEmail,
          bcc: 'lab@flourcitylabs.com',
          subject,
          html: htmlBody,
          text: plainBody,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', res.status, err);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    }

    // Log lead to Supabase
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      try {
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/analyzer_leads`, {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            email: senderEmail,
            domain: reportDomain,
            spf_ok: dns.spf.found,
            dkim_ok: dns.dkim.found,
            dmarc_ok: dns.dmarc.found,
            mx_ok: dns.mx.found,
            issues_count: fails.length + warns.length,
            issues: [...fails, ...warns],
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          console.error('Supabase insert error:', res.status, err);
        }
      } catch (err) {
        console.error('Failed to log lead:', err);
      }
    }
  },
};
