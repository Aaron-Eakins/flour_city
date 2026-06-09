// parser.js — Received-chain parser core (ESM, browser-compatible)

function unfoldHeaders(raw) {
  const physicalLines = raw.split(/\r?\n/);
  const logicalLines = [];
  for (const line of physicalLines) {
    if (/^[ \t]/.test(line) && logicalLines.length > 0) {
      logicalLines[logicalLines.length - 1] += ' ' + line.trim();
    } else {
      logicalLines.push(line);
    }
  }
  return logicalLines;
}

function splitHeaders(logicalLines) {
  const headers = [];
  for (const line of logicalLines) {
    if (line.trim() === '') break;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    headers.push({ name, value });
  }
  return headers;
}

function parseReceivedValue(value) {
  const hop = {
    from: null, fromIp: null, by: null, with: null,
    for: null, timestampRaw: null, raw: value,
  };

  const lastSemi = value.lastIndexOf(';');
  let main = value;
  if (lastSemi !== -1) {
    hop.timestampRaw = value.slice(lastSemi + 1).trim();
    main = value.slice(0, lastSemi);
  }

  const beforeBy = main.split(/\bby\b/i)[0];
  const ipMatch = beforeBy.match(/\[?((?:\d{1,3}\.){3}\d{1,3})\]?/);
  if (ipMatch) hop.fromIp = ipMatch[1];

  main = main.replace(/\((?:[^()]|\([^()]*\))*\)/g, ' ').replace(/\s+/g, ' ').trim();

  const fromMatch = main.match(/\bfrom\s+(.+?)(?=\s+\bby\b|\s+\bwith\b|\s+\bfor\b|$)/i);
  if (fromMatch) hop.from = fromMatch[1].trim();

  const byMatch = main.match(/\bby\s+(.+?)(?=\s+\bwith\b|\s+\bfor\b|\s+\bid\b|$)/i);
  if (byMatch) hop.by = byMatch[1].trim();

  const withMatch = main.match(/\bwith\s+([A-Za-z0-9]+)/i);
  if (withMatch) hop.with = withMatch[1].trim();

  const forMatch = main.match(/\bfor\s+(<[^>]+>)/i);
  if (forMatch) hop.for = forMatch[1].trim();

  return hop;
}

export function parseReceivedChain(raw) {
  const headers = splitHeaders(unfoldHeaders(raw));
  const received = headers.filter(h => h.name.toLowerCase() === 'received');
  const hops = received.map(h => parseReceivedValue(h.value)).reverse();
  return hops.map((hop, i) => ({ order: i + 1, ...hop }));
}

export { unfoldHeaders, splitHeaders };
