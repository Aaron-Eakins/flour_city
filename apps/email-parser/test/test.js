'use strict';

const path = require('path');
const { loadHeaders }                                     = require('../src/loader');
const { unfoldHeaders, splitHeaders, parseReceivedChain } = require('../src/parser');
const { analyze }                                         = require('../src/analyzer');
const { format }                                          = require('../src/formatter');

const fixtures = ['synthetic.eml'];

let passed = 0;
let failed = 0;

for (const fixture of fixtures) {
  const filePath = path.join(__dirname, '../fixtures', fixture);
  try {
    const rawHeaders = loadHeaders(filePath);
    const headers    = splitHeaders(unfoldHeaders(rawHeaders));
    const hops       = parseReceivedChain(rawHeaders);
    const analysis   = analyze(headers, hops);
    const text       = format(hops, analysis, { json: false });
    const json       = format(hops, analysis, { json: true });

    if (!Array.isArray(hops))     throw new Error('hops must be an array');
    if (typeof text !== 'string') throw new Error('text output must be a string');
    if (typeof json !== 'string') throw new Error('json output must be a string');
    JSON.parse(json);

    console.log(`PASS  ${fixture}  (${hops.length} hops, ${analysis.flags.length} flags)`);
    passed++;
  } catch (err) {
    console.error(`FAIL  ${fixture}  ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
