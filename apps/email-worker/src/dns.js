// DNS lookups via Cloudflare DNS over HTTPS (no Node.js dns module needed in Workers)

const DOH = 'https://cloudflare-dns.com/dns-query';

async function dnsQuery(name, type) {
  const url = `${DOH}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) return null;
  return res.json();
}

function txtValue(answer) {
  if (!answer) return null;
  const rec = answer.find(a => a.type === 16); // TXT = 16
  return rec ? rec.data.replace(/^"|"$/g, '').replace(/" "/g, '') : null;
}

function mxRecords(answer) {
  if (!answer) return [];
  return answer
    .filter(a => a.type === 15) // MX = 15
    .map(a => a.data)
    .sort();
}

export async function lookupSpf(domain) {
  const data = await dnsQuery(domain, 'TXT');
  if (!data?.Answer) return { found: false, record: null };
  const spf = data.Answer
    .filter(a => a.type === 16)
    .map(a => a.data.replace(/^"|"$/g, '').replace(/" "/g, ''))
    .find(v => v.startsWith('v=spf1'));
  return spf ? { found: true, record: spf } : { found: false, record: null };
}

export async function lookupDmarc(domain) {
  const data = await dnsQuery(`_dmarc.${domain}`, 'TXT');
  const record = txtValue(data?.Answer);
  if (!record || !record.startsWith('v=DMARC1')) return { found: false, record: null, policy: null };
  const pMatch = record.match(/\bp=(\w+)/i);
  return { found: true, record, policy: pMatch ? pMatch[1].toLowerCase() : 'none' };
}

export async function lookupDkim(domain, selector) {
  if (!selector) return { found: false, record: null };
  const data = await dnsQuery(`${selector}._domainkey.${domain}`, 'TXT');
  const record = txtValue(data?.Answer);
  return record ? { found: true, record } : { found: false, record: null };
}

export async function lookupMx(domain) {
  const data = await dnsQuery(domain, 'MX');
  const records = mxRecords(data?.Answer);
  return { found: records.length > 0, records };
}

export async function lookupAll(domain, dkimSelector) {
  const [spf, dmarc, dkimResult, mx] = await Promise.all([
    lookupSpf(domain),
    lookupDmarc(domain),
    lookupDkim(domain, dkimSelector),
    lookupMx(domain),
  ]);
  // Thread selector through so report.js can distinguish "no selector" from "key missing"
  const dkim = { ...dkimResult, selector: dkimSelector ?? null };
  return { spf, dmarc, dkim, mx };
}
