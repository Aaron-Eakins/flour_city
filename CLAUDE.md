# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business Context

**Flour City Labs** is a web and email consulting practice for Rochester, NY small businesses. The primary service is email deliverability — SPF, DMARC, DKIM, blacklist issues. The 3D printing service (slicer app) is secondary.

**Authoritative plan:** `~/.gstack/projects/Aaron-Eakins-flour_city/afloc-main-design-20260419-121835.md`

**Historical planning notes** in `planning/notes/` and `apps/labs/planning/notes/` predate the consulting pivot and are focused on 3D printing. Treat them as context only — do not work from them.

**Status (June 2026):** Tech Forum attended. First free audits delivered (Bob + two others). Active job search — this project serves double duty as a real consulting tool and a portfolio piece. The priority right now is portfolio quality: clean code, good documentation, the system working end-to-end. Not optimizing for client acquisition.

**What's shipped:**
- Marketing site live at flourcitylabs.com (Vite + React + Supabase, auto-deploy via Vercel)
- Email Header Analyzer: in-browser (file/paste, no data leaves the machine) and email-based (Cloudflare Worker → Resend reply within seconds)
- Client project system: quote requests → email reply threading → client-facing note history at `/profile`
- Email worker: three-tier severity, dual-audience report design, permissive intake inbox, Supabase lead logging

**Phase 2 (next):** Astro rebuild for SSG/SEO, PDF audit template, recurring monitoring service, blacklist checks in email analyzer.

---

## Monorepo Structure

```
apps/
  slicer/   # Next.js 16 — 3D printing quote & order platform
  labs/     # Vite + React — Flour City Labs marketing site
shared/     # (reserved, currently unused)
```

Each app is independent with its own `package.json`. Run all commands from within the app directory.

---

## apps/slicer

**Stack:** Next.js 16.2.2 (App Router) · React 19 · TypeScript · Prisma 5 · PostgreSQL (Neon Serverless) · Vercel Blob · Stripe · Resend · Three.js

### Commands

```bash
cd apps/slicer
npm run dev          # start dev server (localhost:3000)
npm run build        # prisma generate + next build
npm run lint         # eslint
npx prisma studio    # browse the database
npx prisma db push   # push schema changes to Neon (no migration file)
npx prisma generate  # regenerate client after schema edits
```

### Architecture

- **App Router only.** All routes live under `src/app/`. No server actions — all data mutation goes through REST routes under `src/app/api/`.
- **Quote engine** (`src/lib/quoteEngine.ts`) is a pure function: takes `(weightGrams, printTimeHours, config, options)` and returns a cost breakdown. No I/O or DB calls. All pricing config is fetched separately and passed in.
- **Prisma singleton** at `src/lib/db.ts`. Import from there, never instantiate `PrismaClient` directly.
- **File uploads** bypass Vercel's 4.5 MB body limit via direct client-side Vercel Blob upload. The server receives a blob URL, not the raw file.
- **Slicer integration** (`src/app/api/quote/route.ts`) tries to invoke Orca Slicer CLI (`SLICER_PATH` env var) to extract weight/time from STL/3MF. This never works on Vercel; the production path is always the size-based fallback: `weight = fileSizeMB × 15 g`, `time = fileSizeMB × 0.4 h`.
- **Admin auth** is a custom env-var password check (`ADMIN_PASSWORD`). On success a session token is written to an `httpOnly` cookie. Each admin API route validates the cookie manually — there is currently no Next.js middleware enforcing auth centrally.

### Known Issues (do not regress)

See `PROJECT_PLAN.md` for the full list. The highest-risk items:
- No auth middleware — admin routes each check the cookie manually.
- `admin_session` cookie stores base64-encoded password, not a signed token.
- `ADMIN_PASSWORD` defaults to `password123` if env var is unset.

### ⚠ Next.js 16 Warning

This version has breaking API changes from the Next.js you likely know. Before writing or modifying any Next.js-specific code (routing, middleware, config, server components), read the relevant guide in `node_modules/next/dist/docs/`.

---

## apps/labs

**Stack:** Vite 8 · React 19 · JavaScript (JSX, no TypeScript) · Tailwind CSS v4 · Supabase

### Commands

```bash
cd apps/labs
npm run dev      # start dev server
npm run build    # vite build
npm run lint     # eslint
npm run preview  # preview production build
```

### Architecture

- SPA with view-based routing — page components live in `src/views/` (e.g., `HomeView.jsx`, `ProfileView.jsx`).
- Auth via Supabase (`src/lib/supabaseClient.js`), exposed through `src/context/AuthContext.jsx`.
- Shared UI components in `src/components/` organized by feature area (auth, common, dashboard, layout, quote).
- No TypeScript — all files are `.jsx`.
- Tailwind CSS v4 (Vite plugin, not PostCSS config).

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
