# Testing + Slicer Cleanup Plan

_Created 2026-06-18. Owner: Aaron. Context: portfolio quality pass — clean code,
good docs, system working end-to-end. Not optimizing for client acquisition._

---

## Execution approach

- **Feature branch + incremental commits.** Work on a branch; commit after each green
  section with conventional messages (`feat:`/`chore:`/`test:`/`docs:`). Every commit
  is a working, tested checkpoint.
- **Test per section, not at the end.** Each phase ends green before the next begins.
  The characterization tests must pass *before* any code moves — that's the whole
  point of the safety net. Smaller blast radius, cleaner history, no giant-diff debug.
- **Phase 2 is an Astro migration** (rebuild the marketing site as static-rendered
  Astro for SEO). Anything that Astro will redo — notably SPA code-splitting — is
  deliberately *not* done now to avoid throwaway work.

---

## Where things stand today

- **One test exists:** `apps/email-parser/test/test.js` — a smoke test over a single
  fixture (`synthetic.eml`). It confirms the pipeline runs and produces a string +
  valid JSON. It does **not** assert any specific parsing or flagging behavior.
- **No CI.** No `.github/workflows`. Nothing runs on push or PR.
- **No test runner** wired into `apps/labs`, `apps/email-worker`, or `apps/slicer`.

### Key finding: the analyzer/parser logic is triplicated

The header **parser** and **analyzer** exist as three near-identical copies:

| File | Module system | Notes |
|---|---|---|
| `apps/email-parser/src/{parser,analyzer}.js` | CommonJS | Original, well-commented |
| `apps/labs/src/lib/email/{parser,analyzer}.js` | ESM | Browser path (file/paste analyzer) |
| `apps/email-worker/src/{parser,analyzer}.js` | ESM | Worker path, adds DNS + sender helpers |

The logic (`parseAuthResults`, `baseDomain`, hop-delta math, the flag rules for
DMARC/SPF/DKIM fail, From/Return-Path mismatch, >60s hop delay) is the same in all
three. A change to one must be hand-copied to the other two — exactly the kind of
drift tests are meant to catch. `shared/` exists but is empty/reserved.

**Verified equivalence:** the parser *and* analyzer are byte-for-byte equivalent
logic across all three copies. The only differences are (a) module format —
`email-parser` is CommonJS, the other two ESM — and (b) which functions each file
exports. There is **no** behavioral divergence and **no** environment-specific code
(no `fs`/`Buffer`/`window`/`process`) — it's pure string logic, portable to browser,
Cloudflare Worker, and Node alike. This is the easy case for consolidation.

**Decision: consolidate first, under a characterization-test safety net.** The
three copies collapse into one `shared/` ESM module that all three apps import.
Tests that pin current behavior come *first* (they make the move verifiable), then
the extraction, then the broader suite.

### Related finding: share the *verdict*, not the renderers

The three report renderers are **correctly different** — different media, different
data:

| Renderer | Medium | Has live DNS? | Verdict logic? |
|---|---|---|---|
| `email-worker/report.js` (+ `report-html.js`) | emailed text/HTML | yes | **yes — `getProblems()`** classifies fail/warn |
| `email-parser/formatter.js` | CLI text/JSON | no | no — raw structural dump (dev tool) |
| `labs/EmailAnalyzerView.jsx` | browser DOM | no (header-only) | no — flat flags vs "Clean" |

So we should **not** merge the renderers. But the *judgment* — what counts as a hard
fail vs an advisory vs fine, and the plain-language problem list — currently lives
**only** in the worker's `getProblems()`. That means the website's paste/upload path
gives a **cruder verdict** for the same email than the email path does. That's a
substance inconsistency, not a styling one.

**Fix (extends the shared-core scope):** pull the verdict/severity classification into
`shared/email-core` as a pure function, e.g. `summarize({ analysis, dns? })` →
`{ fails, warns, passes, plainSummary }`, with `dns` optional (browser passes none,
worker passes live DNS). Each renderer then just *presents* that shared verdict in its
own medium. Result: all three surfaces agree on the substance and differ only in skin.
This is itself good TDD material — the tiering rules are pure logic.

---

## Part 1 — Testing plan

Priority order is by ROI and portfolio visibility: pure logic in the email analyzer
(the centerpiece) first; the not-live slicer last.

### Tooling choice

- **`node:test` (built-in test runner) + `node:assert`** for `email-parser` and
  `email-worker`. Zero new dependencies — good for a portfolio repo that should
  read as clean and dependency-light.
