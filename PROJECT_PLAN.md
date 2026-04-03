# Project Plan: 2026-04-02

## Codebase Summary

**Stack:** Next.js 16.2.2 (App Router) · React 19 · TypeScript · Prisma 5 · PostgreSQL (Neon Serverless) · Vercel Blob · Stripe · Resend · Three.js

**Deployment:** Vercel (serverless). All API routes are serverless functions. File uploads bypass the 4.5 MB limit via direct Vercel Blob client upload; the server receives a blob URL rather than the file itself.

**Architecture:** Standard Next.js App Router layout. Frontend communicates with backend via REST API routes under `/api/`. No server actions are in use. Prisma is the sole ORM — one singleton client at `src/lib/db.ts`. The quoting engine lives entirely in `src/lib/quoteEngine.ts` and is a pure function: it takes weight, time, and a pricing config object and returns a cost breakdown. It has no database or I/O dependencies.

**Slicer integration:** The app attempts to invoke Orca Slicer CLI (`orca-slicer`, configurable via `SLICER_PATH` env var) to extract weight and print time from uploaded STL/3MF files. This **does not work on Vercel** and falls back to file-size-based estimates: `weight = fileSizeMB * 15g`, `time = fileSizeMB * 0.4h`. This fallback is the production path for all current quotes.

**Current state:** Functional MVP. Customers can upload a file, receive an estimated quote, pay via Stripe, and receive email confirmation. The operator has a dashboard to view orders, update statuses, and configure pricing. Core architecture is sound but several significant gaps and security issues need to be resolved before the system is used for real orders.

---

## Red Flags

| # | Issue | Risk | Location |
|---|-------|------|----------|
| 1 | **No auth middleware.** The `/dashboard` page and all `/api/admin/*` routes check a cookie manually in each handler, but there is no Next.js middleware enforcing authentication. Any route that forgets the check is fully public. | HIGH | `src/app/api/admin/*/route.ts`, `src/app/dashboard/page.tsx` |
| 2 | **Default password is `password123`.** The `ADMIN_PASSWORD` env var falls back to this literal string if unset. If the env var is ever missing from a deployment, the dashboard is wide open with a known password. | HIGH | `src/app/api/admin/login/route.ts` |
| 3 | **Session cookie contains the raw password hash.** The `admin_session` cookie stores the result of `btoa(password)`, which is base64 — not a hash, just encoding. Anyone with the cookie value can trivially recover the password. Session tokens should be random, opaque, and validated server-side. | HIGH | `src/app/api/admin/login/route.ts` |
| 4 | **Slicer fallback is in production.** All quotes in the current deployment are using file-size estimates, not real slicer output. Customers are being quoted based on a rough heuristic. This is acceptable for an MVP but is the single biggest accuracy issue and should be surfaced clearly. | MEDIUM | `src/app/api/quote/route.ts` |
| 5 | **No rate limiting on `/api/quote` or `/api/upload`.** The quote endpoint downloads a blob, writes to disk, and optionally spawns a subprocess. An adversary can flood this with requests at zero cost. | MEDIUM | `src/app/api/quote/route.ts`, `src/app/api/upload/route.ts` |
| 6 | **`expiresAt` field exists on `Quote` but is never set or enforced.** Quotes never expire, so a customer could pay against a very old quote with stale pricing. | LOW | `prisma/schema.prisma`, `src/app/api/checkout/route.ts` |
| 7 | **Material lookup has a silent fallback chain.** If no material matches, the quote proceeds with `materialCostPerKg = undefined`, which will produce a `NaN` total. The lookup chain (exact → case-insensitive → first-word) masks data integrity problems. | LOW | `src/app/api/quote/route.ts` lines 156–171 |
| 8 | **Stripe is in test mode.** Live payments require production keys and a registered Stripe account. This is expected for an MVP but must be resolved before going live. | LOW | `.env` |

---

## Open Questions Resolved

