// analyzer.js — Auth results + anomaly detection (ESM, browser-compatible)
import { splitHeaders, unfoldHeaders } from './parser.js';

function extractDomain(address) {
  const atIdx = address.indexOf('@');
  if (atIdx === -1) return null;
  return address.slice(atIdx + 1).replace(/[>\s].*$/, '').toLowerCase().trim();
}

function baseDomain(domain) {
  if (!domain) return null;
  const parts = domain.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain;
}

function parseAuthResults(value) {
  const clauses = value.split(';');
  const result = { reporter: clauses[0].trim(), dkim: [], spf: null, dmarc: null };

  for (const clause of clauses.slice(1)) {
    const t = clause.trim();
    if (!t) continue;

    if (/^dkim=/i.test(t)) {
      const rm = t.match(/^dkim=(\S+)/i);
      const dm = t.match(/\bheader\.d=(\S+)/i);
      if (rm) result.dkim.push({ result: rm[1].toLowerCase(), domain: dm ? dm[1].replace(/;.*$/, '') : null });
      continue;
    }
    if (/^spf=/i.test(t)) {
      const rm = t.match(/^spf=(\S+)/i);
      const detail = t.match(/\(([^)]+)\)/);
      if (rm) result.spf = { result: rm[1].toLowerCase(), detail: detail ? detail[1] : null };
      continue;
    }
    if (/^dmarc=/i.test(t)) {
      const rm = t.match(/^dmarc=(\S+)/i);
      const parenContent = (t.match(/\(([^)]*)\)/) || [])[1] || '';
      const policyMatch = parenContent.match(/\bpolicy=(\w+)/i) || parenContent.match(/\bp=(\w+)/i);
      if (rm) result.dmarc = { result: rm[1].toLowerCase(), policy: policyMatch ? policyMatch[1].toLowerCase() : null };
      continue;
    }
  }
  return result;
}

function parseTimestamp(raw) {
  if (!raw) return NaN;
  return Date.parse(raw.replace(/\([^)]*\)/g, '').trim());
}

export function analyze(headers, hops) {
  const authResults = headers
    .filter(h => h.name.toLowerCase() === 'authentication-results')
    .map(h => parseAuthResults(h.value));

  const hopDeltas = hops.map((hop, i) => {
    if (i === 0) return { order: hop.order, delta: null };
    const prevMs = parseTimestamp(hops[i - 1].timestampRaw);
    const currMs = parseTimestamp(hop.timestampRaw);
    if (isNaN(prevMs) || isNaN(currMs)) return { order: hop.order, delta: null };
    return { order: hop.order, delta: Math.round((currMs - prevMs) / 100) / 10 };
  });

  const flags = [];

  for (const auth of authResults) {
    if (auth.dmarc?.result === 'fail') flags.push('DMARC: fail');
    if (auth.spf) {
      if (auth.spf.result === 'fail') flags.push('SPF: hard fail');
      else if (auth.spf.result === 'softfail') flags.push('SPF: softfail');
    }
    for (const d of auth.dkim) {
      if (d.result === 'fail') flags.push(`DKIM: fail (domain: ${d.domain || 'unknown'})`);
    }
  }

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

export function parseHeadersFromText(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n');
  const blankLineIdx = normalized.indexOf('\n\n');
  const headerBlock = blankLineIdx === -1 ? normalized : normalized.slice(0, blankLineIdx);
  return { headers: splitHeaders(unfoldHeaders(headerBlock)), raw: headerBlock };
}
