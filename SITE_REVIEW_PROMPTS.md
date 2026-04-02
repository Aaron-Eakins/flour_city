# Flour City Prints — Improvement Prompts for Gemini Flash

> This is a Next.js 3D printing quote-and-order site. Each chunk below is a
> self-contained task. Work through them in order; each one references specific
> files. Do not make changes outside the files listed in each chunk.

---

## Chunk 1 — Remove Admin from public nav

**File:** `src/app/page.tsx`

The navigation bar has three links: Home, Order Status, Admin. Remove the "Admin"
link from the public nav entirely. Admin users access `/dashboard` directly by
typing the URL — there is no need to advertise it to customers.

Also fix the nav links to use Next.js `<Link>` from `next/link` instead of bare
`<a>` tags so navigation doesn't do full page reloads.

---

## Chunk 2 — Add trust signals to the hero

**File:** `src/app/page.tsx`

Below the three feature bullets (Instant Analysis / Local Production / Fast Shipping),
add a small social-proof bar. It should show three hard-coded stat chips:

- "500+ prints completed"
- "Rochester, NY based"
- "Bambu P1S fleet"

Style them like the existing feature bullets — small text, muted color, bullet
separator. No new components needed, just inline JSX in the existing hero div.

---

## Chunk 3 — Add pricing ballpark before upload

**File:** `src/app/page.tsx`

Below the upload dropzone (but only when `fileToUpload` is null), add a single
line of muted helper text:

> "Most prints run $3 – $40 depending on size and material."

Style it as `fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center',
marginTop: '0.75rem'`. This sets expectations before the user commits to uploading a file.

---

## Chunk 4 — Show selected config in quote result

**File:** `src/app/page.tsx`

When the quote result is displayed (the `quote` state is non-null), add a small
summary row above the cost breakdown showing:

- Material | Quality | Infill% | Color | Qty

Pull from the existing state variables: `material`, `quality`, `infill`, `color`,
`quantity`. Display them as a horizontal flex row of chips:
`background: rgba(255,255,255,0.05), padding: '4px 10px', borderRadius: '100px',
fontSize: '0.8rem'`.

---

## Chunk 5 — Add color swatches to color dropdown

**File:** `src/components/CustomDropdown.tsx`

The color dropdown currently shows color names as plain text. When the `label`
prop is `"Color"`, render a small 12×12px circle before each option label.
Map common color names to hex values:

```
Black → #1a1a1a, White → #f5f5f5, Gray → #808080,
Red → #ef4444, Blue → #3b82f6, Green → #22c55e,
Yellow → #eab308, Orange → #f97316, Purple → #a855f7,
Pink → #ec4899, Natural → #d4b896
```

For any name not in the map, use `#888888`. The circle should sit inline with
the text in both the trigger button and the dropdown list items.

---

## Chunk 6 — Fix Order Status page UX

**File:** `src/app/status/page.tsx`

Two fixes:

1. Change the placeholder text from `"e.g. clt..."` to `"Paste your order ID"`.
   Customers receive their order ID in their confirmation email — they don't know
   what "clt" means.

2. Add a short helper line below the input:
   `"Your order ID was emailed to you at checkout."` in muted small text.

---

## Chunk 7 — Fix Success page error state

**File:** `src/app/success/page.tsx`

When the page is accessed without a `?session_id=` query param (or with an invalid
one), it currently renders a raw error message. Replace that with a proper styled
error card that matches the site's dark glass aesthetic, showing:

- A warning icon (you can use a simple SVG or emoji ⚠️)
- Heading: "Session Not Found"
- Body: "This link may have expired. If you completed a purchase, check your email
  for your order confirmation."
- A "Return Home" button using the existing `btn-primary` class

---

## Chunk 8 — Add a footer

**File:** `src/app/page.tsx`

Add a simple footer at the bottom of the `<main>` element (after the upload
container div). It should contain:

- Left: "© 2025 Flour City Prints · Rochester, NY"
- Right: a mailto link "roc@flourcityprints.com" styled as muted text

Style: `width: 100%, padding: '2rem', display: flex, justifyContent: spaceBetween,
fontSize: '0.8rem', color: rgba(255,255,255,0.3), borderTop: '1px solid rgba(255,255,255,0.06)'`

Wrap it in a `<footer>` element.

---

## Chunk 9 — Fix mobile nav

**File:** `src/app/page.tsx`

The nav currently uses inline styles with no mobile breakpoints. The links get
cramped on 375px screens. Add a `<style>` block (you can use the existing
`dangerouslySetInnerHTML` style block at the bottom of the file) with:

```css
@media (max-width: 600px) {
  .fcp-nav-links { gap: 1rem !important; font-size: 0.8rem !important; }
  .fcp-hero-title { font-size: 2.8rem !important; }
}
```

Add `className="fcp-nav-links"` to the nav links container div, and
`className={styles.title + ' fcp-hero-title'}` to the h1.

Also remove the `<br/>` from inside the subtitle `<p>` — let it wrap naturally.

---

## Chunk 10 — Add "What happens next" to quote result

**File:** `src/app/page.tsx`

Between the cost breakdown box and the checkout button row, add a small info box:

```
📦 What to expect
• We'll start printing within 1 business day
• Most orders ship or are ready for local pickup within 3–5 days
• You'll get email updates at each stage
```

Style it: `background: rgba(99,102,241,0.08), border: '1px solid rgba(99,102,241,0.15)',
borderRadius: '8px', padding: '0.875rem 1rem', fontSize: '0.82rem',
color: rgba(255,255,255,0.6), lineHeight: 1.6`.

Use `<ul>` with `listStyle: none, padding: 0, margin: '0.5rem 0 0 0'` for the bullets.

---

## Chunk 11 — Fix mobile 2-column layout (cleanup)

**File:** `src/app/page.tsx` + `src/app/page.module.css`

The current mobile override for the 2-column quote layout is done via
`dangerouslySetInnerHTML`. Move this CSS rule into the existing `page.module.css`
file instead:

In `page.module.css`, add:
```css
@media (max-width: 800px) {
  .quoteGrid {
    grid-template-columns: 1fr !important;
  }
}
```

Then on the grid container div inside the `{fileToUpload && ...}` block, add
`className={styles.quoteGrid + ' glass animate-fade-in card-hover'}` and remove
the `dangerouslySetInnerHTML` style block (or just the `.glass` override from it,
keeping the `@keyframes spin` rule which is still needed).

---

## Priority order (biggest customer impact first)

1. Chunk 1 — Remove Admin from nav
2. Chunk 2 — Trust signals
3. Chunk 7 — Fix Success page crash
4. Chunk 10 — What happens next
5. Chunks 3–6, 8–9, 11 in any order