### How is login currently built?
**Found in code.** `src/app/api/admin/login/route.ts`. It's a custom password check against an env var (`ADMIN_PASSWORD`). On success it sets an `httpOnly` cookie named `admin_session` for 8 hours. There is no external auth library — no NextAuth, no Lucia, no Clerk. Each admin API route manually reads and validates the cookie.

### Is there a mechanism to update the password, and is it exposed in the dashboard?
**Not implemented.** There is no password-change UI or API endpoint. Changing the password requires editing the `ADMIN_PASSWORD` environment variable in Vercel and redeploying.

### Is this secure enough for a single-operator admin dashboard?
**No, but it is repairable without a full auth rewrite.** The core password-check approach is acceptable for single-operator use. What needs to change: (1) add Next.js middleware to enforce auth on all `/dashboard` and `/api/admin/*` routes centrally; (2) fix the session cookie to use a random signed token, not an encoded password; (3) add a password-change form in the dashboard that updates the env var or a DB-stored hash; (4) remove the `password123` default. These are targeted fixes, not an architectural change.

### Is there a filament/materials database or is it hardcoded?
**Database-driven.** The `Material` model in Prisma holds all filament records. Operators add/edit/delete them through the dashboard.

### What fields currently exist for filament records?
`id` (CUID), `name` (string, unique), `costPerKg` (float), `enabled` (boolean), `createdAt`, `updatedAt`. That's it. Brand, model number, color name, color hex, SKU, and AMS slot are all absent.

### Is nozzle diameter represented anywhere as a pricing or configuration variable?
**No.** Nozzle diameter does not appear in the schema, the quoting engine, the API, or the dashboard. It is entirely absent and must be built from scratch.

---

## Feature Plan

---

### Phase 1: Foundation — Schema, Auth Hardening, Dashboard Basics

**Depends on:** Nothing. This must be completed before any other phase.

---

#### 1.1 Auth Hardening

**What is being built:**
- Next.js middleware that enforces authentication on all `/dashboard*` and `/api/admin/*` routes in one place, eliminating the per-route cookie check pattern
- A proper session mechanism: on login, generate a cryptographically random token (use `crypto.randomUUID()` or `crypto.getRandomValues`), store it server-side (either in the DB or in a short-lived in-memory store), and set an httpOnly cookie containing only the token
- A password-change form in the dashboard that hashes the new password with bcrypt and stores the hash in the database (not in an env var) — see note below
- Remove the `password123` fallback; fail loudly if no credential is configured

**Technical decisions made:**
- Single admin user. No multi-user, no roles.
- Store the admin credential hash in the `PricingConfig` table (add a `passwordHash` column) rather than env vars, so it can be changed at runtime.
- Use `bcrypt` (already available in the Node ecosystem) for password hashing.
- Session tokens stored in a new `AdminSession` table: `{ token: String @unique, expiresAt: DateTime }`. Middleware validates the cookie token against this table. Expired rows can be cleaned up lazily on login.
- Session lifetime: 8 hours (keep current behavior).

**Tasks:**
1. Add `passwordHash String?` to `PricingConfig` in `prisma/schema.prisma`.
2. Add `AdminSession` model: `id`, `token` (unique), `createdAt`, `expiresAt`.
3. Run `prisma migrate dev`.
4. Rewrite `src/app/api/admin/login/route.ts`: compare submitted password against `PricingConfig.passwordHash` using `bcrypt.compare`. If hash is null, fall back to `ADMIN_PASSWORD` env var for first-run bootstrapping only — log a warning. On success, insert an `AdminSession` row and set the cookie to the session token.
5. Add `src/middleware.ts`: match `/dashboard(.*)` and `/api/admin/(.*)`, read the `admin_session` cookie, look up the token in `AdminSession` where `expiresAt > now()`. Redirect to `/dashboard/login` if invalid.
6. Strip the manual cookie checks out of each `api/admin/*` route handler (they are now redundant).
7. Add `POST /api/admin/change-password`: accepts `{ currentPassword, newPassword }`, verifies current, hashes new with bcrypt, updates `PricingConfig.passwordHash`.
8. Add a password-change form to the dashboard UI.
9. On first deploy after this migration, the operator must set a password via the dashboard's new password-change form (or seed the hash manually via `prisma studio`). Document this in the README.

