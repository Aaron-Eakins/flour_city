// HTML email report — all styles inline, table-based layout for Outlook compat

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

function row(label, status, detail, subtext) {
  const cfg = {
    pass: { bg: PASS_BG, color: PASS_TEXT, badge: '#dcfce7', icon: '✓', word: 'PASS' },
    fail: { bg: FAIL_BG, color: FAIL_TEXT, badge: '#fee2e2', icon: '✗', word: 'FAIL' },
    warn: { bg: WARN_BG, color: WARN_TEXT, badge: '#fef3c7', icon: '⚠', word: 'WARN' },
    info: { bg: '#f8fafc', color: MUTED, badge: '#f1f5f9', icon: '·', word: 'INFO' },
  }[status] || { bg: '#f8fafc', color: MUTED, badge: '#f1f5f9', icon: '·', word: '' };

  return `
<tr>
  <td style="padding:12px 16px;background:${cfg.bg};border-bottom:1px solid ${BORDER}">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;vertical-align:top">
          <span style="display:inline-block;background:${cfg.badge};color:${cfg.color};font-size:13px;font-weight:700;width:28px;height:28px;line-height:28px;text-align:center;border-radius:4px">${cfg.icon}</span>
        </td>
        <td style="padding-left:10px;vertical-align:top">
          <span style="font-size:13px;font-weight:700;color:${DARK}">${label}</span>
          ${detail ? `<span style="font-size:13px;color:${MUTED};margin-left:8px">${detail}</span>` : ''}
          ${subtext ? `<div style="margin-top:4px;font-size:12px;color:${MUTED};font-family:monospace">${subtext}</div>` : ''}
        </td>
        <td style="text-align:right;vertical-align:top;white-space:nowrap">
          <span style="font-size:10px;font-weight:700;letter-spacing:1px;color:${cfg.color}">${cfg.word}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function section(title, rows) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid ${BORDER};border-radius:6px;overflow:hidden">
  <tr>
    <td style="padding:10px 16px;background:#f8fafc;border-bottom:1px solid ${BORDER}">
      <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:${MUTED};text-transform:uppercase">${title}</span>
    </td>
  </tr>
  ${rows.join('')}
</table>`;
}

function recordBox(record) {
  if (!record) return '';
  return `<div style="margin-top:6px;padding:8px 10px;background:#f8fafc;border:1px solid ${BORDER};border-radius:4px;font-family:monospace;font-size:11px;color:#374151;word-break:break-all">${record}</div>`;
}

