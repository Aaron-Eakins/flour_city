# Email Deliverability Analyzer — Cloudflare Email Worker

I built this to help small-business owners figure out why their email ends up in spam. A user emails any message to `analyze@flourcitylabs.com` from their business address. Within seconds they get a plain-English reply that tells them whether their SPF, DKIM, and DMARC are set up correctly, whether their DNS records back that up, and — if something is wrong — what the problem actually is.

It's a Cloudflare Email Worker that intercepts inbound email, parses the headers, does live DNS lookups against the sender's domain, and replies via the Resend API. No UI, no database of messages, no queue — it's a stateless function that runs once per email and exits.

---

## How It Works

1. An email arrives at `analyze@flourcitylabs.com`
2. The worker reads the raw message and parses the `Authentication-Results`, `Received`, and `DKIM-Signature` headers
3. It extracts the sender's domain from the `From` header and does live DNS lookups for SPF, DKIM, DMARC, and MX records
4. It classifies each finding as **Pass**, **Warn**, or **Fail** (more on this below)
5. It sends an HTML + plain-text reply to the sender via Resend, with a BCC to the lab inbox
6. It logs the domain and results to Supabase for lead tracking

---

## Design Decisions Worth Knowing

### Dual-audience report

The sender might be a small-business owner with no technical background, or a developer verifying their setup. The report handles both at once: it opens with a plain-language verdict and summary (no jargon, no acronyms in isolation), and preserves the full raw technical data underneath — the actual DNS records, the Authentication-Results headers, the Received chain with hop timing. The summary tells a non-technical reader whether they have a problem. The detail section lets a technical reader verify the analysis is correct.

### Three-tier severity

The original version used a binary pass/fail. That caused a real problem: a DMARC record set to `p=none` (monitoring-only, delivers fine, low urgency) showed up identically to a missing SPF record (emails will fail delivery, fix immediately). I replaced the binary with Pass / Warn / Fail so low-stakes advisories look different from genuine failures. The report's top summary block, color coding, and section icons all reflect this three-tier system.

### Permissive intake inbox

The worker's email routing does not apply aggressive spam filtering. That's intentional: the users this tool exists to serve are exactly the senders most likely to be flagged. If a business has a misconfigured SPF or no DMARC record, their test email may itself fail spam checks. Filtering the intake inbox would silently drop the requests the tool is designed to handle.

### Three intake methods

- **Email** (primary): send any message to the analysis address; no file or setup required. Designed for non-technical users.
- **File upload**: upload a `.eml` or `.msg` file on the website. Useful for analyzing a message you already have saved.
- **Paste raw headers**: paste header text directly. For developers who know how to get headers out of their mail client.

The file upload and paste paths run entirely in the browser (no server-side processing) and check headers only — they can't do DNS lookups. The email path runs the full analysis including live DNS.

---

## Project Structure

```
apps/email-worker/
├── src/
│   ├── index.js        # Worker entry point — email handler, orchestrates everything
│   ├── parser.js       # RFC 2822 header unfolding, Received chain parsing
│   ├── analyzer.js     # Authentication-Results parsing, flag detection, hop timing
│   ├── dns.js          # SPF / DKIM / DMARC / MX lookups via Cloudflare DNS over HTTPS
│   ├── report.js       # Plain-text report and severity classification (getProblems)
│   └── report-html.js  # HTML email report with inline styles for Outlook compatibility
├── wrangler.toml       # Cloudflare Worker config
└── package.json
```

The DNS module uses Cloudflare's DNS-over-HTTPS API (`cloudflare-dns.com/dns-query`) rather than Node's `dns` module, since Cloudflare Workers don't have access to system DNS.

---

## Tech Stack

- **Cloudflare Email Workers** — inbound email handler, zero infrastructure to manage
- **Resend** — transactional email API for sending the reply
- **Supabase** — lead logging (domain, results, issue count) via REST API
- **Cloudflare DNS over HTTPS** — live DNS lookups without Node.js dependencies

---

## Setup

### Prerequisites

- A Cloudflare account with an email routing-enabled domain
- A [Resend](https://resend.com) account with a verified sending domain
- A [Supabase](https://supabase.com) project with an `analyzer_leads` table
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed

### Install and deploy

```bash
cd apps/email-worker
npm install
npx wrangler deploy
```

### Environment variables

Set these as Wrangler secrets (not in `wrangler.toml` — they're sensitive):

```bash
wrangler secret put RESEND_API_KEY       # Resend API key for sending replies
wrangler secret put SUPABASE_URL         # Your Supabase project URL
wrangler secret put SUPABASE_SERVICE_KEY # Supabase service role key (bypasses RLS for inserts)
```

The worker will run without Supabase configured — it logs an error and continues. It will not run without a valid `RESEND_API_KEY` (the reply send will fail silently and the error will appear in Worker logs).

### Cloudflare email routing

In the Cloudflare dashboard, configure your domain's email routing to forward the analysis address to the `fcl-email-analyzer` worker. The worker name is set in `wrangler.toml`.

---

## `analyzer_leads` Supabase Table

The worker inserts one row per inbound email:

| Column | Type | Notes |
|---|---|---|
| `email` | text | Sender address |
| `domain` | text | Sender domain (extracted from From header) |
| `spf_ok` | boolean | SPF record found in DNS |
| `dkim_ok` | boolean | DKIM public key found in DNS |
| `dmarc_ok` | boolean | DMARC record found in DNS |
| `mx_ok` | boolean | MX records found in DNS |
| `issues_count` | integer | Total warns + fails |
| `issues` | text[] | List of warn/fail descriptions |

---

## Known Limitations

**No rate limiting.** A single sender could trigger many analyses by sending multiple emails. There's no per-sender throttle or abuse handling. For a low-volume consulting tool this hasn't mattered, but it's the first thing to add before any wider promotion.

**DKIM key lookup requires a DKIM-Signature header.** The worker extracts the selector from the email's `DKIM-Signature` header to know where to look. If the sender's mail system isn't signing at all, there's no selector, and the DNS check can't run. The report notes this rather than treating it as a failure.

**Subdomain DMARC fallback is a heuristic.** For subdomain senders, the worker checks the organizational domain for a DMARC record if the subdomain has none. This uses a simple label-stripping approach (`newsletters.example.com` → `example.com`) that doesn't account for public suffixes like `.co.uk`. It's correct for the common case.

**No blacklist checks.** Checking whether a domain or IP is on a known spam blacklist was planned but not yet built. The report flags what it can from headers and DNS; blacklist status is out of scope for now.

---

## What's Next

- Per-domain rate limiting to prevent abuse
- Webhook or email notification when a new lead comes in, rather than relying on the BCC copy
- Blacklist and reputation checks — likely linking out to or embedding MXToolbox lookups rather than building from scratch