**Operator decision required:** None. Implementation is fully specified.

---

#### 1.2 Filament Schema Extension

**What is being built:**
The `Material` model is too thin to support the planned filament management features. It needs to be extended to hold brand/model/color data and to support future SKU-based data lookup.

**Technical decisions made:**
- Rename `Material` to `Filament` in the schema to be domain-accurate. **This is a breaking change** — all references to `material` in the API and quoting engine must be updated.
- SKU/manufacturer lookup is a future phase. The schema must accommodate it, but the lookup logic will not be built in Phase 1.
- Color is a property of a specific filament spool, not a separate top-level option. The existing standalone `Color` model should be **removed** in a later migration once filaments carry their own color data. In Phase 1, add the new fields to `Material` while leaving the `Color` model intact to avoid breaking the live quoting form. Phase 2 will migrate and remove `Color`.

**New fields to add to `Material`:**
```
brand           String?          // e.g., "Bambu Lab", "PolyTerra"
modelNumber     String?          // manufacturer's model/SKU string
colorName       String?          // human-readable color name, e.g., "Jade Green"
colorHex        String?          // hex color for UI swatch, e.g., "#4CAF50"
sku             String?          // barcode or order SKU
manufacturerId  String?          // external ID for future API lookup
materialType    String           // PLA, PETG, ABS, TPU, etc. — replaces `name` as the type field
amsSlot         Int?             // 1–4, nullable (null = not currently loaded)
```

**Note on naming:** Currently `name` on `Material` holds both the material type and any distinguishing label (e.g., "PLA", "ABS (Heat Resistant)"). After this migration, `materialType` carries the type, and the combination of `brand + colorName` identifies the specific spool. The `name` field can remain as an optional display-override or be deprecated.

**Tasks:**
1. Add all new fields to `Material` in `prisma/schema.prisma` — all nullable except `materialType`.
2. Run `prisma migrate dev`.
3. Update `src/app/api/quote/route.ts` material lookup to query by `materialType` (or `name` for backwards compat during transition).
4. Update the dashboard's material management UI to expose the new fields (brand, modelNumber, colorName, colorHex, amsSlot). Color hex should render as a color swatch in the UI.
5. Update `src/app/api/admin/options/route.ts` to handle the new fields in create/update operations.
6. **Do not remove the `Color` model yet.** That happens in Phase 2.

**Operator decision required:** None from a technical standpoint. However, the operator needs to re-enter or update their material records after this migration to populate the new fields.

---

#### 1.3 Nozzle Diameter as a Pricing Option

**What is being built:**
A new `NozzleDiameter` model and its integration into the quoting engine as a pricing multiplier.

**Technical decisions made:**
- Nozzle diameter is a **separate dimension** from quality/layer height. It is not a quality alias.
- The four options are: `0.2mm`, `0.4mm`, `0.6mm`, `0.8mm`. These are fixed — not operator-configurable as freeform text.
- `0.4mm` is the default. Selecting any other diameter applies a cost premium because a physical printhead swap is required.
- Premium is modeled as a flat fee (operator-configurable), not a percentage. Justification: the labor cost of a nozzle swap is roughly fixed regardless of print size.
- The `Quality` model continues to represent layer height / speed tier (Draft, Standard, Fine, Ultra Fine). These are orthogonal to nozzle diameter.

**New model:**
```prisma
model NozzleDiameter {
  id           String  @id @default(cuid())
  diameter     Float   // 0.2, 0.4, 0.6, 0.8
  label        String  // "0.2mm", "0.4mm", etc.
  isDefault    Boolean @default(false)
  swapFee      Float   @default(0.0)  // extra charge for non-default nozzle
  enabled      Boolean @default(true)
}
```

