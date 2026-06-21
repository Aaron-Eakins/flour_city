# Flour City Labs — Copy Review Brief

_Hand this document to Claude (or any chatbot) to start a copy and typography review session._

---

## Instructions for the chatbot

You are reviewing the copy for a small-business consulting website called **Flour City Labs**, based in Rochester, NY. The owner wants two things from this session:

1. **Copy review and integration plan.** The site is mid-rebrand. The primary service is now web and email consulting, but the site still has legacy 3D printing content that needs to be either integrated cleanly or made subordinate. Review the copy below, identify what's inconsistent, unclear, or weak, and propose revised copy that unifies the services under a coherent voice.

2. **Typography direction.** After reviewing the copy, suggest a type system for the site. The site currently uses Inter (sans) and JetBrains Mono (mono) loaded from Google Fonts. Tell the owner whether that pairing is correct for the brand, or recommend alternatives. Justify your choices.

**Output format:** Give revised copy section by section, with a short note explaining each change. Then give the type recommendation separately at the end. Keep everything actionable — the owner will take your output back to an engineer for implementation.

---

## Business context

**Flour City Labs** is a one-person consulting practice in Rochester, NY. The owner does web and email consulting for local small businesses — primarily email deliverability work (fixing SPF, DKIM, DMARC, DNS misconfigurations, spam blacklist issues). A secondary service is 3D printing (quoting and producing small-run parts).

The site started as a 3D printing portfolio. It was partially rebranded to lead with email/web consulting, but the process, materials, and heritage pages still read as if the main product is physical printing. The owner is not ready to remove 3D printing content entirely — it is a real secondary service — but needs the copy to make the hierarchy clear.

**The audience:** Rochester small-business owners who are not technical. They may not know what SPF or DKIM means. The headline copy can use those terms as signals of expertise, but the body copy needs to translate.

**Brand voice:** Direct. Craft-oriented. Rochester pride without being precious about it. No corporate fluff. The "making" theme (mills, precision, craft) is intentional and should be kept — it ties both services together.

**What the owner wants to keep:**
- The Rochester heritage positioning
- The "making is in our blood" theme
- The free audit offer as the primary CTA
- The QuoteLab (3D printing quote tool) as a secondary CTA

---

## Current site copy (verbatim, all visible text)

### Navigation

- Home · Audit · Materials · Process · Heritage · Contact
- Logo: **Flour City Labs** · Rochester, NY
- Nav CTA button: **QuoteLab**
- Sign In (auth)

---

### Home page

**Tag line (eyebrow):** Rochester, NY · Web & Email Consulting

**Headline:**
> WEB & EMAIL CONSULTING.

**Hero card labels (decorative):** SPF·DKIM / DMARC·MX

**Body paragraph:**
> Is your email ending up in spam? Are DNS records misconfigured? Most small businesses don't know what they're losing. I find what's broken and fix it.

**Primary CTA:** Get a Free Audit

---

**Section 2 — 3D Printing (immediately below the hero):**

**Eyebrow:** 3D Printing Services

**Heading:** The QuoteLab

**Subheading:** Upload your file. I'll review it and send you a quote within 24 hours.

_(The QuoteLab upload tool lives here — no further copy.)_

---

**Section 3 — Brand / Heritage callout:**

**Badge:** Our Mission

**Heading:**
> MAKING IS IN OUR BLOOD.

**Pull quote:**
> "Continuing Rochester's 200-year tradition of making things that work."

**Link:** Read the Archive

**Image caption:** Rochester DNA / Built to Last

---

### Heritage page

**Eyebrow:** The Archive

**Headline:** BUILT TO LAST.

**Subheading (italic):**
> "Continuing Rochester's 200-year tradition of making things that work."

**Timeline:**

**1817 — The Genesee Force**
Water-powered mills earned Rochester its name. Precision was measured in the turn of the stone.

**1850 — The Flower City**
As the mills moved west, Rochester turned to the earth. The region became the nursery capital of the country.

**1945 — The Technical Hub**
Rochester became the world's center for precision engineering, shifting from river power to the physics of light.

**2026 — The Digital Mill**
Flour City Labs continues that tradition layer by layer. Precise enough to function. Considered enough to display.

---

### Materials page

**Eyebrow:** What's in the Workshop

**Headline:** MATERIAL LIBRARY.

**Body:**
> The materials I keep stocked for most orders. More available on request.

**PLA Series** (badge: Aesthetic Focus)
> The go-to material for detailed visual models, prototypes, and anything where appearance matters more than strength.

Specs: Variates — Matte, Silk, Standard · Stability — Up to 55°C

**PETG Functional** (badge: Functional Focus)
> The right call when your part needs to handle heat, stress, or outdoor conditions.

Specs: Resilience — Chemical/Impact · Max Temp — Up to 80°C

