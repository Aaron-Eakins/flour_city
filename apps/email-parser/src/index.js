import { loadHeaders } from './loader.js';
import { unfoldHeaders, splitHeaders, parseReceivedChain, analyze } from '@flour-city/email-core';
import { format } from './formatter.js';

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
