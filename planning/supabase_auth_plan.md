# Supabase User Registration — Implementation Plan
**Flour City Labs** | Authored: 2026-04-06

---

## 1. Current State of Forms

### Contact Form (`ContactView.jsx`)
| Check | Status | Notes |
|---|---|---|
| HTML structure | ✅ Valid | Inputs, select, textarea, button all correct |
| Form `onSubmit` | ⚠️ Stubbed | `e.preventDefault()` only — data goes nowhere |
| Email field type | ✅ `type="email"` | Browser validation is active |
| `required` attributes | ❌ Missing | No fields marked required — form can be submitted empty |
| Submit button type | ⚠️ Missing `type="submit"` | Button has no `type` attr (defaults to submit, but be explicit) |
| Controlled inputs | ❌ Not connected | No `value`/`onChange` — form state is lost on submit |
| Backend / email delivery | ❌ Not wired | No service connected |

### QuoteLab / File Upload Form (`QuoteLab.jsx`)
| Check | Status | Notes |
|---|---|---|
| Step 1 – file upload | ✅ Reads file | Uses `FileReader`, stores base64 in React state |
| Step 2 – parameters | ✅ Controlled | All selects/inputs tied to `formData` |
| Step 3 – name + email | ✅ Controlled | `onChange` updates `formData` |
| `required` on name/email | ✅ Present | HTML `required` attr set |
| Step 4 – "TRANSMIT TO LAB" | ⚠️ Stubbed | `setQuoteStep(4)` only — no data is actually sent |
| File type validation | ❌ Missing | `accept` attr not set on `<input type="file">` |
| File size validation | ❌ Missing | No 50MB enforcement in JS |
| Malicious upload check | ❌ Missing | Any file type can be submitted |
| Backend submission | ❌ Not wired | No API call on step 3 submit |

---

## 2. What Needs to Be Linked (Backend Services)

### Option A — Resend (Email Delivery) — Recommended
Used to deliver the contact form and quote requests to `flourcitylabs@gmail.com`.
- Update the email throughout the site to `[flourcitylabs@gmail.com]`.

- **Sign up**: https://resend.com — free tier: 3,000 emails/month
- **API key**: Add to `.env` as `VITE_RESEND_API_KEY` (NOT safe to expose client-side — see note below) 
  - The env files should be on the gitignore file. 
  - These are notes from another ai. consider them and report back to me if you have any counterpoints or concerns: 
    -  Server-Side Execution Only: Ensure that any code calling the Resend API runs on the server. In a Vercel environment, this means using:
      - API Routes: (e.g., api/send-email.ts)
      - Server Actions: (if using Next.js)
      - SSR Functions: (like getServerSideProps)
- **A better pattern**: Call a Vercel Serverless Function or Supabase Edge Function that calls Resend server-side.

### Option B — Formspree (Simplest drop-in, no backend needed)
- Sign up at https://formspree.io, get a form endpoint like `https://formspree.io/f/xAbCdEfG`
- Change the form `action` attribute and drop `onSubmit` preventDefault
- Free tier: 50 submissions/month
- **Best for Contact Form only** (not the file upload flow)

### Option C — EmailJS (Client-side, no server)
- Works directly from the browser using template IDs
- Good for the contact form; not ideal for file uploads

**Recommendation**: Use **Formspree** for the Contact page. Use a **Supabase Edge Function + Resend** for the QuoteLab (since it includes file data).

---

## 3. Spam Prevention

### For Contact Form
1. **Honeypot field** — Add a hidden `<input name="_honey" style="display:none">` field. Bots fill it; humans don't. Check server-side before sending email.
2. **Rate limiting** — If using a serverless function, limit submissions per IP (e.g., 3 per hour via Upstash Redis or Supabase RLS).
3. **hCaptcha or Cloudflare Turnstile** — Privacy-first CAPTCHA alternatives to Google reCAPTCHA. Turnstile is invisible and free at: https://dash.cloudflare.com/turnstile
4. **Formspree built-in spam filter** — If using Formspree, spam filtering is included.