Pull quote:
> "If your part needs to handle heat, stress, or outdoor conditions, PETG is the right call."

**Footer prompt:**
> Don't see what you need? I source materials on a per-project basis.

Button: **Send me a message**

---

### Process page

**Eyebrow:** Industrial Lifecycle

**Headline:** HOW THE LAB WORKS.

**Body:** Simple process. Careful work.

**Step 01 — Configuration**
Define your requirements using QuoteLab. Request Visual Validation if you want macro photos of the finished part before it ships.
Milestones: Secure Upload · Validation Check

**Step 02 — Lab Review**
Every file gets a personal review within 24 hours to make sure it's ready to print.
Milestones: File Review · Pricing Quote

**Step 03 — Production**
Your project enters the print queue with multi-color capability available on request.
Milestones: Queue Tracking · QC Checks

**Step 04 — Fulfilment**
Every order gets a final inspection before it's packaged for shipping. We ship nationwide.
Milestones: Secure Shipping · Regional Express

**Callout — A Note on File Health**
> I review every file before printing, but some geometry issues only surface during the print itself. If a failed print is traced back to the file, a $25 reset fee covers material and setup costs.

**Callout — Support Policy**
> All parts ship with supports intact. This protects delicate features during transit. Support removal and finishing services are available on a project-by-project basis.

---

### Contact page

**Eyebrow:** Rochester, NY

**Headline:** LET'S CONNECT.

**Body:**
> Based in Rochester, NY. Free initial audit — no obligation.

**Side panel — Direct Connection:**
- lab@flourcitylabs.com
- Rochester, NY

**Side panel — How It Works:**
> Drop me your domain. I'll check SPF, DKIM, DMARC, MX records, and spam blacklist status, then email you what's broken and how to fix it.

Badge: **First Audit Free**

**Form heading:** Free Audit Request

**Form intro:**
> Got a domain you'd like me to check? Email deliverability issue? Or just want to know if your setup is healthy? Send me a message.

Form placeholders: Full Name / Email Address / What can I help you with?

**Success message:** Inquiry Secured. I'll get back to you within 24 hours.

**Submit button:** Send Message

---

### Email Header Analyzer page (#audit)

**Eyebrow:** Email Deliverability

**Headline:** Header Analyzer

**Body:**
> Upload a .eml or .msg file, or paste raw headers. We parse the Received chain, verify DKIM / SPF / DMARC, and flag anything suspicious. Headers are analyzed in your browser. We save a summary of findings (no raw content).

**Upload zone:** Drop file here or click to browse (.eml · .msg)

**Paste field placeholder:** Paste raw email headers here...

**Button:** Analyze

**Results labels:** Received Chain · Authentication Results · Flags · Clean / [N] flag(s)

**Post-results CTA:**

Heading:
> Want a full deliverability audit?

Body:
> This tool reads the headers. A real audit goes deeper — SPF record inspection, DKIM key rotation, DMARC policy review, blacklist checks, and a plain-English action plan your team can actually implement.

Button: **Book a free audit**

---

### Footer

> Web & email consulting for Rochester small businesses.

> © 2026 FLOUR CITY LABS. BUILT IN ROCHESTER.
> lab@flourcitylabs.com

Links: Terms of Service · Privacy Policy

---

## Known issues to address

1. **The hero leads with email consulting, then immediately drops into a 3D printing tool.** The transition is jarring. Is there a better way to order this, or should the QuoteLab move off the home page entirely?

2. **The Process and Materials pages are 100% about 3D printing** but the nav label says "Process" with no qualifier. A visitor who arrives from an email-consulting search would find them confusing.

3. **The Heritage page ends with "The Digital Mill — layer by layer."** That language implies 3D printing. It should also apply to email/web work. Can you make the 2026 entry serve both services?

4. **The Email Analyzer page uses "we"** — the rest of the site is first-person singular ("I find what's broken"). Should it be "I" throughout?

5. **"QuoteLab" appears in the nav** for all visitors, including people who came for email consulting and have no idea what it is. The nav also lists "Materials" and "Process" with no context. Should the nav change?

---

## Typography context

The current fonts are:
- **Inter** (400/500/600/700/900) — used for all body and UI text
- **JetBrains Mono** (400/500/600) — used for technical labels, badge text, code snippets

The brand uses heavy uppercase italic for headlines (`font-black italic tracking-tighter`), a dark industrial palette (#1A1B1E near-black, #F2F1EF warm off-white, #D4A017 gold accent), and decorative all-caps mono labels for section eyebrows.

**Question for the chatbot:** Is Inter the right sans for this brand — industrial, craft, Rochester small business? Should the headline style use a different weight or a different face entirely? Is JetBrains Mono the right mono for the technical labels, or would something like IBM Plex Mono or Fira Code read better? Propose a final type system and explain why.
