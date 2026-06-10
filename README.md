# Flour City Labs

Web and email consulting for Rochester, NY small businesses. This monorepo contains the marketing site, a standalone email header analysis tool, and a 3D printing quoting app (secondary service).

---

## Apps

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/labs` | Vite + React + Tailwind CSS v4 + Supabase | Marketing site + Header Analyzer tool |
| `apps/email-parser` | Node.js CLI | Email header parser (powers the web tool) |
| `apps/slicer` | Next.js 16 + Prisma + Stripe | 3D printing quote and order platform |

Each app is independent. Run commands from inside the app directory.

---

## Email Header Analyzer

The main portfolio piece. Accepts `.eml` or `.msg` files (or pasted raw headers), parses the Received chain, checks DKIM / SPF / DMARC authentication results, flags anomalies, and renders structured output in the browser. Analysis is client-side — no raw header content leaves the machine. A summary of findings (hop count, auth results, flags, from-domain) is saved to Supabase for follow-up.

**Planned v1 additions:**
- PTR / rDNS lookup on the sending IP
- MX lookup on the From domain
- DMARC policy lookup directly from `_dmarc.domain` (catches `p=none` enforcement gaps)
- DKIM public key lookup at `selector._domainkey.domain` using the selector from the header

DNS lookups will run through a Cloudflare Worker using DNS-over-HTTPS. Blacklist checks are out of scope — the tool links out to MXToolbox for that.

**Planned email automation:**
Inbound email to `audit@flourcitylabs.com` → Cloudflare Email Routing → Worker → header extraction → analysis → reply with findings + CTA. Same parser, same Supabase table, no new analysis logic.

---

## Running locally

```bash
# Marketing site + Header Analyzer
cd apps/labs
npm install
npm run dev          # http://localhost:8888

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

## Environment variables

**apps/labs** — `.env` file:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

**apps/slicer** — `.env.local` file:
```
DATABASE_URL=
DIRECT_URL=
BLOB_READ_WRITE_TOKEN=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_PASSWORD=
```

---

## Supabase

Schema migrations are in `apps/labs/supabase/migrations/`. Run them manually in the Supabase SQL editor. The `email_audits` table stores per-analysis metadata (no raw content). RLS is enabled — anonymous users can insert, authenticated users can read their own rows.
