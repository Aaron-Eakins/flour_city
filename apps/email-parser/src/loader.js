// loader.js — Input layer (sits in FRONT of parser.js)
// File path in -> raw header text out. The parser stays pure; this handles
// the messy job of getting header text out of different file formats.

const fs = require('fs');
const path = require('path');
const MsgReader = require('@kenjiuno/msgreader').default;

// --- .eml: trivially easy ---
// An .eml IS the raw RFC 822 message as text: headers, one blank line, body.
// We only need the part before the first blank line. We return the whole
// header block (parser.js stops at the blank line on its own, but trimming
// here keeps things tidy and fast).
function headersFromEml(text) {
  // Normalize line endings, then cut at the first truly blank line.
  const normalized = text.replace(/\r\n/g, '\n');
  const blankLineIdx = normalized.indexOf('\n\n');
  return blankLineIdx === -1 ? normalized : normalized.slice(0, blankLineIdx);
}

// --- .msg: the hard one ---
// .msg is a Microsoft OLE2 compound binary file, not text. The full header
// block is stored in a MAPI property the library exposes as `headers`.
// Outlook doesn't always populate it (e.g. for messages composed locally
// and never sent), so we guard for that and say so plainly.
function headersFromMsg(buffer) {
  const reader = new MsgReader(buffer);
  const data = reader.getFileData();
  if (data && typeof data.headers === 'string' && data.headers.trim() !== '') {
    return headersFromEml(data.headers); // reuse the eml trimmer
  }
  throw new Error(
    'This .msg has no transport headers stored (common for drafts or ' +
    'locally-composed messages). The Received chain only exists once a ' +
    'message has actually been sent through mail servers.'
  );
}

// --- dispatcher ---
// Decide by extension, fall back to sniffing. .msg files start with the
// OLE2 magic bytes D0 CF 11 E0; anything else we treat as text/eml.
function loadHeaders(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  const looksLikeMsg =
    ext === '.msg' ||
    (buffer.length >= 4 &&
      buffer[0] === 0xd0 && buffer[1] === 0xcf &&
      buffer[2] === 0x11 && buffer[3] === 0xe0);

  if (looksLikeMsg) return headersFromMsg(buffer);
  return headersFromEml(buffer.toString('utf8'));
}

module.exports = { loadHeaders, headersFromEml, headersFromMsg };