**Seed data (run as part of migration):**
```
0.2mm — swapFee: operator-set — enabled: true
0.4mm — swapFee: 0.00 — isDefault: true — enabled: true
0.6mm — swapFee: operator-set — enabled: true
0.8mm — swapFee: operator-set — enabled: true
```

**Quoting engine change:** Add `nozzleSwapFee: number` as a new cost component in the breakdown. It does not affect weight or time estimates — it's a flat addition.

**Tasks:**
1. Add `NozzleDiameter` model to `prisma/schema.prisma`.
2. Add `nozzleDiameter String @default("0.4mm")` to the `Quote` model.
3. Add `nozzleSwapFee Float @default(0.0)` to `Quote.breakdown` fields (as a top-level column like `electricityCost`).
4. Run `prisma migrate dev` with a seed for the four standard diameters.
5. Update `src/lib/quoteEngine.ts` to accept `nozzleSwapFee` and include it in the cost breakdown and total.
6. Update `src/app/api/quote/route.ts` to accept `nozzleDiameter` in the request body, look up the matching `NozzleDiameter` record, and pass `swapFee` to the engine.
7. Add a nozzle diameter selector to the customer-facing quoting form (dropdown or segmented button). Default to `0.4mm`.
8. Add nozzle diameter management to the dashboard: list the four diameters, allow the operator to set the swap fee for each and toggle enabled/disabled.
9. Update `/api/admin/options` to handle nozzle diameter CRUD or add a dedicated `/api/admin/nozzle-options` route.

**Operator decision required:** The operator must set the swap fee for 0.2mm, 0.6mm, and 0.8mm nozzles. This cannot be set by the dev team.

---

#### 1.4 Pricing Configuration Expansion

**What is being built:**
The `PricingConfig` model needs new fields to support AMS/multi-color pricing (Phase 2) and nozzle swap pricing (Phase 1.3). Adding all new config fields in Phase 1 prevents a second schema migration mid-project.

**New fields to add to `PricingConfig`:**
```
// Phase 2 prep — AMS/multi-color
purgeVolumePerTransitionCm3  Float  @default(1.5)  // estimated filament lost per color change
purgeWasteCostMultiplier     Float  @default(1.0)  // markup on wasted purge filament
primeTowerVolumePercent      Float  @default(0.05) // prime tower as % of total filament used

// Phase 3 prep — failure buffer refinement
multiColorFailureBufferExtra Float  @default(0.05) // extra buffer % for multi-color jobs

// Quoting metadata
quoteExpiryHours             Int    @default(72)   // hours before a quote expires
```

**Tasks:**
1. Add fields above to `PricingConfig` in `prisma/schema.prisma`.
2. Run `prisma migrate dev`.
3. Expose new fields in the dashboard config form with appropriate labels and tooltips.
4. Update `/api/admin/config` PATCH handler to accept and persist the new fields.

**Operator decision required:** None from the dev team. The operator will need to review defaults and adjust to their preferences.

---

### Phase 2: AMS and Multi-Color Printing

**Depends on:** Phase 1 (filament schema with `amsSlot` field, pricing config expansion).

---

#### 2.1 AMS Slot Tracking and Dashboard Display

**What is being built:**
The dashboard needs to show which filament is loaded in each of the 4 AMS slots, so the operator can keep the system in sync with the physical machine.

**Technical decisions made:**
- AMS slot assignment (`amsSlot: 1|2|3|4|null`) lives on the `Filament` (Material) record. A filament is "loaded" when its `amsSlot` is non-null.
- Only 4 slots are supported (the P1S AMS holds 4 spools). The schema enforces this at the application layer (validate that `amsSlot` is between 1 and 4 and that no two filaments share a slot before saving).
- The operator manually updates slot assignments when they physically swap spools. There is no automatic detection.

