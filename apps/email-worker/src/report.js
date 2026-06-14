// Formats the plain-text reply email body

function pass(label) { return `✓ ${label}`; }
function fail(label) { return `✗ ${label}`; }
function warn(label) { return `⚠ ${label}`; }

export function formatReport({ domain, headerAnalysis, dns }) {
  const { authResults, hopDeltas, flags } = headerAnalysis;
  const auth = authResults[0] || {};
  const lines = [];

  lines.push(`Deliverability report for ${domain}`);
  lines.push('='.repeat(50));
  lines.push('');

  // --- Header authentication (what the receiving server saw) ---
  lines.push('WHAT YOUR RECEIVING SERVER SAW');
  lines.push('-'.repeat(30));

  if (auth.spf) {
    const ok = auth.spf.result === 'pass';
    lines.push(`${ok ? pass('SPF') : fail('SPF')}  ${auth.spf.result}${auth.spf.detail ? ` (${auth.spf.detail})` : ''}`);
  }

  if (auth.dkim && auth.dkim.length > 0) {
    for (const d of auth.dkim) {
      const ok = d.result === 'pass';
      lines.push(`${ok ? pass('DKIM') : fail('DKIM')}  ${d.result}${d.domain ? ` — signed by ${d.domain}` : ''}`);
    }
  } else {
    lines.push(fail('DKIM  no signature found'));
  }

  if (auth.dmarc) {
    const ok = auth.dmarc.result === 'pass';
    lines.push(`${ok ? pass('DMARC') : fail('DMARC')}  ${auth.dmarc.result}${auth.dmarc.policy ? ` (policy: ${auth.dmarc.policy})` : ''}`);
  }

  lines.push('');

  // --- Live DNS records ---
  lines.push('YOUR ACTUAL DNS RECORDS');
  lines.push('-'.repeat(30));

  // SPF
  if (dns.spf.found) {
    lines.push(pass(`SPF record exists`));
    lines.push(`   ${dns.spf.record}`);
  } else {
    lines.push(fail('SPF  no record found at ' + domain));
    lines.push('   Fix: add a TXT record like: v=spf1 include:_spf.google.com ~all');
  }

  lines.push('');

  // DKIM
  if (dns.dkim.found) {
    lines.push(pass('DKIM public key found'));
    lines.push(`   ${dns.dkim.record?.slice(0, 80)}...`);
  } else if (dns.dkim.selector === null) {
    lines.push(warn('DKIM  could not check — no DKIM-Signature header in this email'));
  } else {
    lines.push(fail(`DKIM  no key found at ${dns.dkim.selector}._domainkey.${domain}`));
  }

  lines.push('');

  // DMARC
  if (dns.dmarc.found) {
    const policy = dns.dmarc.policy;
    const ok = policy === 'reject' || policy === 'quarantine';
    lines.push(`${ok ? pass('DMARC record exists') : warn('DMARC record exists but policy is weak')}`);
    if (dns.dmarc.orgDomain) {
      lines.push(`   Inherited from parent domain: ${dns.dmarc.orgDomain}`);
      lines.push(`   (No subdomain-specific record at _dmarc.${domain})`);
    }
    lines.push(`   ${dns.dmarc.record}`);
    if (policy === 'none') {
      lines.push('   Note: p=none means failing emails still get delivered. Consider p=quarantine.');
    }
  } else {
    lines.push(fail('DMARC  no record found at _dmarc.' + domain));
    if (domain !== dns.dmarc?.foundAt) {
      lines.push(`   Also checked parent domain — not found there either.`);
    }
    lines.push('   Fix: add a TXT record like: v=DMARC1; p=quarantine; rua=mailto:dmarc@' + domain);
  }

  lines.push('');

  // MX
  if (dns.mx.found) {
    lines.push(pass(`MX records (${dns.mx.records.length})`));
    for (const r of dns.mx.records) lines.push(`   ${r}`);
  } else {
    lines.push(fail('MX  no mail exchange records found'));
  }

  lines.push('');

  // --- Flags from header analysis ---
  if (flags.length > 0) {
    lines.push('FLAGS');
    lines.push('-'.repeat(30));
    for (const f of flags) lines.push(`  • ${f}`);
    lines.push('');
  }

  // --- Routing hops ---
  const hops = hopDeltas.filter(h => h.delta !== null);
  if (hops.length > 0) {
    lines.push('ROUTING');
    lines.push('-'.repeat(30));
    for (const h of hops) {
      const slow = h.delta > 60;
      lines.push(`  Hop ${h.order}: ${h.delta}s${slow ? ' ⚠ unusually slow' : ''}`);
    }
    lines.push('');
  }

  // --- Summary verdict ---
  const problems = [
    !dns.spf.found && 'No SPF record',
    !dns.dkim.found && dns.dkim.selector !== null && 'DKIM key missing',
    !dns.dmarc.found && 'No DMARC record',
    dns.dmarc.found && dns.dmarc.policy === 'none' && 'DMARC policy is p=none (too weak)',
    dns.dmarc.found && dns.dmarc.orgDomain && `DMARC inherited from ${dns.dmarc.orgDomain} — consider adding a subdomain-specific record`,
    ...flags,
  ].filter(Boolean);

  lines.push('SUMMARY');
  lines.push('-'.repeat(30));
  if (problems.length === 0) {
    lines.push('Everything looks good. Your email setup is properly configured.');
  } else {
    lines.push(`${problems.length} issue${problems.length > 1 ? 's' : ''} found:`);
    for (const p of problems) lines.push(`  • ${p}`);
    lines.push('');
    lines.push('Reply to this email if you want me to fix these. I can usually turn');
    lines.push('these around in one session — $150 flat for a complete implementation.');
  }

  lines.push('');
  lines.push('—');
  lines.push('Aaron Eakins · Flour City Labs');
  lines.push('lab@flourcitylabs.com · Rochester, NY');
  lines.push('flourcitylabs.com');

  return lines.join('\n');
}