export function formatReportHtml({ domain, headerAnalysis, dns }) {
  const { authResults, hopDeltas, flags } = headerAnalysis;
  const auth = authResults[0] || {};

  // ── Header auth rows ───────────────────────────────────────────────
  const authRows = [];

  if (auth.spf) {
    const ok = auth.spf.result === 'pass';
    authRows.push(row('SPF', ok ? 'pass' : auth.spf.result === 'softfail' ? 'warn' : 'fail',
      auth.spf.result, auth.spf.detail || null));
  } else {
    authRows.push(row('SPF', 'info', 'not reported in headers', null));
  }

  if (auth.dkim && auth.dkim.length > 0) {
    for (const d of auth.dkim) {
      const ok = d.result === 'pass';
      authRows.push(row('DKIM', ok ? 'pass' : 'fail', d.result, d.domain ? `signed by ${d.domain}` : null));
    }
  } else {
    authRows.push(row('DKIM', 'warn', 'no signature in headers', null));
  }

  if (auth.dmarc) {
    const ok = auth.dmarc.result === 'pass';
    authRows.push(row('DMARC', ok ? 'pass' : 'fail', auth.dmarc.result,
      auth.dmarc.policy ? `policy: ${auth.dmarc.policy}` : null));
  } else {
    authRows.push(row('DMARC', 'info', 'not reported in headers', null));
  }

  // ── DNS record rows ────────────────────────────────────────────────
  const dnsRows = [];

  // SPF
  if (dns.spf.found) {
    dnsRows.push(row('SPF record', 'pass', null, dns.spf.record));
  } else {
    dnsRows.push(row('SPF record', 'fail', `missing at ${domain}`,
      `Fix: add TXT record → v=spf1 include:_spf.google.com ~all`));
  }

  // DKIM
  if (dns.dkim.found) {
    const preview = dns.dkim.record ? dns.dkim.record.slice(0, 60) + '…' : null;
    dnsRows.push(row('DKIM key', 'pass', dns.dkim.selector ? `selector: ${dns.dkim.selector}` : null, preview));
  } else if (!dns.dkim.selector) {
    dnsRows.push(row('DKIM key', 'info', 'could not check — no DKIM-Signature header', null));
  } else {
    dnsRows.push(row('DKIM key', 'fail', `missing at ${dns.dkim.selector}._domainkey.${domain}`, null));
  }

  // DMARC
  if (dns.dmarc.found) {
    const policy = dns.dmarc.policy;
    const status = policy === 'reject' || policy === 'quarantine' ? 'pass' : 'warn';
    const inherited = dns.dmarc.orgDomain ? `inherited from ${dns.dmarc.orgDomain}` : null;
    dnsRows.push(row('DMARC record', status, inherited, dns.dmarc.record));
    if (policy === 'none') {
      dnsRows.push(row('DMARC policy', 'warn', 'p=none — failing mail still gets delivered', 'Consider upgrading to p=quarantine'));
    }
  } else {
    dnsRows.push(row('DMARC record', 'fail', `missing at _dmarc.${dns.dmarc.foundAt || domain}`,
      `Fix: add TXT record → v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`));
  }

  // MX
  if (dns.mx.found) {
    const mxList = dns.mx.records.join('<br>');
    dnsRows.push(row('MX records', 'pass', `${dns.mx.records.length} found`, mxList));
  } else {
    dnsRows.push(row('MX records', 'fail', `none found for ${domain}`, null));
  }

  // ── Flags ──────────────────────────────────────────────────────────
  const flagRows = flags.map(f => row(f, 'warn', null, null));

  // ── Routing hops ───────────────────────────────────────────────────
  const hopRows = hopDeltas
    .filter(h => h.delta !== null)
    .map(h => row(`Hop ${h.order}`, h.delta > 60 ? 'warn' : 'pass',
      `${h.delta}s`, h.delta > 60 ? 'Unusually slow — may indicate a relay issue' : null));

  // ── Summary ────────────────────────────────────────────────────────
  const problems = [
    !dns.spf.found && 'No SPF record',
    !dns.dkim.found && dns.dkim.selector !== null && 'DKIM key missing',
    !dns.dmarc.found && 'No DMARC record',
    dns.dmarc.found && dns.dmarc.policy === 'none' && 'DMARC policy is too weak (p=none)',
    dns.dmarc.found && dns.dmarc.orgDomain && `DMARC inherited from ${dns.dmarc.orgDomain}`,
    ...flags,
  ].filter(Boolean);

  const summaryColor = problems.length === 0 ? PASS_TEXT : FAIL_TEXT;
  const summaryBg = problems.length === 0 ? PASS_BG : FAIL_BG;
  const summaryBorder = problems.length === 0 ? '#86efac' : '#fca5a5';
  const summaryHeading = problems.length === 0
    ? 'Everything looks good'
    : `${problems.length} issue${problems.length > 1 ? 's' : ''} found`;

  const problemList = problems.length > 0
    ? `<ul style="margin:12px 0 0;padding-left:20px">
        ${problems.map(p => `<li style="font-size:13px;color:${FAIL_TEXT};margin-bottom:4px">${p}</li>`).join('')}
      </ul>`
    : '';

  const ctaBlock = problems.length > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:${GOLD};border-radius:6px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK}">Want me to fix this?</p>
          <p style="margin:6px 0 0;font-size:13px;color:${DARK};opacity:0.8">Reply to this email and I'll walk you through what needs to be fixed.</p>
        </td></tr>
      </table>`
    : '';

  // ── Assemble ───────────────────────────────────────────────────────
  const sectionsHtml = [
    section('What your receiving server saw', authRows),
    section('Your actual DNS records', dnsRows),
    ...(flagRows.length > 0 ? [section('Flags', flagRows)] : []),
    ...(hopRows.length > 0 ? [section('Routing hops', hopRows)] : []),
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

  <!-- Domain banner -->
  <tr><td style="background:#fff;padding:20px 32px;border-bottom:1px solid ${BORDER}">
    <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Domain analyzed</div>
    <div style="font-size:22px;font-weight:700;color:${DARK}">${domain}</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:24px 32px">
    ${sectionsHtml}

    <!-- Summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${summaryBorder};border-radius:6px;background:${summaryBg}">
      <tr><td style="padding:20px 24px">
        <div style="font-size:15px;font-weight:700;color:${summaryColor}">${summaryHeading}</div>
        ${problemList}
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