### For QuoteLab (File Upload)
- Requiring a **Supabase authenticated account** before uploading is the strongest spam/abuse deterrent available.
- No anonymous user should be able to submit a file to your pipeline.

---

## 4. Malicious File Upload Prevention

Even with Supabase auth gating uploads, you need defense-in-depth:

### Client-Side (First Line)
- Add `accept=".stl,.3mf,.obj"` to the `<input type="file">` element
- Enforce max size in the `handleFileChange` handler:
  ```js
  if (file.size > 50 * 1024 * 1024) {
      alert('File must be under 50MB');
      return;
  }
  ```
- Validate MIME type: `if (!['model/stl', 'application/octet-stream'].includes(file.type))`

### Server-Side (Critical — don't skip)
- Use a **Supabase Edge Function** to receive the file and validate:
  - Check magic bytes (first bytes of file) to confirm it's a real CAD format
  - Reject anything that doesn't match expected byte signatures
- Store uploads in a **private Supabase Storage bucket** (not public)
- Apply a **Supabase Storage RLS policy** so only authenticated users can write

### On Read/Download
- Never serve the uploaded file back with `Content-Disposition: inline`
- Always force download: `Content-Disposition: attachment`
- Consider scanning with an AV API (e.g., VirusTotal API or ClamAV via a serverless function) for high-value use cases

---

## 5. Supabase User Registration — Implementation Plan

### Why Require Auth Before Upload
- Prevents anonymous abuse of your pipeline
- Ties quotes to a real account (email verified)
- Enables order history, saved projects, and personalization later
- Required for Supabase Storage RLS to function correctly

---

### 5.1 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

Create `src/lib/supabaseClient.js`:
```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Add to `.env` (never commit this file):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### 5.2 Supabase Project Setup (Dashboard)

1. Create project at https://supabase.com
2. Enable **Email Auth** under Authentication → Providers
3. Configure email confirmation (recommended: ON for production)
4. Create a `profiles` table in the DB:
   ```sql
   create table profiles (
     id uuid references auth.users primary key,
     full_name text,
     created_at timestamp with time zone default now()
   );
   -- RLS
   alter table profiles enable row level security;
   create policy "Users can read/write their own profile"
     on profiles for all using (auth.uid() = id);
   ```
5. Create `quotes` Storage bucket (set to **private**)
6. Set Storage RLS:
   ```sql
   create policy "Authenticated users can upload"
     on storage.objects for insert
     with check (auth.role() = 'authenticated');
   ```

---

### 5.3 Auth Context (New File)

Create `src/context/AuthContext.jsx`:
```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = (email, password) => supabase.auth.signUp({ email, password });
    const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
    const signOut = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
```

Wrap `App` in `main.jsx`:
```jsx
import { AuthProvider } from './context/AuthContext';
// ...
<AuthProvider><App /></AuthProvider>
```

---

### 5.4 Auth Modal Component (New File)

Create `src/components/auth/AuthModal.jsx`

This modal handles both Sign Up and Sign In tabs. Key features:
- Tab toggle: Sign Up / Sign In
- Fields: Full Name (sign up only), Email, Password
- Error display
- "Email confirmation sent" state after sign-up
- Branded to FCL aesthetic (dark + gold)

State managed via `useAuth()` context.

---

### 5.5 Gate the QuoteLab Upload

Modify `QuoteLab.jsx` Step 1:
- Import `useAuth`
- If `!user`, show a CTA block instead of the file upload label:
  ```jsx
  if (!user) {
      return (
          <div className="text-center space-y-4 py-20">
              <Lock className="w-16 h-16 text-[#D4A017] mx-auto" />
              <h4>Create a Free Account to Upload</h4>
              <button onClick={() => setShowAuthModal(true)}>Sign Up / Sign In</button>
          </div>
      );
  }
  ```

---

### 5.6 File Upload to Supabase Storage (Replace FileReader)

In `handleFileChange`, replace the base64 FileReader approach with a direct Supabase Storage upload:

```js
const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Client-side validation
    const allowedTypes = ['model/stl', 'application/octet-stream'];
    const allowedExts = ['.stl', '.3mf', '.obj'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(ext)) { alert('Invalid file type.'); return; }
    if (file.size > 50 * 1024 * 1024) { alert('File must be under 50MB.'); return; }
    
    setIsUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('quotes')
        .upload(path, file);
    
    if (error) { alert('Upload failed: ' + error.message); setIsUploading(false); return; }
    
    setFormData({ ...formData, fileName: file.name, storagePath: data.path });
    setIsUploading(false);
    setQuoteStep(2);
};
```

---

### 5.7 Submit Quote Data to Supabase DB

On Step 3 "TRANSMIT TO LAB", instead of just `setQuoteStep(4)`, insert a row:

```js
const handleSubmit = async () => {
    const { error } = await supabase.from('quotes').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        material: formData.selectedMaterial,
        colors: formData.selectedColors,
        intent: formData.intent,
        visual_validation: formData.visualValidation,
        file_path: formData.storagePath,
        status: 'pending_review',
    });
    if (error) { alert('Submission failed.'); return; }
    setQuoteStep(4);
};
```

Create corresponding `quotes` table in Supabase:
```sql
create table quotes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    name text,
    email text,
    material text,
    colors text[],
    intent text,
    visual_validation boolean,
    file_path text,
    status text default 'pending_review',
    created_at timestamp with time zone default now()
);
alter table quotes enable row level security;
create policy "Users can insert their own quotes"
    on quotes for insert with check (auth.uid() = user_id);
