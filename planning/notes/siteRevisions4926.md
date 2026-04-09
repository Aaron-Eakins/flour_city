## site.js + ContactView — Copy Update

### File 1: `src/constants/site.js`

Remove the `operationalProtocols` key from the `SITE_CONFIG` object entirely.

**Remove this line:**
operationalProtocols: 'FCL_LAB_1_SATELLITE',
---

### File 2: `src/views/ContactView.jsx`

In the `<header>` section, locate the `<p>` tag that references
`SITE_CONFIG.operationalProtocols`. Replace the entire element with:

**Remove:**
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Operating out of {SITE_CONFIG.operationalProtocols.replace('_', ' ')} in {SITE_CONFIG.region}'s {SITE_CONFIG.district}. Serving the nationwide additive community with regional dedication.</p>
```

**Replace with:**
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Based in Rochester, NY. Taking orders nationwide.</p>
```
## HomeView.jsx — Copy Update

### File: `src/views/HomeView.jsx`

---

**Change 1: Hero subparagraph**

Find:
```jsx
<p className="text-gray-400 text-lg max-w-md leading-relaxed border-l-2 border-[#D4A017] pl-6 font-medium">Boutique additive manufacturing for engineers and designers. We bridge digital intent and physical reality with expert human oversight.</p>
```

Replace with:
```jsx
<p className="text-gray-400 text-lg max-w-md leading-relaxed border-l-2 border-[#D4A017] pl-6 font-medium">Quality 3D printing for prototypes, custom parts, and one-off projects. Every order gets a personal review before it prints.</p>
```

---

**Change 2: CTA button text**

Find:
```jsx
<span>Enter QuoteLab</span>
```

Replace with:
```jsx
<span>Have a File? Get a Quote</span>
```

---

**Change 3: Mission section quote**

Find:
```jsx
<p className="text-gray-300 text-lg font-medium italic leading-relaxed text-left">"Continuing a two-hundred-year-old conversation about how things are made in the Flour City."</p>
```

Replace with:
```jsx
<p className="text-gray-300 text-lg font-medium italic leading-relaxed text-left">"Continuing Rochester's 200-year tradition of making things that work."</p>
```
## ProcessView.jsx — Copy Update

### File: `src/views/ProcessView.jsx`

---

**Change 1: Page subheading**

Find:
```jsx
<p className="text-gray-500 max-w-xl font-medium leading-relaxed text-lg text-left">A human-in-the-loop workflow designed to eliminate digital guesswork.</p>
```

Replace with:
```jsx
<p className="text-gray-500 max-w-xl font-medium leading-relaxed text-lg text-left">Simple process. Careful work.</p>
```

---

**Change 2: "The Technician's Shield" box — title and body**

Find:
```jsx
<h4 className="text-sm font-black uppercase tracking-widest italic">The Technician's Shield</h4>
```

Replace with:
```jsx
<h4 className="text-sm font-black uppercase tracking-widest italic">A Note on File Health</h4>
```

Find:
```jsx
<p className="text-xs text-slate-400 leading-relaxed font-medium">
    CAD structural integrity is the client's responsibility. Designs failing due to geometry constraints (non-manifold edges/thin walls) are subject to a **$25.00 Lab Reset Fee** to cover material and setup recovery.
</p>
```

Replace with:
```jsx
<p className="text-xs text-slate-400 leading-relaxed font-medium">
    I review every file before printing, but some geometry issues only surface during the print itself. If a failed print is traced back to the file, a $25 reset fee covers material and setup costs.
</p>
```

---

**Change 3: Support Policy box**

Find:
```jsx
All parts ship as **Raw Lab Output** with supports intact. This protects delicate features during transit. Premium finishing services for support removal are available on a project-by-project basis.
```

Replace with:
```jsx
All parts ship with supports intact. This protects delicate features during transit. Support removal and finishing services are available on a project-by-project basis.
```

---

**Change 4: Step descriptions — replace the entire steps array**

Find:
```jsx
{ id: "01", title: "Configuration", icon: <FileCode className="w-8 h-8" />, desc: "Define your requirements using QuoteLab. Opt for Visual Validation if you require macro photos before shipping.", items: ["Secure Upload", "Validation Check"] },
{ id: "02", title: "Lab Review", icon: <Eye className="w-8 h-8" />, desc: "Every project at Flour City Labs receives a dedicated review by a technician within 24 hours to validate buildability.", items: ["DFM Audit", "Pricing Quote"] },
{ id: "03", title: "Production", icon: <Cpu className="w-8 h-8" />, desc: "Your project enters our professional queue, utilizing AMS technology for multi-material fidelity.", items: ["Queue tracking", "QC checks"] },
{ id: "04", title: "Fulfilment", icon: <Truck className="w-8 h-8" />, desc: "Final inspection precedes protective packaging. We ship nationwide with zero-lead-time handoffs to courier networks.", items: ["Secure Shipping", "Regional Express"] }
```

Replace with:
```jsx
{ id: "01", title: "Configuration", icon: <FileCode className="w-8 h-8" />, desc: "Define your requirements using QuoteLab. Request Visual Validation if you want macro photos of the finished part before it ships.", items: ["Secure Upload", "Validation Check"] },
{ id: "02", title: "Lab Review", icon: <Eye className="w-8 h-8" />, desc: "Every file gets a personal review within 24 hours to make sure it's ready to print.", items: ["File Review", "Pricing Quote"] },
{ id: "03", title: "Production", icon: <Cpu className="w-8 h-8" />, desc: "Your project enters the print queue with multi-color capability available on request.", items: ["Queue Tracking", "QC Checks"] },
{ id: "04", title: "Fulfilment", icon: <Truck className="w-8 h-8" />, desc: "Every order gets a final inspection before it's packaged for shipping. We ship nationwide.", items: ["Secure Shipping", "Regional Express"] }
```
## ContactView.jsx — Copy Update

