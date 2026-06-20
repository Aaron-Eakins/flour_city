'use strict';

// Characterization tests: pin down what the parser + analyzer ACTUALLY do today,
// over a fixture corpus that isolates one behavior each. This is the behavioral
// spec the shared/email-core consolidation must preserve — every implementation
// (CLI, browser, worker) is expected to agree with these expectations.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { loadHeaders } = require('../src/loader');
const { unfoldHeaders, splitHeaders, parseReceivedChain } = require('../src/parser');
const { analyze } = require('../src/analyzer');

const FIXTURES = path.join(__dirname, '..', 'fixtures');

function run(file) {
  const raw = loadHeaders(path.join(FIXTURES, file));
  const headers = splitHeaders(unfoldHeaders(raw));
  const hops = parseReceivedChain(raw);
  const analysis = analyze(headers, hops);
  return { headers, hops, analysis };
}

// --- Flag rules: each fixture isolates exactly one outcome ---

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

// --- Deeper assertions on the clean baseline (synthetic.eml) ---

test('synthetic.eml: hops are ordered oldest-first with correct deltas', () => {
  const { hops, analysis } = run('synthetic.eml');
  assert.deepEqual(hops.map(h => h.order), [1, 2, 3]);
  // 15:00:01 -> 15:00:03 -> 15:00:05 = +2.0s per hop; origin hop has null delta.
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
  const origin = hops[0];
  assert.equal(origin.fromIp, '192.0.2.100');
  assert.equal(origin.with, 'LMTP');
});