**Tasks:**
1. Add an "AMS Status" panel to the dashboard showing a 2×2 grid of the 4 slots. Each slot shows the loaded filament's brand, color name, color swatch (hex), and material type, or "Empty" if unassigned.
2. Allow slot assignment by editing a filament record: a dropdown for `amsSlot` (None, 1, 2, 3, 4). Saving a filament to a slot that is already occupied must warn the operator and offer to unassign the current occupant.
3. The AMS panel should be prominently displayed on the dashboard — it's operational information the operator references daily.

---

#### 2.2 Multi-Color Job Configuration

**What is being built:**
The quoting form needs to support multi-color jobs where the customer specifies which AMS-loaded filament(s) they want used.

**Technical decisions made:**
- For Phase 2, multi-color is defined as: one or more filament selections from the currently loaded AMS slots. The customer is not free-choosing arbitrary filaments — they choose from what is loaded.
- This is a deliberate constraint that keeps the workflow simple and operationally realistic. The operator loads the filaments they want to offer; customers choose from those.
- A single-color job is the default. The customer must explicitly add colors to unlock multi-color pricing.
- Multi-color is only available if at least 2 AMS slots are loaded and enabled.

**Quote model changes:**
```prisma
// Add to Quote model:
isMultiColor      Boolean  @default(false)
selectedSlots     Int[]    // AMS slot numbers used, e.g., [1, 3]
colorTransitions  Int      @default(0)  // number of filament changes during print
purgeWasteCost    Float    @default(0.0)
primeTowerCost    Float    @default(0.0)
```

**Tasks:**
1. Modify the customer quoting form: if multiple AMS slots are loaded, show a "Multi-Color" toggle. When enabled, replace the single color dropdown with a multi-select of currently loaded filaments (showing swatch + name).
2. Add a `colorTransitions` number input (default: auto-estimated as `selectedColors - 1`, but allow manual override since some designs may transition more).
3. Update `src/lib/quoteEngine.ts` to accept multi-color parameters:
   - `colorTransitions`: number of purge events
   - `purgeVolumePerTransitionCm3`: from `PricingConfig`
   - `primeTowerVolumePercent`: from `PricingConfig`
   - Calculate `purgeWasteMass = colorTransitions * purgeVolumePerTransitionCm3 * filamentDensity` (use 1.24 g/cm³ as PLA default, make this configurable per material type in a later phase)
   - Calculate `primeTowerMass = totalPrintMass * primeTowerVolumePercent`
   - Both waste masses are priced at the material's `costPerKg` rate
   - Apply `multiColorFailureBufferExtra` to the failure buffer for multi-color jobs
4. Update `/api/quote` to handle multi-color inputs.
5. Update the quote breakdown display to show purge waste and prime tower as separate line items so the customer understands the cost.
6. Update the `Quote` DB record to persist multi-color fields.

**Operator decision required:** The operator must set realistic values for `purgeVolumePerTransitionCm3` and `primeTowerVolumePercent` in the pricing config. The defaults (1.5 cm³ per transition, 5% prime tower) are reasonable starting points for PLA on a P1S but should be calibrated.

---

#### 2.3 Remove Standalone Color Model

**What is being built:**
The `Color` model (originally a freeform list of color names) is now superseded by per-filament color data. It should be removed.

**Technical decisions made:**
- After Phase 2.1 is live and the operator has populated filament records with color data, the standalone `Color` model becomes dead weight. Remove it.
- The customer quoting form color selection must switch from reading the `Color` table to reading loaded AMS filaments.

**Tasks:**
1. Verify through the dashboard that all materials have `colorName` populated.
2. Remove `Color` model from `prisma/schema.prisma`.
3. Remove `color String` from the `Quote` model, replacing with `selectedSlots Int[]`.
4. Remove color-related code from `/api/config`, `/api/admin/options`, dashboard config form, and the quoting form's color dropdown.
5. Run `prisma migrate dev`.

**Note:** This is a destructive migration. Back up the database before running it. All existing Quote records have a `color` string field that will be dropped — this is acceptable as those are historical records.

---

### Phase 3: File Safety and Build Plate Validation

