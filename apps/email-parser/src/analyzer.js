'use strict';

// Extracts the domain from an email address string.
// Handles bare addresses (user@domain.com) and angle-bracket form (<user@domain.com>).
function extractDomain(address) {
  const atIdx = address.indexOf('@');
  if (atIdx === -1) return null;
  return address.slice(atIdx + 1).replace(/[>\s].*$/, '').toLowerCase().trim();
}

// Returns just the last two labels of a domain (e.g. "twmail.builtin.com" -> "builtin.com").
// Used for From/Return-Path mismatch checks so subdomain return paths don't false-flag.
function baseDomain(domain) {
  if (!domain) return null;
  const parts = domain.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain;
}

// Parses one Authentication-Results header value into a structured object.
// Format: "reporter; method=result details; method=result details; ..."
function parseAuthResults(value) {
  const clauses = value.split(';');
  const result = {
    reporter: clauses[0].trim(),
    dkim: [],
    spf: null,
    dmarc: null,
  };

  for (const clause of clauses.slice(1)) {
    const t = clause.trim();
    if (!t) continue;

    if (/^dkim=/i.test(t)) {
      const rm = t.match(/^dkim=(\S+)/i);
      const dm = t.match(/\bheader\.d=(\S+)/i);
      if (rm) {
        result.dkim.push({
          result: rm[1].toLowerCase(),
          domain: dm ? dm[1].replace(/;.*$/, '') : null,
        });
      }
      continue;
    }

    if (/^spf=/i.test(t)) {
      const rm = t.match(/^spf=(\S+)/i);
      const detail = t.match(/\(([^)]+)\)/);
      if (rm) {
        result.spf = {
          result: rm[1].toLowerCase(),
          detail: detail ? detail[1] : null,
        };
      }
      continue;
    }

    if (/^dmarc=/i.test(t)) {
      const rm = t.match(/^dmarc=(\S+)/i);
      const parenContent = (t.match(/\(([^)]*)\)/) || [])[1] || '';
      // Some servers use "policy=none", others use "p=NONE" — handle both.
      const policyMatch =
        parenContent.match(/\bpolicy=(\w+)/i) ||
        parenContent.match(/\bp=(\w+)/i);
      if (rm) {
        result.dmarc = {
          result: rm[1].toLowerCase(),
          policy: policyMatch ? policyMatch[1].toLowerCase() : null,
        };
      }
      continue;
    }
  }

  return result;
}

// Parses an RFC 2822 date string into a millisecond timestamp.
// Strips parenthetical timezone abbreviations like (UTC) or (EDT) before parsing
// because some JS engines reject them.
function parseTimestamp(raw) {
  if (!raw) return NaN;
  return Date.parse(raw.replace(/\([^)]*\)/g, '').trim());
}

// Main export. Takes the full headers array and the parsed hops array,
// returns auth results, per-hop time deltas, and a list of anomaly flags.
function analyze(headers, hops) {
  const authResults = headers
    .filter(h => h.name.toLowerCase() === 'authentication-results')
    .map(h => parseAuthResults(h.value));

  // Compute seconds between consecutive hops. Hop 1 (the origin) always gets null.
  const hopDeltas = hops.map((hop, i) => {
    if (i === 0) return { order: hop.order, delta: null };
    const prevMs = parseTimestamp(hops[i - 1].timestampRaw);
    const currMs = parseTimestamp(hop.timestampRaw);
    if (isNaN(prevMs) || isNaN(currMs)) return { order: hop.order, delta: null };
    return {
      order: hop.order,
      delta: Math.round((currMs - prevMs) / 100) / 10,
    };
  });

  const flags = [];

  for (const auth of authResults) {
    if (auth.dmarc && auth.dmarc.result === 'fail') {
      flags.push('DMARC: fail');
    }
    if (auth.spf) {
      if (auth.spf.result === 'fail') flags.push('SPF: hard fail');
      else if (auth.spf.result === 'softfail') flags.push('SPF: softfail');
    }
    for (const d of auth.dkim) {
      if (d.result === 'fail') {
        flags.push(`DKIM: fail (domain: ${d.domain || 'unknown'})`);
      }
    }
  }

  // Flag if the visible From domain and the envelope Return-Path domain differ
  // at the registered-domain level (subdomains are expected and don't count).
  const fromHdr = headers.find(h => h.name.toLowerCase() === 'from');
  const rpHdr   = headers.find(h => h.name.toLowerCase() === 'return-path');
  if (fromHdr && rpHdr) {
    const fromBase = baseDomain(extractDomain(fromHdr.value));
    const rpBase   = baseDomain(extractDomain(rpHdr.value));
    if (fromBase && rpBase && fromBase !== rpBase) {
      flags.push(`From/Return-Path domain mismatch: ${fromBase} vs ${rpBase}`);
    }
  }

  for (const d of hopDeltas) {
    if (d.delta !== null && d.delta > 60) {
      flags.push(`Unusual delay at hop ${d.order}: ${d.delta}s`);
    }
  }

  return { authResults, hopDeltas, flags };
}

module.exports = { analyze };
