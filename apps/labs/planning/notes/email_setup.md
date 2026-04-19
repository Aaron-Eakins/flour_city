# Flour City Labs: Email Architecture
**Goal:** Send and receive as lab@flourcitylabs.com using a personal Gmail inbox for $0/month.

## Architecture Overview
| Direction | Flow | Service Used |
| :--- | :--- | :--- |
| **Inbound** | lab@flourcitylabs.com -> Cloudflare -> Personal Gmail | Cloudflare Email Routing |
| **Outbound (Automated)** | App Code/Supabase -> Resend API -> Customer | Resend SDK |
| **Outbound (Manual)** | Gmail App -> Resend SMTP -> Customer | Gmail "Send Mail As" |

---

## Step 1: Cloudflare Configuration (Inbound & DNS)
Cloudflare serves as the DNS provider and the mail router for incoming messages.

1. **DNS Management:** Move domain DNS to Cloudflare to enable Web Application Firewall (WAF) and Email Routing.
2. **Email Routing Setup:**
   * Enable Email Routing in the Cloudflare Dashboard.
   * Add and verify your personal Gmail as a "Destination Address."
   * Create a "Custom Address" (lab@flourcitylabs.com) and point it to the verified Gmail.

---

## Step 2: Resend Configuration (Outbound & SMTP)
Resend provides the SMTP server and API for delivering emails.

1. **Domain Verification:** Add flourcitylabs.com in the Resend Dashboard.
2. **DNS Records:** Add the SPF, DKIM, and DMARC records provided by Resend into your Cloudflare DNS tab.
3. **API Credentials:** Generate a restricted API key for the application code.
4. **SMTP Details:** Note these for the Gmail setup:
   * **Host:** smtp.resend.com
   * **Port:** 465 (SSL) or 587 (TLS)
   * **User:** resend
   * **Password:** [Your Resend API Key]

---

## Step 3: Gmail Configuration (Interface)
This allows manual replies from within the Gmail UI using the lab alias.

1. **Add Custom Address:**
   * Navigate to Gmail Settings > Accounts and Import > Send mail as.
   * Click "Add another email address."
   * **Name:** Flour City Labs
   * **Email:** lab@flourcitylabs.com
   * **Treat as an alias:** UNCHECK this box (Prevents threading and "Sent on behalf of" issues).
2. **SMTP Authentication:** Enter the Resend SMTP credentials (Host, Port, User, API Key).
3. **Automatic Selection:** Under "Accounts and Import," select "Reply from the same address to which the message was sent."

---

## Technical Maintenance Notes

### Threading Integrity
By using Resend's SMTP and unchecking "Treat as an alias," Gmail preserves the In-Reply-To and References headers. This ensures manual replies from Gmail stay in the same conversation thread as automated quotes sent via the API.

### Authentication (SPF/DKIM/DMARC)
These records must be verified in Cloudflare before sending. Without them, outbound mail will likely be rejected by major providers (Google, Outlook, Yahoo) due to strict DMARC policies.

### Propagation
DNS changes may take 1-2 hours to propagate globally. Do not attempt the Gmail SMTP handshake until Resend confirms the domain is "Verified."

---
*Last Updated: April 2026*