**Depends on:** Phase 1. Phase 2 not required.

---

#### 3.1 File Validation Architecture

**What is being built:**
A validation pipeline that runs before a quote is accepted. Validation results are returned to the customer with actionable error messages and risk warnings.

**Technical decisions made:**
- Validation runs **server-side** in the `/api/quote` route, after the blob is downloaded and before the slicer or fallback estimator runs.
- Validation has two levels: **blocking** (file is rejected, no quote generated) and **warning** (quote is generated but risks are surfaced to the customer).
- The architecture is a simple array of validator functions with a standard interface. This makes it straightforward to add checks later.

**Validator interface:**
```typescript
interface ValidationResult {
  passed: boolean;
  level: 'error' | 'warning';
  code: string;       // machine-readable, e.g., "EXCEEDS_BUILD_VOLUME"
  message: string;    // human-readable
}

type Validator = (geometry: BufferGeometry) => ValidationResult[];
```

**Tasks:**
1. Create `src/lib/validators/` directory.
2. Create `src/lib/validators/index.ts` that exports `runValidators(geometry)` — collects results from all validators and returns `{ errors: ValidationResult[], warnings: ValidationResult[] }`.
3. Implement validator: `buildVolume.ts` — check that the bounding box of the geometry fits within 256 × 256 × 256 mm with a configurable safety margin (default: 5 mm on each side, making the effective envelope 246 × 246 × 246 mm). The margin should be a `PricingConfig` field. Add `buildVolumeSafetyMarginMm Float @default(5.0)` to `PricingConfig`.
4. Implement validator: `fileIntegrity.ts` — check that the parsed geometry has at least one face and no NaN vertices.
5. Implement validator: `wallThickness.ts` — flag as a **warning** if any bounding box dimension is under 1.2 mm (proxy for thin-wall risk; a real per-face check is out of scope for Phase 3).
6. Implement validator: `overhangs.ts` — not in scope for Phase 3. Create a stub that returns `[]` and note it for a future phase.
7. Update `src/app/api/quote/route.ts` to call `runValidators` after parsing the geometry (reuse the geometry already being parsed for Three.js rendering? No — the API route runs server-side without Three.js. Parse geometry server-side using a lightweight STL parser. Use `npm:stl-reader` or write a minimal binary STL parser — do not import Three.js into the API route).
8. If any `errors` are returned, respond with `HTTP 422` and the error list. Do not proceed to pricing.
9. If only `warnings` are returned, proceed with pricing but include warnings in the response.
10. Update the frontend quoting form to display blocking errors prominently and warnings as dismissible notices before showing the price.

**Operator decision required:** None technically. The safety margin default (5 mm) is a recommendation. The operator may want to adjust based on their slicing preferences.

---

#### 3.2 Build Plate Fit Display

**What is being built:**
When a file passes validation, the customer should see confirmation that the model fits the build plate, along with its dimensions.

**Tasks:**
1. Parse the bounding box dimensions during validation and include them in the quote API response: `{ dimensions: { x: number, y: number, z: number, unit: 'mm' } }`.
2. Display the dimensions in the quoting form's summary panel (e.g., "120mm × 85mm × 60mm — fits P1S build plate").
3. If a model is close to the limit (within 20% of any axis), add a visual indicator (yellow border on the dimension display).

---

### Phase 4: Multi-File Orders and Build Plate Organization

**Depends on:** Phase 1. Phase 2 recommended (for multi-color multi-file). Phase 3 strongly recommended (file validation should run on each uploaded file before it enters a build queue).

---

#### 4.1 Order / Job Data Model

**What is being built:**
The current system is one-file-per-quote. Multi-file orders require a new data model that groups files and build plates under a single customer order.