### File: `src/views/ContactView.jsx`

---

**Change 1: Header paragraph**

Find:
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Operating out of {SITE_CONFIG.operationalProtocols.replace('_', ' ')} in {SITE_CONFIG.region}'s {SITE_CONFIG.district}. Serving the nationwide additive community with regional dedication.</p>
```

Replace with:
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Based in Rochester, NY. Taking orders nationwide.</p>
```

---

**Change 2: Secure Logistics box**

Find:
```jsx
<p className="text-slate-400 text-xs font-medium leading-relaxed text-left">Every part is secured for cross-country transit. We utilize professional courier networks to ensure Rochester-built precision arrives intact at your door.</p>
```

Replace with:
```jsx
<p className="text-slate-400 text-xs font-medium leading-relaxed text-left">Every order is carefully packaged for transit. We ship nationwide through standard courier networks.</p>
```

---

**Change 3: "Active Pipeline" status badge**

Find:
```jsx
<span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Active Pipeline</span>
```

Replace with:
```jsx
<span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Orders Open</span>
```

---

**Change 4: Form title and subheading**

Find:
```jsx
<p className="text-gray-500 text-sm font-medium">Have questions about technical tolerances or custom Autodesk Fusion support? Ask a technician.</p>
```

Replace with:
```jsx
<p className="text-gray-500 text-sm font-medium">Questions about an order, a material, or a custom project? Send me a message.</p>
```

---

**Change 5: Remove subject dropdown**

Remove the entire `<select>` element and its options:
```jsx
<select 
    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]"
    value={formData.subject}
    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
>
    <option>General Engineering Question</option>
    <option>Specialized Prototyping Query</option>
    <option>Business/B2B Partnership</option>
    <option>Custom Engineering Validation</option>
</select>
```

Also remove `subject` from the `formData` state object and from the Supabase `insert` call in `handleSubmit`.

**Database note:** Remove the `subject` column from the `contacts` table in Supabase. Back it up first if any existing records have data in that column worth keeping.

---

**Change 6: Textarea placeholder**

Find:
```jsx
placeholder="HOW CAN THE LAB ASSIST?"
```

Replace with:
```jsx
placeholder="WHAT CAN I HELP YOU WITH?"
```

---

**Change 7: Success state message**

Find:
```jsx
<p className="text-sm text-gray-500 italic">Transmitting to Lab 1. A technician will respond shortly.</p>
```

Replace with:
```jsx
<p className="text-sm text-gray-500 italic">I'll get back to you within 24 hours.</p>
```

---

**Change 8: Error message**

Find:
```jsx
setErrorMessage('Transmission failed. The lab connection is unstable.');
```

Replace with:
```jsx
setErrorMessage(`Something went wrong. Please try again or email me directly at ${SITE_CONFIG.email}.`);
```

---

**Change 9: Loading button text**

Find:
```jsx
<span>{status === 'loading' ? 'Transmitting...' : 'Send Message'}</span>
```

Replace with:
```jsx
<span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
```
## MaterialsView.jsx — Copy Update

### File: `src/views/MaterialsView.jsx`

---

**Change 1: Eyebrow label**

Find:
```jsx
<span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Stocked for Quality</span>
```

Replace with:
```jsx
<span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">What's in the Workshop</span>
```

---

**Change 2: Header subparagraph**

Find:
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg">Curated high-performance polymers, optimized for our specialized hotends.</p>
```

Replace with:
```jsx
<p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg">The materials I keep stocked for most orders. More available on request.</p>
```

---

**Change 3: PLA description**

Find:
```jsx
<p className="text-slate-400 font-medium leading-relaxed">The industry standard for aesthetic precision. Ideal for high-detail visual models and architectural prototypes.</p>
```

Replace with:
```jsx
<p className="text-slate-400 font-medium leading-relaxed">The go-to material for detailed visual models, prototypes, and anything where appearance matters more than strength.</p>
```

---

**Change 4: PETG description**

Find:
```jsx
<p className="text-gray-500 font-medium leading-relaxed">Industrial toughness for parts subject to stress. Best for outdoor fixtures or heat-exposed prototypes.</p>
```

Replace with:
```jsx
<p className="text-gray-500 font-medium leading-relaxed">The right call when your part needs to handle heat, stress, or outdoor conditions.</p>
```

---

**Change 5: PETG pull quote**

Find:
```jsx
"If your part lives in a Rochester workshop or a car interior, PETG is our mandatory standard."
```

Replace with:
```jsx
"If your part needs to handle heat, stress, or outdoor conditions, PETG is the right call."
```

---

**Change 6: Add custom material note**

After the closing `</div>` of the materials grid and before the closing `</div>` of the main container, add:

```jsx
<p className="text-gray-500 text-sm font-medium mt-12">Don't see what you need? I source materials on a per-project basis. <a href="#contact" className="text-[#D4A017] hover:underline">Send me a message</a> and we'll figure it out.</p>
```

Note: If the contact page is handled via a view state rather than a route, replace `href="#contact"` with whatever the correct navigation method is for this codebase.