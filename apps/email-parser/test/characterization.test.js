// Characterization tests for the email-parser CLI path. Imports the parser +
// analyzer from @flour-city/email-core and runs the canonical shared fixture
// corpus through the CLI's own loader — proving the CLI agrees with the shared
// behavioral spec.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { loadHeaders } from '../src/loader.js';
import { unfoldHeaders, splitHeaders, parseReceivedChain, analyze } from '@flour-city/email-core';

// Canonical corpus lives with the shared package (single source of truth).
const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  '..', '..', '..', 'shared', 'email-core', 'fixtures',
);

function run(file) {
  const raw = loadHeaders(join(FIXTURES, file));
  const headers = splitHeaders(unfoldHeaders(raw));
  const hops = parseReceivedChain(raw);
  return { headers, hops, analysis: analyze(headers, hops) };
}

const flagCases = [
  { file: 'synthetic.eml',              hops: 3, flags: [] },
  { file: 'case-spf-hardfail.eml',      hops: 2, flags: ['SPF: hard fail'] },
  { file: 'case-spf-softfail.eml',      hops: 2, flags: ['SPF: softfail'] },
  { file: 'case-dmarc-fail.eml',        hops: 2, flags: ['DMARC: fail'] },
  { file: 'case-dmarc-pnone.eml',       hops: 2, flags: [] },
  { file: 'case-dkim-fail.eml',         hops: 2, flags: ['DKIM: fail (domain: sender.test)'] },
  { file: 'case-from-rp-mismatch.eml',  hops: 2, flags: ['From/Return-Path domain mismatch: sender.test vs otherdomain.test'] },
  { file: 'case-from-rp-subdomain.eml', hops: 2, flags: [] },
  { file: 'case-slow-hop.eml',          hops: 2, flags: ['Unusual delay at hop 2: 90s'] },
  { file: 'case-no-received.eml',       hops: 0, flags: [] },
];

for (const c of flagCases) {
  test(`${c.file}: ${c.hops} hop(s), flags ${JSON.stringify(c.flags)}`, () => {
    const { hops, analysis } = run(c.file);
    assert.equal(hops.length, c.hops, 'hop count');
    assert.deepEqual(analysis.flags, c.flags, 'flags');
  });
}

test('synthetic.eml: hops ordered oldest-first with correct deltas', () => {
  const { hops, analysis } = run('synthetic.eml');
  assert.deepEqual(hops.map(h => h.order), [1, 2, 3]);
  assert.deepEqual(analysis.hopDeltas.map(d => d.delta), [null, 2, 2]);
});

test('synthetic.eml: authentication-results parsed into structured form', () => {
  const { analysis } = run('synthetic.eml');
  assert.equal(analysis.authResults.length, 1);
  const auth = analysis.authResults[0];
  assert.equal(auth.spf.result, 'pass');
  assert.deepEqual(auth.dkim, [{ result: 'pass', domain: 'sender.test' }]);
  assert.deepEqual(auth.dmarc, { result: 'pass', policy: 'quarantine' });
});

test('synthetic.eml: first hop captures sending IP and protocol', () => {
  const { hops } = run('synthetic.eml');
  assert.equal(hops[0].fromIp, '192.0.2.100');
  assert.equal(hops[0].with, 'LMTP');
});