create policy "Users can view their own quotes"
    on quotes for select using (auth.uid() = user_id);
```

---

### 5.8 Navigation Update

In `Navigation.jsx`:
- Show user avatar/email + **Sign Out** button when authenticated
- Show **Sign In** button when not authenticated (opens AuthModal)

---

## 6. Additional Considerations

### Environment Variables & Security
- Never put `VITE_SUPABASE_SERVICE_ROLE_KEY` in frontend code — that key bypasses all RLS
- The `VITE_SUPABASE_ANON_KEY` is safe to expose (it is governed by RLS)
- Add `.env` and `.env.local` to `.gitignore` ✅ (verify it's there)

### Email Notifications for New Quote Submissions
- Set up a **Supabase Database Webhook** on the `quotes` table INSERT event
- Route it to a Supabase Edge Function that calls Resend to email `flourcitylabs@gmail.com`
- This replaces the need for a backend server entirely

### Account Dashboard (Future)
- A `/dashboard` view showing the user's past quotes and their current `status`
- Could include a simple status pipeline: `pending_review → quoted → in_print → shipped`

### Vercel Environment Variables
- When deploying to Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project settings → Environment Variables panel

### Privacy Policy / TOS Already Exist
- You already have `PrivacyView.jsx` and `TOSView.jsx` — make sure they explicitly mention:
  - What user data is collected (name, email, uploaded files)
  - That files are stored securely and deleted after quote fulfillment
  - How long data is retained

---

## 7. Implementation Order (Recommended)

```
Phase 1 — Auth Foundation
  1. Install @supabase/supabase-js
  2. Create supabaseClient.js + .env
  3. Create AuthContext.jsx + wrap App
  4. Build AuthModal.jsx (sign up + sign in)
  5. Add Sign In button to Navigation

Phase 2 — Gate the Upload
  6. Modify QuoteLab step 1 to check auth
  7. Replace FileReader with Supabase Storage upload
  8. Enforce file type + size validation

Phase 3 — Persist Quotes
  9. Create quotes table in Supabase
  10. Wire "TRANSMIT TO LAB" to Supabase insert
  11. Create quotes Storage bucket + RLS policies

Phase 4 — Contact Form
  12. Choose Formspree (simple) or Edge Function (more control)
  13. Add honeypot + optional Turnstile CAPTCHA
  14. Wire form submission

Phase 5 — Notifications
  15. Set up Supabase DB webhook on quotes table
  16. Create Edge Function → Resend email to solutions@

Phase 6 — Polish
  17. Add .env vars to Vercel project
  18. Test full upload → quote → notification flow
  19. Review Privacy Policy + TOS wording
```
