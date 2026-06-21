# Plan: README diagram + email threading fix

Working notes so the doc work isn't lost while we fix the code first.

## Sequence
1. Fix the threading-header bug in the Edge Functions (code first, see below).
2. Confirm the real Resend Message-ID format against a live email.
3. Then finish the README changes, describing what's actually true.

---

## Part A — Code fix: email threading headers (do first)

**Problem.** Replies don't reliably thread because `In-Reply-To` / `References`
reference a value that isn't a valid RFC 5322 Message-ID.

- `inbound-reply/index.ts:130` stores `last_resend_message_id: forwardData.id`
  — the bare Resend UUID, no `<…@domain>`.
- `inbound-reply/index.ts:117-118` reuses that bare UUID in `In-Reply-To` /
  `References`. Mail clients ignore a malformed reference, so the reply lands as
  a NEW thread instead of threading.
- `send-notification/index.ts:133-134` wraps it as `<${threadId}@resend.dev>`,
  but `resend.dev` is a guess at the domain. If Resend's real Message-ID uses a
  different domain, this breaks too.

**RESOLVED via real headers (2026-06-16 lead-alert email).** Ground truth:
```
Message-ID:  <0100019ed17dcc76-...-000000@email.amazonses.com>
In-Reply-To: <1448e45d-a12d-44ca-9469-88f3058043c8@resend.dev>
References:  <1448e45d-a12d-44ca-9469-88f3058043c8@resend.dev>
```
- Resend delivers through Amazon SES. The REAL Message-ID is
  `<{ses-id}@email.amazonses.com>`.
- The Resend API response `id` (a UUID like `1448e45d-…`) is NOT the SES
  Message-ID and cannot be converted into it. They are unrelated identifiers.
- So `send-notification`'s `<${threadId}@resend.dev>` is a phantom: wrong
  domain AND wrong id. `inbound-reply`'s stored bare `forwardData.id` is the
  same phantom. Neither ever matches a real Message-ID.
- Net: header threading does not work. Gmail currently threads these by
  SUBJECT. The In-Reply-To / References headers are dead weight.

**Why the fix is non-trivial (product decision, not a format swap).** The real
Message-ID is only knowable on the INBOUND side (`email.messageId` from
PostalMime, which is the true `<…@email.amazonses.com>`). Resend's send API
never hands back the real Message-ID, only its own UUID. So a correct fix has
to decide WHICH real Message-ID each hop anchors to (client-visible vs
lab-inbound), and accept that the very first auto-reply has nothing to thread
to. That's a behavior decision, not a typo fix.

**Candidate fix (for later, needs a decision):**
- `inbound-reply`: store `email.messageId` (real) in `last_resend_message_id`,
  not `forwardData.id`. It already prefers `email.messageId` in In-Reply-To,
  which is correct.
- `send-notification`: drop the `<${threadId}@resend.dev>` construction; let
  the first hops thread by subject (Gmail already does this).

---

## Part B — README changes (do after the code fix)

File: `README.md`, section `## Client Project System (labs)`.

1. **Insert the Mermaid sequence diagram** directly above the
   `**Outbound (reply threading):**` paragraph. Diagram already drafted and
   reviewed against `inbound-reply/index.ts`. Layout approved.

2. **Actor label:** use `User` (the person at lab@flourcitylabs.com hitting
   send). Not "Admin", not "Lab operator", not "the code". Other end stays
   `Client`.

3. **Fix the Inbound paragraph discrepancy.** Current text wrongly claims the
   client auto-reply's reply-to is `reply+{quoteId}@flourcitylabs.com`. Actual:
   `send-notification/index.ts:117` sets `replyTo: FCL_EMAIL` (=
   `lab@flourcitylabs.com`). Replace the last sentence with:
   > The auto-reply's reply-to is `lab@flourcitylabs.com`. The
   > `reply+{quoteId}@flourcitylabs.com` threading address is introduced later,
   > on the first lab reply forwarded by `inbound-reply`.

   Don't touch the rest of the section.

## Deferred / noted, not in scope now
- `inbound-reply` hardcodes `author_role: 'lab'` for every message arriving at
  `reply+{quoteId}@` without checking the sender. Latent issue, not a doc or
  threading-header concern. Flagged only.
- Code says "Partner" for the client in places; README says "client." Keeping
  "Client" in the diagram to match the README.

## Also pending (separate)
- tl;dr reframe for the README (discuss after the above lands).
