# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