**Technical decisions made:**
- **Domain language:** This is a **Job** (the overall order) composed of one or more **Build Plates**. Each Build Plate holds one or more **Parts** (uploaded files, possibly with quantities). This terminology maps to how the operator and customer actually think about 3D printing.
- The existing `Quote` model represents a single-file quote. It should be preserved for historical records but superseded by the new model for new orders.
- A **Job** is the unit of checkout. A single Stripe session is tied to a Job. The customer pays once for the whole Job.
- A **BuildPlate** has a fixed capacity (256 × 256 × 256 mm on the P1S). Multiple parts are arranged on it.
- A **Part** is a reference to an uploaded file with a specified quantity. The same file can appear on multiple plates.
- Arrangement (how parts are positioned on a plate) is handled in Phase 4.3.

**New schema:**
```prisma
model Job {
  id            String      @id @default(cuid())
  customerEmail String?
  status        String      @default("DRAFT")  // DRAFT, QUOTED, PAID, PRINTING, SHIPPED
  totalCost     Float?
  stripeSessionId String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  expiresAt     DateTime?
  plates        BuildPlate[]
  notes         String?
}

model BuildPlate {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  plateIndex  Int      // 1, 2, 3... display order
  estimatedCost Float?
  parts       Part[]
}

model Part {
  id            String     @id @default(cuid())
  plateId       String
  plate         BuildPlate @relation(fields: [plateId], references: [id])
  blobUrl       String     // Vercel Blob URL
  fileName      String
  material      String
  nozzleDiameter String    @default("0.4mm")
  quantity      Int        @default(1)
  isMultiColor  Boolean    @default(false)
  selectedSlots Int[]
  colorTransitions Int     @default(0)
  weightGrams   Float?
  printTimeHours Float?
  validationErrors Json?   // store validation results
  estimatedCost Float?
  createdAt     DateTime   @default(now())
}
```

**Tasks:**
1. Add `Job`, `BuildPlate`, `Part` models to `prisma/schema.prisma`.
2. Run `prisma migrate dev`.
3. Keep the existing `Quote` model and its routes intact for now. New orders will use the Job system. Old quotes remain queryable.

---

#### 4.2 Multi-File Upload and Job Assembly UI

**What is being built:**
The customer-facing quoting form reimagined as a job builder: upload multiple files, configure each independently, organize into plates, and get a total quote.

**Technical decisions made:**
- Replace the current single-file quoting form with a **Job Builder** interface.
- The Job Builder has two columns: (left) an upload area and file list, (right) a build plate view showing how files are organized.
- Each uploaded file appears as a card in the file list. The customer configures it (material, nozzle, quantity, colors) inline on the card.
- The build plate view is initially a simple list of plates, each showing which files are assigned to it. Visual 2D bin-packing display is a stretch goal.
- Customers can manually assign files to plates using drag-and-drop or a plate dropdown per file. Auto-arrangement is handled separately (4.3).
- A **running total** updates as files are configured and validated.

**Tasks:**
1. Create `src/app/page.tsx` as the new Job Builder (or a new route, e.g., `/quote`, and redirect from `/`). **Do not delete the current page until the new flow is fully functional.**
2. Build a `FileCard` component: displays file name, 3D preview thumbnail, validation status, and configuration dropdowns (material, nozzle, quantity, AMS slots if multi-color).
3. Build a `BuildPlatePanel` component: displays plates as tabs or an accordion. Each plate shows its assigned files and an estimated fit status (based on bounding box sum — exact packing not required in Phase 4).
4. Build a `JobSummaryBar` (sticky bottom): shows total file count, total plate count, and total estimated cost. Has a "Get Quote" button that posts the full Job to the API.
5. Create `POST /api/jobs` route: accepts a job with nested plates and parts, runs validation on each part, runs the quoting engine on each part, calculates plate totals and job total, persists to the DB, returns `{ jobId, totalCost, breakdown }`.
6. Create `POST /api/checkout` (or update existing): accept `jobId` instead of `quoteId`. Create Stripe session for the job total.
7. Create `GET /api/jobs/[id]` for the success/status page.
8. Update the dashboard to list Jobs (not just Quotes). The Job view should show all plates and parts under each job. Status transitions apply to the whole Job.
9. Update email templates in `src/lib/email.ts` for Job-level confirmations (list all files, total cost).