- **Vitest** for `apps/labs` (it's already a Vite project, so Vitest is the natural
  fit and reuses the existing config).
- Keep it lightweight. No coverage-percentage gates; aim for meaningful assertions
  on the logic that matters.

### Shared fixture corpus

Build a small set of `.eml` fixtures that each isolate one behavior. Reuse the same
corpus across all three implementations so they're provably equivalent:

- clean pass (SPF/DKIM/DMARC all pass)
- SPF hard fail / SPF softfail
- DMARC fail / DMARC `p=none` advisory (should **not** be a hard flag)
- DKIM fail (with and without `header.d=`)
- From / Return-Path registered-domain mismatch (and a subdomain case that must
  **not** flag)
- folded (multi-line) headers
- missing Received chain / single hop
- timestamps with parenthetical zones like `(UTC)` / `(EDT)`
- an unusually long hop delay (>60s)

### Consolidation mechanics (`shared/email-core`)

- **Linking: npm workspaces.** Add a root `package.json` with
  `"workspaces": ["apps/*", "shared/*"]`; make `shared/email-core` a tiny ESM package
  (`"type": "module"`, no deps); each app depends on it by name.
- **Vercel: confirmed safe.** The labs project has **"Include files outside the Root
  Directory" enabled**, so the workspace dependency resolves at build time. (This was
  the one gating risk — it's cleared.)
- **Deploy wiring to update:** `apps/email-worker/deploy.bat` runs `npm install`
  inside the worker dir; with workspaces it must install from the **repo root** first
  so the symlinked package exists before `wrangler deploy`.
- **Lockfiles:** the four per-app `package-lock.json` files get replaced by a single
  root lock.
- **email-parser → ESM:** it's the only CommonJS app; convert its handful of files
  (`index.js`, `loader.js`, `formatter.js`, `analyzer.js`, `parser.js`, `test/test.js`)
  to `import`/`export`. `loader.js`'s `fs` use stays app-side (not shared).
- **Shared export surface = the union** of what the three copies expose today:
  parser → `unfoldHeaders, splitHeaders, parseReceivedValue, parseReceivedChain,
  parseAllHeaders`; analyzer → `analyze, parseHeadersFromText, getSenderDomain,
  getSenderEmail, getDkimSelector`.

### Phases

1. **Characterization tests first (against canonical `email-parser`).**
   Table-driven `node:test` over the fixture corpus asserting: hop count + order,
   per-hop deltas, parsed auth results, and the exact `flags` array. This pins
   current behavior as the spec before anything moves.
2. **Stand up `shared/email-core` + workspaces.** Root `package.json`, the shared
   ESM package, root install, update `deploy.bat`.
3. **Extract logic into `shared/`, point all three apps at it, delete the copies.**
   Re-run the characterization suite against `shared/` — green proves equivalence.
4. **Verify every target still builds/runs:** `apps/labs` (Vite build), `email-worker`
   (`wrangler deploy --dry-run` / local), `email-parser` CLI. This is the moment the
   workspace wiring is proven end-to-end.
5. **Broaden the suite + wire scripts.** Mirror in `labs` (Vitest) for the browser
   entry points; add `test` scripts per app + a root `npm test`.
6. **Add CI** — GitHub Actions running `lint` + `test` on push/PR. A portfolio signal.
7. **Edge function logic (lower priority).** `inbound-reply` has testable pure bits:
   the `reply+([^@]+)@` quoteId regex and the reply-cleaning step. Deno test, or
   extract the pure helpers and unit-test them.

### Not pure logic / out of unit-test scope

- DNS lookups (`email-worker/src/dns.js`), Resend sends, Supabase inserts → these
  are I/O. Cover with a few integration smoke checks, not unit tests.
- Live site behavior → use the `/qa` skill against `flourcitylabs.com`, plus a
  manual smoke of the email path (send a message to `analyze@flourcitylabs.com`
  and confirm a sane reply).
- `apps/slicer/src/lib/quoteEngine.ts` is a clean pure function and would test well,
  but slicer is not live — defer until/unless slicer work resumes.

---

## Part 1b — Follow-up: Turnstile / form deduplication (SCHEDULED, after the analyzer consolidation)

A second, separate instance of duplication in the **live labs front-end**. Do this
*after* `shared/email-core` lands, as its own task.

