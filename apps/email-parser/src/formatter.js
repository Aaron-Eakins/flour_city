'use strict';

// Produces either a human-readable text summary or a JSON string.
// opts.json = true  ->  JSON.stringify of { hops, analysis }
// opts.json = false ->  formatted text (default)
function format(hops, analysis, opts = {}) {
  if (opts.json) {
    return JSON.stringify({ hops, analysis }, null, 2);
  }

  const deltaMap = new Map(analysis.hopDeltas.map(d => [d.order, d.delta]));
  const lines = [];

  // --- Received Chain ---
  lines.push(`=== Received Chain (${hops.length} hop${hops.length !== 1 ? 's' : ''}, oldest first) ===`);
  lines.push('');

  for (const hop of hops) {
    const delta = deltaMap.get(hop.order);
    let deltaLabel;
    if (hop.order === 1 && delta === null) {
      deltaLabel = '[origin]';
    } else if (delta === null) {
      deltaLabel = '[time unknown]';
    } else {
      deltaLabel = `[${delta >= 0 ? '+' : ''}${delta.toFixed(1)}s]`;
    }

    lines.push(`Hop ${hop.order}  ${deltaLabel}`);

    if (hop.from && hop.fromIp) {
      lines.push(`  From: ${hop.from} [${hop.fromIp}]`);
    } else if (hop.from) {
      lines.push(`  From: ${hop.from}`);
    } else {
      lines.push(`  From: (not present)`);
    }

    lines.push(`  By:   ${hop.by   || '(not present)'}`);
    lines.push(`  With: ${hop.with || '(not present)'}`);
    lines.push(`  Time: ${hop.timestampRaw || '(not present)'}`);
    lines.push('');
  }

  // --- Authentication Results ---
  lines.push('=== Authentication Results ===');
  lines.push('');

  if (analysis.authResults.length === 0) {
    lines.push('  (no Authentication-Results headers found)');
    lines.push('');
  } else {
    for (const auth of analysis.authResults) {
      lines.push(`Reporter: ${auth.reporter}`);

      if (auth.dkim.length > 0) {
        const dkimStr = auth.dkim
          .map(d => `${d.result}${d.domain ? ` (${d.domain})` : ''}`)
          .join(', ');
        lines.push(`  DKIM:  ${dkimStr}`);
      } else {
        lines.push(`  DKIM:  (not checked)`);
      }

      lines.push(`  SPF:   ${auth.spf ? auth.spf.result : '(not checked)'}`);

      if (auth.dmarc) {
        const policy = auth.dmarc.policy ? ` (policy=${auth.dmarc.policy})` : '';
        lines.push(`  DMARC: ${auth.dmarc.result}${policy}`);
      } else {
        lines.push(`  DMARC: (not checked)`);
      }

      lines.push('');
    }
  }

  // --- Flags ---
  lines.push('=== Flags ===');
  lines.push('');

  if (analysis.flags.length === 0) {
    lines.push('  (none)');
  } else {
    for (const flag of analysis.flags) {
      lines.push(`  * ${flag}`);
    }
  }

  return lines.join('\n');
}

module.exports = { format };
