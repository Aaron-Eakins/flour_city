import { parseReceivedChain, parseAllHeaders } from './parser.js';
import { analyze, getSenderDomain, getDkimSelector } from './analyzer.js';
import { lookupAll } from './dns.js';
import { formatReport } from './report.js';
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
    const plainBody = formatReport({ domain: reportDomain, headerAnalysis, dns });
    const htmlBody = formatReportHtml({ domain: reportDomain, headerAnalysis, dns });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Flour City Labs <lab@flourcitylabs.com>',
          to: message.from,
          subject: `Re: ${message.headers.get('subject') || 'Header Analysis Request'} — Deliverability Report`,
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
  },
};