- **Turnstile = dedup + behavior fix (user-facing; Aaron actively wants this).** The
  widget currently renders eagerly while browsing (the `window.turnstile.render` +
  `setInterval` polling pattern copied across `QuoteLab.jsx`, `ContactView.jsx`,
  `EmailCheckupView.jsx`, `ProjectNoteForm.jsx`). Extract a single `useTurnstile()`
  hook **and** switch it to on-demand: render invisibly with `interaction-only`
  appearance + `execution: 'execute'`, and call `turnstile.execute()` at submit time so
  no challenge appears during navigation. (Token must exist before the POST, so execute
  on the submit click, await the token, then send.) **This is independent of the
  analyzer work and can be pulled earlier on request.** Note: the form islands persist
  through the Astro migration, so this fix is not throwaway.
- **Form-submit flow** (Supabase insert → invoke `send-notification`) repeats across
  those same four components. Extract a shared submit helper.
- Lower priority / probably leave: the edge functions share Resend + CORS boilerplate,
  but they're Deno (separate runtime). The worker's `report.js`/`report-html.js` vs the
  parser's `formatter.js` are **not** duplication — different outputs for different
  targets.

---

## Part 1c — Code health & efficiency (front-end), one scoped pass

Quick scan results — the codebase is in decent shape, no egregious issues (assets are
small: `hero.png` 44K; some memoization already present; no obvious render bombs).

- **Code-splitting: deliberately deferred to Astro.** `App.jsx` statically imports all
  14 views, so the SPA ships in one bundle. We are **not** lazy-loading these now — the
  Astro migration replaces SPA static-rendering wholesale, so `React.lazy` here would be
  throwaway. Left as-is on purpose.
- **`QuoteLab.jsx` Turnstile `useEffect` has no dependency array** (re-runs every
  render by design — see the inline comment). It's guarded so it's not a bug, but it's
  untidy, and it's part of the eager-render annoyance. **Fixed as part of the
  `useTurnstile()` work in Part 1b** — no separate task.

**Scope discipline:** priority is portfolio quality, not perf tuning, and the Astro
migration supersedes most SPA-level perf. After the consolidation lands, run `/health`
and `/benchmark` once for an evidence-based snapshot; fix only what's cheap, and file
the rest as Astro-migration inputs.

---

## Part 2 — Documentation upkeep going forward

Two docs, two audiences, kept in sync deliberately:

- **`README.md`** — public portfolio doc. Must stay accurate; it's what a hiring
  reviewer reads. Single source of truth for architecture prose.
- **`CLAUDE.md`** — agent guidance. Should link to README for architecture rather
  than duplicate it, and must keep its **monorepo structure block** in sync with the
  actual `apps/` directory (it currently drifts — see Part 3).

**Workflow:** after every shipped change, run a docs checklist (or `/document-release`):
1. Does the README "Apps" table + architecture section still match reality?
2. Does CLAUDE.md's structure block list every app that exists?
3. Are live URLs / "what's shipped" / "not live" claims still true?
4. Update CHANGELOG if one exists; note status-date changes.

Rule of thumb: **don't duplicate prose** between README and CLAUDE.md. When they
disagree, that's a bug — fix at the source and link.

---

## Part 3 — Slicer cleanup

**The fact this clears up:** `apps/slicer` (the Next.js app) is **not live**. The
live 3D-printing quote tool is **QuoteLab** —
`apps/labs/src/components/quote/QuoteLab.jsx` — which submits quotes to Supabase
(materials + quotes tables, Turnstile-protected) and is used from Home / Printing /
Process / About views. The slicer app is future work for a possible
`flourcityprints.com` and is kept in the monorepo for continuity.

### In scope now (documentation accuracy — safe, reversible)

- **CLAUDE.md › Business Context:** stop implying the slicer app is the 3D service.
  State that live 3D quoting is QuoteLab in `apps/labs`; slicer is not deployed.
- **CLAUDE.md › Monorepo Structure:** the block only lists `slicer` + `labs`. Add
  `email-worker` and `email-parser`, and mark slicer "not deployed."
- **CLAUDE.md › apps/slicer:** add a clear "NOT DEPLOYED" banner at the top of the
  section so its prominence doesn't mislead. (Chose this over physically reordering
  the sections — the banner fixes the emphasis without moving large doc blocks.)
- **README:** already states slicer is "partially built, not live" — verify wording
  stays consistent with CLAUDE.md.

### Out of scope until Aaron confirms (destructive / strategic)

- **Deleting or archiving the slicer source.** README keeps it intentionally for
  future flourcityprints.com. Don't remove without an explicit decision.
- The slicer's known security issues (`ADMIN_PASSWORD` defaults to `password123`,
  base64 cookie, no auth middleware) are **not** production-exposed today because
  slicer isn't deployed — but they must be fixed before any flourcityprints launch.
  Tracked here so they aren't forgotten.
