# Flour City Labs

Web and email consulting for Rochester, NY small businesses. This monorepo contains the marketing site, a standalone email header analysis tool, a Cloudflare Email Worker that automates the analysis, and a 3D printing quoting app (secondary service).

---

## Apps

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/labs` | Vite + React + Tailwind CSS v4 + Supabase | Marketing site + browser-based Header Analyzer |
| `apps/email-worker` | Cloudflare Email Worker | Inbound email → analysis → plain-English reply |
| `apps/email-parser` | Node.js CLI | Standalone email header parser (development/testing tool) |
| `apps/slicer` | Next.js 16 + Prisma + Stripe | 3D printing quote and order platform |

Each app is independent. Run commands from inside the app directory.

---

## Email Header Analyzer

The main portfolio piece. There are three ways to use it:

1. **Email** (primary): send any message to `analyze@flourcitylabs.com`. The Cloudflare Email Worker intercepts it, runs the full analysis including live DNS lookups, and replies within seconds with a plain-English report.
2. **File upload**: upload a `.eml` or `.msg` file on the website. Analysis runs in the browser — no raw content leaves the machine.
3. **Paste**: paste raw headers directly into the text area on the site.

The browser paths (file + paste) check headers only. The email path also does live DNS lookups for SPF records, DKIM public keys, DMARC policy, and MX records.

**Report design:** The report is structured for two audiences at once — a non-technical reader who wants to know "is my email okay," and a technical reader who wants to verify the analysis. The top of the report has a jargon-free plain-language verdict. The full raw data (DNS records, Authentication-Results headers, Received chain with hop timing) is preserved underneath as proof. A three-tier severity system (Pass / Warn / Fail) distinguishes low-stakes advisories like `DMARC p=none` from genuine failures like a missing SPF record.

**Blacklist and reputation checks** are planned — likely linking out to or embedding MXToolbox lookups.

See [`apps/email-worker/README.md`](apps/email-worker/README.md) for deployment details.

---

## Running locally

```bash
# Marketing site + browser Header Analyzer
cd apps/labs
npm install
npm run dev          # http://localhost:5173

# Email parser CLI
cd apps/email-parser
npm install
node src/index.js fixtures/synthetic.eml
node src/index.js --json path/to/file.eml

# 3D printing app
cd apps/slicer
npm install
npm run dev          # http://localhost:3000
```

---

## Supabase

Schema migrations are in `apps/labs/supabase/migrations/`. Run them manually in the Supabase SQL editor.

- `email_audits` — per-analysis metadata from the browser tool (no raw content). Anonymous users can insert; RLS enabled.
- `analyzer_leads` — per-email metadata from the Cloudflare Worker (domain, DNS results, issue count). Written server-side using the service role key.
