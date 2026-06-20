// analyzer.js — Authentication-Results parsing, hop-delta math, anomaly flags, and
// sender-identity helpers (pure ESM). Canonical home shared by the CLI, the browser
// analyzer, and the email worker.
import { splitHeaders, unfoldHeaders } from './parser.js';

// A hop slower than this (seconds) is flagged as an unusual delay. Single source of
// truth — the analyzer's flag rule and every renderer (CLI, browser, worker) read it.
export const SLOW_HOP_SECONDS = 60;

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

// Main export. Takes the full headers array and the parsed hops array, returns
// auth results, per-hop time deltas, and a list of anomaly flags.
export function analyze(headers, hops) {
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
    if (d.delta !== null && d.delta > SLOW_HOP_SECONDS) {
      flags.push(`Unusual delay at hop ${d.order}: ${d.delta}s`);
    }
  }

  return { authResults, hopDeltas, flags };
}

// Parses a raw header block (text) into { headers, raw }. Used by the browser
// paste/upload path, which has only text to work with.
export function parseHeadersFromText(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n');
  const blankLineIdx = normalized.indexOf('\n\n');
  const headerBlock = blankLineIdx === -1 ? normalized : normalized.slice(0, blankLineIdx);
  return { headers: splitHeaders(unfoldHeaders(headerBlock)), raw: headerBlock };
}

// --- Sender-identity helpers (used by the worker to drive live DNS lookups) ---

export function getSenderDomain(headers) {
  const fromHdr = headers.find(h => h.name.toLowerCase() === 'from');
  if (!fromHdr) return null;
  return extractDomain(fromHdr.value);
}

export function getSenderEmail(headers) {
  const fromHdr = headers.find(h => h.name.toLowerCase() === 'from');
  if (!fromHdr) return null;
  const angleMatch = fromHdr.value.match(/<([^>]+)>/);
  if (angleMatch) return angleMatch[1].trim().toLowerCase();
  const bareMatch = fromHdr.value.match(/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i);
  return bareMatch ? bareMatch[0].toLowerCase() : null;
}

export function getDkimSelector(headers) {
  const dkimHdr = headers.find(h => h.name.toLowerCase() === 'dkim-signature');
  if (!dkimHdr) return null;
  const sMatch = dkimHdr.value.match(/\bs=([^;]+)/i);
  return sMatch ? sMatch[1].trim() : null;
}

// Turns analysis flags (and optional live DNS results) into a two-tier verdict:
// { fails, warns }. This is the SINGLE source of severity judgment, shared by every
// surface so the email report, the CLI, and the browser analyzer agree on what counts
// as a hard fail vs. an advisory.
//
// `dns` is optional: the email worker passes its live DNS lookups (enabling the
// record-level checks below); the browser paste/upload path omits it and gets a
// verdict from the header-derived flags alone.
export function summarize({ flags = [], dns = null } = {}) {
  // Header-flag severity: hard auth failures are fails; everything else (softfail,
  // From/Return-Path mismatch, slow hop) is advisory.
  const flagFails = flags.filter(f => /hard fail|dkim.*fail|dmarc.*fail/i.test(f));
  const flagWarns = flags.filter(f => !flagFails.includes(f));

  const fails = [];
  const warns = [];

  if (dns) {
    if (!dns.spf.found) fails.push('No SPF record');
    if (!dns.dkim.found && dns.dkim.selector !== null) fails.push('DKIM key missing');
    if (!dns.dmarc.found) {
      warns.push('No DMARC record');
    } else {
      if (dns.dmarc.policy === 'none') warns.push('DMARC policy is p=none — monitoring only, not yet enforcing');
      if (dns.dmarc.orgDomain) warns.push(`DMARC inherited from ${dns.dmarc.orgDomain} — consider a subdomain-specific record`);
    }
  }

  fails.push(...flagFails);
  warns.push(...flagWarns);

  return { fails, warns };
}
