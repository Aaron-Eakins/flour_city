# Suggested Revisions from Competitive Analysis Report

Based on the research report comparing major platforms (Xometry, Craftcloud, Hubs) and local competitors, Flour City Prints (FCP) has a unique opportunity to lead the local Rochester market by simplifying the customer experience and offering transparency that others lack.

## 1. Core Differentiators (The "Gaps")

| Feature | Market State | FCP Action |
| :--- | :--- | :--- |
| **Instant Quoting** | Missing in local shops | **Strengthen.** Ensure the automated quote is robust and clearly messaged. |
| **Upfront Pricing** | Missing in ALL sites | **Innovate.** Publish "Starting at" or "Per-gram" rates on a public Pricing page to build trust before file upload. |
| **Local Pickup** | Missing in big platforms | **Leverage.** Highlight "Rochester Pickup" to save customers shipping costs and time. |
| **Speed** | 3-5+ day lead times | **Advertise.** Use the P1S speed to offer genuine "Same-Day/Next-Day" express tiers for simple parts. |

## 2. Database & Quoting Revisions

### A. Material Schema Extension
Add fields to support "ballpark" pricing and technical assistance:
- `basePrice`: Fixed setup fee per part (e.g., $10).
- `pricePerGram`: Material-specific rate.
- `suitabilityDescription`: Short text for the Material Wizard (e.g., "Good for outdoor/UV use").

### B. Accurate Volume Calculation
The current file-size heuristic (`weight = fileSizeMB * 15g`) is better than nothing but can be wildly inaccurate. 
- **Revision:** Implement a server-side STL parser to calculate the actual bounding box and mesh volume. This provides a professional "Instant DFM" feel.

### C. Logistics Fields
- `deliveryMethod`: Allow "Local Pickup" vs "Standard Shipping" in the checkout flow.
- `turnaroundTier`: Allow "Standard" (3 days) vs "Express" (24 hours) with a multiplier.

## 3. Design & UX Revisions

### A. Navigation Simplification
Follow the "5-item maximum" rule to keep the site approachable for non-engineers:
1. **Get a Quote** (Primary CTA)
2. **Materials** (Technical cards)
3. **How It Works** (3-step visual)
4. **Resources** (FAQ / Design Guide)
5. **About** (Local story + Rochester map)

### B. Material Selection Wizard
Instead of just a dropdown, create a mini-wizard:
- *Step 1:* Where will this be used? (Indoor, Outdoor, Mechanical)
- *Step 2:* Does it need to be flexible? (Rigid, Semi-Flex, Flexible)
- *Step 3:* Recommendation: "We suggest PETG. Here is why..."

### C. Branding & Trust
- Add "Printed in Rochester, NY" badges.
- Show the Bambu P1S printer: "Industrial quality, at home."
- Create a public `track/[orderId]` page to provide the "real-time" feel of major platforms.

## 4. SEO & Content Strategy

### Local Landing Pages
- Create a dedicated `/services/rochester-3d-printing` page targeting "3D printing service Rochester NY".

### Material Education
- Create guides focusing on "PETG for Prototyping" or "TPU for Gaskets" to capture long-tail search intent for the common materials we offer.

---

## Logic Audit & Self-Questioning

- **Is the "Wizard" too much friction?** No, as long as it's optional. A "Manual Select" button should always be available.
- **Is ballpark pricing risky?** Yes, if the final quote is much higher. We should use clear "Approximate" labeling and explain factors like "Support Material" and "Infill" that might increase the final cost.
- **Can we actually do Same-Day?** Yes, for small parts in stock materials. We should limit this to orders placed before 10 AM.
