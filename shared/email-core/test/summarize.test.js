// Tests for the shared verdict logic — the single source of severity judgment used
// by the email worker (with DNS) and the browser analyzer (flags only).
import test from 'node:test';
import assert from 'node:assert/strict';

import { summarize, SLOW_HOP_SECONDS } from '../src/index.js';

test('SLOW_HOP_SECONDS is the shared 60s threshold', () => {
  assert.equal(SLOW_HOP_SECONDS, 60);
});

test('summarize buckets header flags into fails vs warns (no DNS)', () => {
  const flags = [
    'SPF: hard fail',
    'SPF: softfail',
    'DMARC: fail',
    'DKIM: fail (domain: sender.test)',
    'From/Return-Path domain mismatch: a.test vs b.test',
    'Unusual delay at hop 2: 90s',
  ];
  const { fails, warns } = summarize({ flags });
  assert.deepEqual(fails, [
    'SPF: hard fail',
    'DMARC: fail',
    'DKIM: fail (domain: sender.test)',
  ]);
  assert.deepEqual(warns, [
    'SPF: softfail',
    'From/Return-Path domain mismatch: a.test vs b.test',
    'Unusual delay at hop 2: 90s',
  ]);
});

test('summarize with nothing is empty', () => {
  assert.deepEqual(summarize({}), { fails: [], warns: [] });
  assert.deepEqual(summarize(), { fails: [], warns: [] });
});

test('summarize folds in DNS record problems when DNS is provided', () => {
  const dns = {
    spf: { found: false },
    dkim: { found: false, selector: 'default' },
    dmarc: { found: true, policy: 'none', orgDomain: null },
  };
  const { fails, warns } = summarize({ flags: ['DMARC: fail'], dns });
  assert.deepEqual(fails, ['No SPF record', 'DKIM key missing', 'DMARC: fail']);
  assert.deepEqual(warns, ['DMARC policy is p=none — monitoring only, not yet enforcing']);
});

test('summarize does not flag missing DKIM when there was no selector to check', () => {
  const dns = {
    spf: { found: true },
    dkim: { found: false, selector: null },
    dmarc: { found: true, policy: 'reject', orgDomain: null },
  };
  assert.deepEqual(summarize({ dns }), { fails: [], warns: [] });
});
