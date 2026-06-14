# Deploying fcl-email-analyzer

No Resend. No Supabase. Everything runs through Cloudflare.

---

## Prerequisites

- `flourcitylabs.com` must be using **Cloudflare nameservers** (DNS managed by CF).
  Check at: Cloudflare dashboard → your domain → Overview. If it says "Active" you're good.
- Node.js installed locally (you already have it — the slicer app uses it).

---

## Step 1 — Enable Cloudflare Email Routing

1. Cloudflare dashboard → select `flourcitylabs.com`
2. Left sidebar → **Email** → **Email Routing**
3. Click **Get started** (or **Enable Email Routing** if you see that)
4. Cloudflare will ask you to add some MX and TXT records — click **Add records automatically**
5. You'll be asked for a destination address to verify. Use `nicepen@gmail.com`.
   Cloudflare sends a verification email — click the link in it.
6. Once verified, Email Routing shows as **Enabled** on the dashboard.

> The destination address is just to activate Email Routing. The actual
> `analyze@` address will route to the Worker, not to Gmail.

---

## Step 2 — Authenticate Wrangler

In your terminal (from any directory):

```
npx wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account. Approve it.

---

## Step 3 — Install dependencies and deploy the Worker

```
cd apps/email-worker
npm install
npx wrangler deploy
```

Wrangler will print something like:

```
Deployed fcl-email-analyzer (0.12 sec)
  https://fcl-email-analyzer.<your-subdomain>.workers.dev
```

The workers.dev URL doesn't matter for this — the worker is triggered by inbound email, not HTTP.

---

## Step 4 — Add the Email Routing rule

This is what connects `analyze@flourcitylabs.com` to the Worker.

1. Cloudflare dashboard → `flourcitylabs.com` → **Email** → **Email Routing**
2. Click the **Routing rules** tab
3. Under **Custom addresses**, click **Create address**
4. Fill in:
   - **Email address:** `analyze`  (just the part before the @)
   - **Action:** `Send to a Worker`
   - **Worker:** `fcl-email-analyzer`
5. Click **Save**

---

## Step 5 — Verify the sending address

Cloudflare requires `analyze@flourcitylabs.com` to be listed as a verified sender
before a `send_email` binding without a fixed destination can use it.

1. Cloudflare dashboard → `flourcitylabs.com` → **Email** → **Email Routing** → **Settings** tab
2. Under **Verified Sender Addresses**, click **Add**
3. Enter `analyze@flourcitylabs.com` and save

Because the domain is on Cloudflare nameservers, no verification email is sent — it
activates immediately.

> **Do not** add `destination_address` to the `wrangler.toml` `[[send_email]]` block.
> That would lock replies to a single inbox. The service needs to reply to anyone.

---

## Step 6 — Confirm the send_email binding

The binding is declared in `wrangler.toml` and deploys automatically. Verify it landed:

1. Cloudflare dashboard → **Workers & Pages** → `fcl-email-analyzer`
2. Click **Settings** → **Bindings**
3. You should see a **Send Email** binding named `REPLY_SENDER` with no destination restriction
4. If it's missing: click **Add** → **Send Email** → Name: `REPLY_SENDER` → Save

---

## Step 7 — Test it

Send an email to `analyze@flourcitylabs.com` from any inbox. Subject doesn't matter.

Within a minute or two you should get a reply with:
- SPF / DKIM / DMARC results from your headers
- Live DNS checks for your sending domain
- A plain-English summary of what's broken (if anything)

Check the Worker logs if no reply comes:
1. Cloudflare dashboard → **Workers & Pages** → `fcl-email-analyzer`
2. Click **Logs** (or use `npx wrangler tail` in your terminal for live logs)

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| No reply, no log entries | Routing rule not saved or email went to spam |
| Log shows "Failed to send reply" | `REPLY_SENDER` binding missing, or `analyze@flourcitylabs.com` not in Verified Sender Addresses (Step 5) |
| Log shows "DNS lookup failed" | Transient CF DNS error — retry usually works |
| Reply arrives but DKIM says "could not check" | Your email client strips `DKIM-Signature` before sending (rare) |

---

## Redeploy after code changes

```
cd apps/email-worker
npx wrangler deploy
```

No dashboard changes needed for code-only updates.
