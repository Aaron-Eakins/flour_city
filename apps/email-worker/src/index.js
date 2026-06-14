import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';
import { parseReceivedChain, parseAllHeaders } from './parser.js';
import { analyze, getSenderDomain, getDkimSelector } from './analyzer.js';
import { lookupAll } from './dns.js';
import { formatReport } from './report.js';
import { formatReportHtml } from './report-html.js';

async function readRaw(stream) {
  return new Response(stream).text();
}

function buildReply({ to, subject, plainBody, htmlBody }) {
  const msg = createMimeMessage();
  msg.setSender({ name: 'Flour City Labs', addr: 'analyze@flourcitylabs.com' });
  msg.setRecipient(to);
  msg.setSubject(subject);
  msg.addMessage({ contentType: 'text/plain', data: plainBody });
  msg.addMessage({ contentType: 'text/html', data: htmlBody });
  return msg;
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

    const reply = buildReply({
      to: message.from,
      subject: `Re: ${message.headers.get('subject') || 'Header Analysis Request'} — Deliverability Report`,
      plainBody,
      htmlBody,
    });

    try {
      const replyMessage = new EmailMessage(
        'analyze@flourcitylabs.com',
        message.from,
        reply.asRaw(),
      );
      await env.REPLY_SENDER.send(replyMessage);
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  },
};
