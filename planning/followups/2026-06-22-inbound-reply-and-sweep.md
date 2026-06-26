# Follow-up: inbound-reply fix + codebase sweep (2026-06-22)

Notes to pick this back up — written so either Aaron or Claude can drive. Everything
code-side that was safe to do is done; what remains needs Supabase deploy + real-email
verification (only doable with the live stack).

## TL;DR state

- **Fix for #1 is written and committed** on branch `fix/inbound-reply-sender-attribution`
  (commit `019a66f`). NOT deployed, NOT merged.
- 5 GitHub issues exist (`Aaron-Eakins/flour_city`): #1 fixed-pending-deploy, #2 the big
  refactor, #3/#4/#5 from the sweep (labeled `unverified`).
- Supabase CLI is installed (2.84.2), authed, and linked to project `joaisrcmzktcdxplilil`.
- `gh` CLI is installed + authed. From a **new** Bash shell it's on PATH; in an old shell add
  `export PATH="$PATH:/c/Program Files/GitHub CLI"`.

---

## Task 1 — ship the #1 fix (sender attribution)

**What changed:** `apps/labs/supabase/functions/inbound-reply/index.ts` now resolves the
sender from the payload `from`. Client email reply → stored `author_role: 'client'` and
forwarded to the lab; lab reply → `'lab'` and forwarded to the client (unchanged).

### Deploy
```bash
cd apps/labs
# (only if not authed) supabase login
supabase functions deploy inbound-reply
```

### Verify (the real test — code review can't prove this path)
1. Make sure a `quotes` row exists with your test client email, and you know its `reply+{id}@` address.
2. **Lab → client (regression):** reply from the lab to `reply+{id}@`. Confirm the client
   receives it, and `/profile` shows a note with `author_role='lab'` (or the DB row does).
3. **Client → lab (the fix):** from the *client* address, reply to `reply+{id}@`. Confirm:
   - a `project_notes` row is inserted with `author_role='client'` (check in Supabase),
   - the message is forwarded to the lab inbox (not echoed back to the client).
4. Edge case: a reply with empty/quoted-only body should be skipped (no note, no forward).

### Rollback
The previous version is one commit back. To revert the deploy, `git checkout main --
apps/labs/supabase/functions/inbound-reply/index.ts` and redeploy, or redeploy from `main`.

### Close out
If verification passes: merge `fix/inbound-reply-sender-attribution` → `main` (or open a PR),
and the commit message already says `closes #1`.

---

## Task 2 — the big refactor (#2, not started)

Unify all form notifications into one shared notify core + a generic thread model so every
form notifies both sides, supports two-way email reply, and shows up in `/profile` for
logged-in users. **Decision already made:** option (A), a generic thread/conversation table.

Note (resolved via #4): the dashboard↔email thread mirror was **intentionally dropped** by
Aaron as not worth the troubleshooting effort — email-based comms is the accepted working
state, not a bug. `/profile` is a project status/summary view by design; `ProjectNoteForm`
is leftover dead code from that dropped attempt. So if #2 is ever pursued, treat the
in-dashboard thread as **optional/out-of-scope** unless explicitly revived; the real value
is unifying form notifications (notify both sides + two-way email reply). When ready, ask
Claude to draft a plan (plan mode) before editing.

---

## Sweep findings

| # | Title | Status / verify by |
|---|-------|-----------|
| #3 | inbound-reply injects reply text into email HTML without escaping | `unverified` — send a reply with `<b>`/`<script>`; check forwarded email shows literal text |
| #4 | `/profile` note history / `ProjectNoteForm` orphaned | **CLOSED (not planned)** — intentional drop, not a bug. README corrected on branch `docs/dashboard-comms-accuracy`. |
| #5 | quote auto-reply threading assumes `@resend.dev` Message-ID — may silently break threading | `unverified` — open raw headers of a real auto-reply, compare `Message-ID` to `<{id}@resend.dev>` |

Also folded into #2's hardening list: add the missing `res.ok` check in `send-notification`'s
`sendEmail`, and tighten the bridge-secret check from `.includes()` to an exact comparison.

## What I deliberately did NOT touch

- `apps/slicer` — not live; its known security issues are already documented in its
  `PROJECT_PLAN.md` / CLAUDE.md and weren't re-filed.
- `shared/email-core` — reviewed, looked clean and well-tested; no issues filed.
