'use strict';

const { loadHeaders }                                    = require('./loader');
const { unfoldHeaders, splitHeaders, parseReceivedChain } = require('./parser');
const { analyze }                                        = require('./analyzer');
const { format }                                         = require('./formatter');

const args     = process.argv.slice(2);
const jsonMode = args.includes('--json');
const filePath = args.find(a => !a.startsWith('--'));

if (!filePath) {
  console.error('Usage: node index.js [--json] <file.eml|file.msg>');
  process.exit(1);
}

let rawHeaders;
try {
  rawHeaders = loadHeaders(filePath);
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

const headers  = splitHeaders(unfoldHeaders(rawHeaders));
const hops     = parseReceivedChain(rawHeaders);
const analysis = analyze(headers, hops);

console.log(format(hops, analysis, { json: jsonMode }));
