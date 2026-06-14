// HTML email report — all styles inline, table-based layout for Outlook compat
import { getProblems } from './report.js';

const DARK = '#1A1B1E';
const GOLD = '#D4A017';
const PASS_BG = '#f0fdf4';
const PASS_TEXT = '#166534';
const FAIL_BG = '#fef2f2';
const FAIL_TEXT = '#991b1b';
const WARN_BG = '#fffbeb';
const WARN_TEXT = '#92400e';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';

const TIER = {
  pass: { bg: PASS_BG, color: PASS_TEXT, badge: '#dcfce7', icon: '✓', word: 'PASS' },
  fail: { bg: FAIL_BG, color: FAIL_TEXT, badge: '#fee2e2', icon: '✗', word: 'FAIL' },
  warn: { bg: WARN_BG, color: WARN_TEXT, badge: '#fef3c7', icon: '⚠', word: 'WARN' },
  info: { bg: '#f8fafc', color: MUTED, badge: '#f1f5f9', icon: '·', word: 'INFO' },
};

function row({ label, status, detail, summary, subtext }) {
  const cfg = TIER[status] || TIER.info;
  return `
<tr>
  <td style="padding:14px 16px;background:${cfg.bg};border-bottom:1px solid ${BORDER}">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;vertical-align:top">
          <span style="display:inline-block;background:${cfg.badge};color:${cfg.color};font-size:13px;font-weight:700;width:28px;height:28px;line-height:28px;text-align:center;border-radius:4px">${cfg.icon}</span>
        </td>
        <td style="padding-left:10px;vertical-align:top">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:13px;font-weight:700;color:${DARK}">${label}</span>${detail ? `<span style="font-size:12px;color:${MUTED};margin-left:8px">${detail}</span>` : ''}</td>
            <td style="text-align:right;white-space:nowrap;padding-left:8px"><span style="font-size:10px;font-weight:700;letter-spacing:1px;color:${cfg.color}">${cfg.word}</span></td>
          </tr></table>
          ${summary ? `<div style="margin-top:5px;font-size:13px;color:#374151;line-height:1.5">${summary}</div>` : ''}
          ${subtext ? `<div style="margin-top:6px;padding:7px 9px;background:#f8fafc;border:1px solid ${BORDER};border-radius:4px;font-family:monospace;font-size:11px;color:#374151;word-break:break-all">${subtext}</div>` : ''}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function section(title, intro, rows) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid ${BORDER};border-radius:6px;overflow:hidden">
  <tr>
    <td style="padding:10px 16px;background:#f8fafc;border-bottom:1px solid ${BORDER}">
      <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:${MUTED};text-transform:uppercase">${title}</span>
      ${intro ? `<div style="margin-top:5px;font-size:12px;color:${MUTED};line-height:1.5">${intro}</div>` : ''}
    </td>
  </tr>
  ${rows.join('')}
</table>`;
}

