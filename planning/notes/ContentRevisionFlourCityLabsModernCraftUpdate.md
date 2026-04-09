# Content Revision: Flour City Labs "Modern Craft" Update

**Instructions for the Implementation Agent:**
1. **Environment:** Before making any changes, create a new git branch named `content-refresh-2026`.
2. **Goal:** Replace existing website copy with the text provided below. 
3. **Constraints:** - Do NOT change any CSS, layout, or design elements. 
    - Maintain all existing internal links, form IDs, and API hooks (Supabase/Resend).
    - If a section below refers to a component you cannot find, look for the closest semantic match in the codebase.
4. **Outcome:** The user should be able to run this on `localhost` to preview the "I" and "You" tone before merging into `main`. Provide a summary of changed files.

---

## 1. Global Branding & Footer
**Objective:** Humanize the "Lab" and remove institutional jargon.

- **Site Title/Logo Area:** Flour City Labs (Keep brand name, remove any "Satellite" or "Sub-division" text).
- **Footer Location/Address:** - *Remove:* "FCL_LAB_1_SATELLITE" or any placeholder office addresses.
    - *Replace with:* "Rochester, NY | The Workshop"
- **Footer Bio:**
    - *Current:* "A cornerstone of additive innovation in the Flour City."
    - *New:* "A Rochester-based workshop focused on 3D printing, custom technical projects, and making things that work."

---

## 2. Home Page (Hero & Lead)
**Objective:** Lead with the solution, not the buzzwords.

- **Hero Headline:** - *Current:* "FCL_LAB_1: Premier Flour City Additive Manufacturing"
    - *New:* "Precise 3D Printing for Your Toughest Projects"
- **Hero Sub-headline:** - *Current:* "Leveraging cutting-edge technology to revolutionize the landscape of manufacturing."
    - *New:* "I help you turn digital files into high-quality physical parts. Whether it’s a one-off prototype or a custom replacement piece, I handle the printing so you can focus on the build."
- **Primary CTA Button:** "Have a file? Get a Quote"

---

## 3. "The Lab" -> "The Workshop" (About Section)
**Objective:** Establish founder authority as a "Maker" without claiming to be an engineering firm.

- **Section Header:** "Why Flour City Labs?"
- **Body Copy:** "I started Flour City Labs because I love the process of making. I’m a maker with a deep technical background and a focus on precision. When you send a file to a big print farm, you’re just another job in a queue. When you work with me, I’m the one checking the tolerances, calibrating the print settings, and ensuring the finish is right.

    I use a Bambu Lab P1S to produce parts that are ready to use the moment they’re off the plate. While I'm starting with 3D printing, this workshop is my home base for all kinds of technical experiments—from custom electronics to web design."

---

## 4. Service Specifics (3D Printing)
**Objective:** Practical data over "AI slop."

- **Headline:** "Current Capabilities"
- **Service Item 1 (Optimization):** "I don't just hit 'print.' I optimize orientation and support structures to ensure your part is as strong and clean as possible."
- **Service Item 2 (Prototyping):** "For iterative designs, I can provide photos of test fits before shipping, saving you time on the next version."
- **Service Item 3 (Finishing):** "I offer 'Ready-to-Paint' surface finishes for models and prototypes that need a professional aesthetic."

---

## 5. The "QuoteLab" (Forms)
**Objective:** Make the process feel collaborative.

- **Form Welcome/Instruction Text:** "Upload your STL or 3MF file below. I’ll review the geometry and get back to you with a quote and a projected timeline."
- **Action Buttons:** - Change "Initiate Order" or "Submit Request" to **"Send for Review"**
- **Form Dropdown Cleanup:** Ensure material descriptions are clear (e.g., "PLA: Standard prototyping," "PETG: Strength and Heat Resistance").

---

## 6. Technical Data (Materials Table)
**Objective:** Organize hard data for quick reference.

| Material | Best Use Case | Finish Type |
| :--- | :--- | :--- |
| **PLA** | Rapid prototypes, figurines, low-stress parts. | Matte / Silk |
| **PETG** | Mechanical parts, outdoor use, mild heat resistance. | Glossy / Semi-clear |
| **TPU** | Gaskets, dampeners, flexible cases. | Soft / Rubbery |
| **ASA** | UV resistant parts, structural outdoor components. | Professional Matte |

---

## 7. Banned Phrase Cleanup (Find and Replace)
**Agent: Scan all site files and remove/rewrite the following AI-diction:**

- **REDUCE/REMOVE:** "Delve into," "Unlock the power," "In today's digital age," "Tapestry of innovation," "Unparalleled excellence," "Bolster your project," "Cutting-edge."
- **REPLACE WITH:** Direct, active voice using "I" or "You."