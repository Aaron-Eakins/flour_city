// parser.js — Step 1: Received-chain parser core
// Header text in, structured data out. No UI, no email plumbing.

// --- Stage 1: unfold ---
// RFC 5322 header "folding": a logical header line can be split across
// multiple physical lines, where every continuation line begins with a
// space or tab. To parse reliably we first stitch those back together.
function unfoldHeaders(raw) {
  const physicalLines = raw.split(/\r?\n/);
  const logicalLines = [];
  for (const line of physicalLines) {
    if (/^[ \t]/.test(line) && logicalLines.length > 0) {
      // continuation of the previous header: join with a single space
      logicalLines[logicalLines.length - 1] += ' ' + line.trim();
    } else {
      logicalLines.push(line);
    }
  }
  return logicalLines;
}

// --- Stage 2: split into header name/value pairs ---
// We keep them in order because order is everything for the Received chain.
// The blank line separating headers from body ends parsing.
function splitHeaders(logicalLines) {
  const headers = [];
  for (const line of logicalLines) {
    if (line.trim() === '') break; // headers end at the first blank line
    const idx = line.indexOf(':');
    if (idx === -1) continue; // not a header line, skip
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    headers.push({ name, value });
  }
  return headers;
}

// --- Stage 3: parse a single Received header value into a hop ---
// Received headers follow the loose shape:
//   from <host> by <host> with <protocol> ... ; <timestamp>
// Not every clause is always present (LMTP local hops often omit "from"),
// so each piece is optional and we capture what we can.
function parseReceivedValue(value) {
  const hop = {
    from: null,
    fromIp: null,
    by: null,
    with: null,
    for: null,
    timestampRaw: null,
    raw: value,
  };

  // The timestamp is whatever follows the last semicolon.
  const lastSemi = value.lastIndexOf(';');
  let main = value;
  if (lastSemi !== -1) {
    hop.timestampRaw = value.slice(lastSemi + 1).trim();
    main = value.slice(0, lastSemi);
  }

  // Pull the sending IP out of the "from" clause BEFORE we strip parens.
  // It's the most useful field in a hop (it's what you blocklist-check),
  // and it lives inside brackets like "host (real.host [203.0.113.4])".
  // Grab the bracketed IP that appears before the first "by".
  const beforeBy = main.split(/\bby\b/i)[0];
  const ipMatch = beforeBy.match(/\[?((?:\d{1,3}\.){3}\d{1,3})\]?/);
  if (ipMatch) hop.fromIp = ipMatch[1];

  // Strip parenthetical comments before clause extraction. Servers stuff
  // TLS details into parens like "(using TLSv1.3 with cipher ...)", and
  // the word "with" inside there would otherwise be mistaken for the
  // protocol clause. (We already saved the IP above.)
  main = main.replace(/\((?:[^()]|\([^()]*\))*\)/g, ' ').replace(/\s+/g, ' ').trim();

  // "from" clause: everything between "from" and the next clause keyword.
  const fromMatch = main.match(/\bfrom\s+(.+?)(?=\s+\bby\b|\s+\bwith\b|\s+\bfor\b|$)/i);
  if (fromMatch) hop.from = fromMatch[1].trim();

  // "by" clause
  const byMatch = main.match(/\bby\s+(.+?)(?=\s+\bwith\b|\s+\bfor\b|\s+\bid\b|$)/i);
  if (byMatch) hop.by = byMatch[1].trim();

  // "with" clause (the protocol: ESMTPS, LMTP, HTTP, etc.)
  const withMatch = main.match(/\bwith\s+([A-Za-z0-9]+)/i);
  if (withMatch) hop.with = withMatch[1].trim();

  // "for <recipient>" clause
  const forMatch = main.match(/\bfor\s+(<[^>]+>)/i);
  if (forMatch) hop.for = forMatch[1].trim();

  return hop;
}

// --- Stage 4: build the ordered chain ---
// Received headers are prepended by each server, so the topmost Received
// is the LAST hop (closest to the inbox) and the bottom one is the FIRST.
// We return them in chronological order (oldest first) which is how a
// human reads the journey, and tag each with its position.
function parseReceivedChain(raw) {
  const headers = splitHeaders(unfoldHeaders(raw));
  const received = headers.filter(h => h.name.toLowerCase() === 'received');

  // headers array is top-to-bottom = newest-to-oldest.
  // reverse() gives oldest-to-newest = the actual travel order.
  const hops = received.map(h => parseReceivedValue(h.value)).reverse();

  return hops.map((hop, i) => ({ order: i + 1, ...hop }));
}

module.exports = {
  unfoldHeaders,
  splitHeaders,
  parseReceivedValue,
  parseReceivedChain,
};