export function formatReportHtml({ domain, headerAnalysis, dns }) {
  const { authResults, hopDeltas, flags } = headerAnalysis;
  const auth = authResults[0] || {};
  const { warns, fails } = getProblems({ dns, flags });

  // ── Header auth rows ──────────────────────────────────────────────
  const authRows = [];

  if (auth.spf) {
    const ok = auth.spf.result === 'pass';
    const sf = auth.spf.result === 'softfail';
    authRows.push(row({
      label: 'SPF',
      status: ok ? 'pass' : sf ? 'warn' : 'fail',
      detail: auth.spf.result,
      summary: ok
        ? 'Looks good. Your message came from a sender your domain has approved.'
        : 'Needs attention. The message came from a sender your domain hasn\'t approved, which makes it easy for others to impersonate you and more likely your real mail gets flagged. This is fixable.',
      subtext: auth.spf.detail || null,
    }));
  } else {
    authRows.push(row({ label: 'SPF', status: 'info', detail: 'not reported in headers', summary: null, subtext: null }));
  }

  if (auth.dkim && auth.dkim.length > 0) {
    for (const d of auth.dkim) {
      const ok = d.result === 'pass';
      authRows.push(row({
        label: 'DKIM',
        status: ok ? 'pass' : 'fail',
        detail: d.result,
        summary: ok
          ? 'Looks good. Your message carried a valid digital signature, proving it wasn\'t altered on the way.'
          : 'Needs attention. Your message wasn\'t signed, so receiving servers can\'t confirm it\'s genuinely from you.',
        subtext: d.domain ? `signed by ${d.domain}` : null,
      }));
    }
  } else {
    authRows.push(row({
      label: 'DKIM',
      status: 'warn',
      detail: 'no signature found',
      summary: 'Needs attention. Your message wasn\'t signed, so receiving servers can\'t confirm it\'s genuinely from you.',
      subtext: null,
    }));
  }

  if (auth.dmarc) {
    const ok = auth.dmarc.result === 'pass';
    authRows.push(row({
      label: 'DMARC',
      status: ok ? 'pass' : 'fail',
      detail: auth.dmarc.result,
      summary: ok
        ? 'Looks good. You\'ve given other mail servers clear instructions for handling messages that fail these checks.'
        : 'Needs attention. There\'s no policy telling other servers what to do with suspicious mail claiming to be from you.',
      subtext: auth.dmarc.policy ? `policy: ${auth.dmarc.policy}` : null,
    }));
  } else {
    authRows.push(row({ label: 'DMARC', status: 'info', detail: 'not reported in headers', summary: null, subtext: null }));
  }

  // ── DNS record rows ───────────────────────────────────────────────
  const dnsRows = [];

  // SPF
  if (dns.spf.found) {
    dnsRows.push(row({
      label: 'SPF record',
      status: 'pass',
      detail: null,
      summary: 'Looks good. Your list of approved senders is published and readable.',
      subtext: dns.spf.record,
    }));
  } else {
    dnsRows.push(row({
      label: 'SPF record',
      status: 'fail',
      detail: `missing at ${domain}`,
      summary: 'Needs attention. Without a published list of approved senders, anyone can attempt to send mail as your domain. This is one of the more important things to fix.',
      subtext: `Fix: add TXT record → v=spf1 include:_spf.google.com ~all`,
    }));
  }

  // DKIM
  if (dns.dkim.found) {
    dnsRows.push(row({
      label: 'DKIM key',
      status: 'pass',
      detail: dns.dkim.selector ? `selector: ${dns.dkim.selector}` : null,
      summary: 'Looks good. Your signing key is published, so receivers can verify your signature.',
      subtext: dns.dkim.record ? dns.dkim.record.slice(0, 60) + '…' : null,
    }));
  } else if (!dns.dkim.selector) {
    dnsRows.push(row({
      label: 'DKIM key',
      status: 'info',
      detail: null,
      summary: 'Couldn\'t check — no DKIM-Signature header found in this email.',
      subtext: null,
    }));
  } else {
    dnsRows.push(row({
      label: 'DKIM key',
      status: 'fail',
      detail: `missing at ${dns.dkim.selector}._domainkey.${domain}`,
      summary: 'Needs attention. The public key for your DKIM signature isn\'t published where it should be.',
      subtext: null,
    }));
  }

  // DMARC
  if (dns.dmarc.found) {
    const policy = dns.dmarc.policy;
    const strong = policy === 'reject' || policy === 'quarantine';
    const inheritedNote = dns.dmarc.orgDomain ? ` Inherited from parent domain ${dns.dmarc.orgDomain}.` : '';
    dnsRows.push(row({
      label: 'DMARC record',
      status: strong ? 'pass' : 'warn',
      detail: dns.dmarc.orgDomain ? `inherited from ${dns.dmarc.orgDomain}` : null,
      summary: strong
        ? `Looks good. Your policy is actively protecting against mail that fails these checks.${inheritedNote}`
        : 'Worth fixing eventually. You\'re watching what happens to failed messages but not stopping them yet. That\'s a safe, normal starting point. When you\'re ready, tightening this to "quarantine" or "reject" turns monitoring into real protection. No rush.',
      subtext: dns.dmarc.record,
    }));
  } else {
    dnsRows.push(row({
      label: 'DMARC record',
      status: 'warn',
      detail: `missing at _dmarc.${dns.dmarc.foundAt || domain}`,
      summary: 'Worth noting. Without a DMARC record, there\'s no policy telling servers what to do with suspicious mail claiming to be from you. Less urgent than SPF or DKIM, but worth adding.',
      subtext: `Fix: add TXT record → v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
    }));
  }

  // MX
  if (dns.mx.found) {
    dnsRows.push(row({
      label: 'MX records',
      status: 'pass',
      detail: `${dns.mx.records.length} found`,
      summary: 'Looks good. The servers that receive your mail are published and responding.',
      subtext: dns.mx.records.join('<br>'),
    }));
  } else {
    dnsRows.push(row({
      label: 'MX records',
      status: 'fail',
      detail: `none found for ${domain}`,
      summary: 'Needs attention. Without MX records, other servers don\'t know where to deliver email for your domain.',
      subtext: null,
    }));
  }

  // ── Flags ─────────────────────────────────────────────────────────
  const flagRows = flags.map(f => {
    const isFail = /hard fail|dkim.*fail|dmarc.*fail/i.test(f);
    return row({ label: f, status: isFail ? 'fail' : 'warn', detail: null, summary: null, subtext: null });
  });

  // ── Routing hops ──────────────────────────────────────────────────
  const hopRows = hopDeltas
    .filter(h => h.delta !== null)
    .map(h => row({
      label: `Hop ${h.order}`,
      status: h.delta > 60 ? 'warn' : 'pass',
      detail: `${h.delta}s`,
      summary: h.delta > 60
        ? 'Worth noting. This hop took longer than usual — could be a relay configuration issue.'
        : 'Looks good. The message reached the mail server without delay.',
      subtext: null,
    }));

  // ── Summary box ───────────────────────────────────────────────────
  const totalIssues = fails.length + warns.length;
  let summaryHeading, summarySubtext, summaryColor, summaryBg, summaryBorder;

  if (fails.length > 0) {
    summaryColor = FAIL_TEXT; summaryBg = FAIL_BG; summaryBorder = '#fca5a5';
    summaryHeading = `${fails.length} issue${fails.length > 1 ? 's' : ''} that need${fails.length === 1 ? 's' : ''} attention`;
    summarySubtext = warns.length > 0
      ? `Also ${warns.length} thing${warns.length > 1 ? 's' : ''} worth improving when you get a chance.`
      : 'See the flagged items above.';
  } else if (warns.length > 0) {
    summaryColor = WARN_TEXT; summaryBg = WARN_BG; summaryBorder = '#fcd34d';
    summaryHeading = `${warns.length} thing${warns.length > 1 ? 's' : ''} worth improving`;
    summarySubtext = 'Nothing here is breaking your mail, but there\'s room to tighten things up.';
  } else {
    summaryColor = PASS_TEXT; summaryBg = PASS_BG; summaryBorder = '#86efac';
    summaryHeading = 'No issues found';
    summarySubtext = 'Your email setup is in good shape.';
  }

  const issueList = totalIssues > 0
    ? `<ul style="margin:10px 0 0;padding-left:20px">
        ${fails.map(p => `<li style="font-size:13px;color:${FAIL_TEXT};margin-bottom:4px">${p}</li>`).join('')}
        ${warns.map(p => `<li style="font-size:13px;color:${WARN_TEXT};margin-bottom:4px">${p}</li>`).join('')}
      </ul>`
    : '';

  const ctaBlock = totalIssues > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:${GOLD};border-radius:6px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK}">Want a hand with this?</p>
          <p style="margin:6px 0 0;font-size:13px;color:${DARK};opacity:0.85;line-height:1.5">Not sure what any of this means, or which parts actually matter? Reply to this email and I'll walk you through it in plain English. No charge, no pitch. If something's worth fixing, I'll tell you what's involved.</p>
        </td></tr>
      </table>`
    : '';

  // ── Assemble ──────────────────────────────────────────────────────
  const sectionsHtml = [
    section(
      'What your receiving server saw',
      'This is how a real inbox judged a message from your domain. These three checks largely decide whether your email lands in the inbox or gets flagged as suspicious.',
      authRows
    ),
    section(
      'Your actual DNS records',
      'These are the public settings that tell other mail servers who\'s allowed to send email for your domain. The summaries explain what each one does.',
      dnsRows
    ),
    ...(flagRows.length > 0 ? [section('Flags', null, flagRows)] : []),
    ...(hopRows.length > 0 ? [section(
      'Routing hops',
      'The path a message took to reach the mail server. Mostly useful for spotting delays or misconfigurations.',
      hopRows
    )] : []),
  ].join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr><td style="background:${DARK};padding:24px 32px;border-radius:6px 6px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <span style="color:${GOLD};font-size:16px;font-weight:900;letter-spacing:-0.3px">FLOUR CITY LABS</span>
        <div style="color:#9ca3af;font-size:12px;margin-top:2px;letter-spacing:0.5px">Email Deliverability Report</div>
      </td>
      <td align="right">
        <span style="color:#4b5563;font-size:11px">flourcitylabs.com</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Domain banner + intro -->
  <tr><td style="background:#fff;padding:20px 32px;border-bottom:1px solid ${BORDER}">
    <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Domain analyzed</div>
    <div style="font-size:22px;font-weight:700;color:${DARK};margin-bottom:12px">${domain}</div>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">Here's what I found when I checked how your domain sends and protects its email. Each item below has a plain-English summary, with the technical details kept underneath so nothing's hidden.</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:24px 32px">
    ${sectionsHtml}

    <!-- Summary box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${summaryBorder};border-radius:6px;background:${summaryBg}">
      <tr><td style="padding:20px 24px">
        <div style="font-size:15px;font-weight:700;color:${summaryColor}">${summaryHeading}</div>
        <div style="font-size:13px;color:${summaryColor};margin-top:4px;opacity:0.85">${summarySubtext}</div>
        ${issueList}
      </td></tr>
    </table>

    ${ctaBlock}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid ${BORDER};border-radius:0 0 6px 6px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-size:12px;font-weight:700;color:${DARK}">Aaron Eakins · Flour City Labs</div>
        <div style="font-size:12px;color:${MUTED};margin-top:2px">Rochester, NY · <a href="https://flourcitylabs.com" style="color:${GOLD};text-decoration:none">flourcitylabs.com</a></div>
      </td>
      <td align="right">
        <a href="mailto:lab@flourcitylabs.com" style="font-size:12px;color:${GOLD};text-decoration:none">lab@flourcitylabs.com</a>
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