**Operator decision required:** None from a technical standpoint. The operator needs to evaluate the Job Builder UX during testing and may have preferences about layout that should be incorporated before launch.

---

#### 4.3 Auto-Arrangement (Scoped Assessment)

**What is being built:**
An assessment of whether automatic build plate arrangement is achievable given the current slicer setup, and a minimal implementation if it is.

**Technical decisions made:**
- **The Orca Slicer CLI does not auto-arrange**. It slices a single file. True multi-file packing requires either: (a) pre-processing via a separate 2D/3D bin-packing algorithm, or (b) generating a multi-body 3MF and passing it to the slicer.
- **Phase 4 scope:** Implement a simple 2D bounding-box bin packer to suggest plate assignments. This is not a real nesting algorithm — it treats each part as a rectangle (its XY bounding box) and greedily packs them onto 256 × 256 plates. This is a reasonable heuristic for most jobs and can be replaced later.
- The output of auto-arrangement is a suggested plate assignment, not a visual layout. The customer sees "Plate 1: file_a.stl, file_b.stl" and "Plate 2: file_c.stl", not a visual preview of where parts sit on the plate.
- Customers can override the suggested arrangement manually.

**Tasks:**
1. Create `src/lib/platePacker.ts`: implement a greedy 2D bin packer. Input: array of `{ id, width, depth }` (bounding boxes in mm). Output: array of plate assignments `[{ plateIndex, partIds }]`. Use the 256 × 256 mm plate minus the safety margin from Phase 3.
2. Call `platePacker` in `POST /api/jobs` when the customer has not manually assigned plates. Include the suggested assignments in the response.
3. Add an "Auto-Arrange" button in the Job Builder UI that calls a client-side version of the packer (same logic, no API call) and updates the plate assignments.
4. Ensure manual overrides are preserved — auto-arrange only runs when explicitly triggered or when all parts are unassigned.

**Operator decision required:** None. This is a best-effort arrangement tool. If the operator wants true nesting for complex jobs, that requires a dedicated library (e.g., `svg-nest` adapted for 3D bounding boxes) and is out of scope for this project phase.

---

## Dependency Order Summary

```
Phase 1.1 (Auth)          ← No deps. Do first.
Phase 1.2 (Filament schema) ← No deps. Do alongside 1.1.
Phase 1.3 (Nozzle diameter) ← Needs 1.2 done.
Phase 1.4 (Pricing config expansion) ← No deps. Do alongside 1.1 and 1.2.

Phase 2.1 (AMS slots)     ← Needs 1.2.
Phase 2.2 (Multi-color quoting) ← Needs 1.2, 1.3, 1.4, 2.1.
Phase 2.3 (Remove Color model) ← Needs 2.2 live and data migrated.

Phase 3.1 (File validators) ← Needs 1.4 (safety margin config). Run alongside Phase 2.
Phase 3.2 (Dimension display) ← Needs 3.1.

Phase 4.1 (Job schema)    ← Needs Phase 1. Phase 2 recommended.
Phase 4.2 (Job Builder UI) ← Needs 4.1, 3.1.
Phase 4.3 (Auto-arrange)  ← Needs 4.2.
```

---

## Decisions Reserved for the Operator

The following cannot be resolved by the dev team. Answers are needed before or during the indicated phase.

| Phase | Decision |
|-------|----------|
| 1.3 | Nozzle swap fee amounts for 0.2mm, 0.6mm, and 0.8mm |
| 1.4 | Review and confirm defaults for purge volume, prime tower volume, and multi-color failure buffer |
| 2.2 | Calibrated purge volume per transition for their specific filament combinations |
| 3.1 | Confirm 5mm build plate safety margin is appropriate for their slicing workflow |
| 4.2 | Review Job Builder UX layout before launch |
| All  | Set a real admin password and remove any test credentials before the first live order |
