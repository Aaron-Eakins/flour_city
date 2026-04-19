# Phase 1: MVP Quoting Workflow Execution Plan

## Objective
Implement a frictionless, guest-first quote request system by removing authentication barriers on the frontend and securing anonymous database and storage inserts.

## Files to Create/Modify
* `src/components/quote/QuoteLab.jsx`
* `supabase/migrations/<timestamp>_guest_quoting_rls.sql` (Create)
* `supabase/functions/send-notification/index.ts`

## Step-by-Step Instructions

1. **Update `QuoteLab.jsx` to Support Guest Uploads**
   * Edit `src/components/quote/QuoteLab.jsx` to remove the `!user` conditional block in Phase 1 (Project Entry) that displays "Identity Verification Required". The file upload interface should be visible by default regardless of authentication state.
   * Modify the `handleFileChange` function logic. Instead of relying on `user.id` for the Supabase Storage folder path, generate a unique ID (e.g., using `crypto.randomUUID()`) for anonymous users. Use this ID as the folder name.
   * Update the `handleTransmit` function's `INSERT` operation for the `quotes` table. Pass `user_id: user ? user.id : null` to support both authenticated and unauthenticated guests gracefully.

2. **Establish Guest RLS Policies via Migration**
   * Create a new migration file in `supabase/migrations/` using a generated timestamp.
   * Write SQL to drop existing restrictive INSERT policies on the `quotes` table (if any) and replace them with a policy allowing `anon` role insertions: `CREATE POLICY "Allow public inserts" ON "public"."quotes" FOR INSERT TO anon WITH CHECK (true);`.
   * Include a similar expansive policy for the `contacts` table to ensure the site's general contact form remains functional for guests.
   * *Note: Also ensure the `quotes` storage bucket allows `anon` uploads.*

3. **Refine Edge Function Email Templates**
   * Edit `supabase/functions/send-notification/index.ts`.
   * Remove references to `record.subject` in the `contacts` email template, as the `subject` column was removed in a recent database migration. Update the email title to a generic `"💬 LAB INQUIRY: New Message"`.
   * Verify the `quotes` table webhook payload formatting correctly aligns with the simplified table structure and successfully parses customer email receipts without failing.

## Verification
* **Frontend Verification:** Open the site in an incognito window, navigate to the Quote section, and verify the file upload prompt is accessible without logging in.
* **Database Verification:** Execute an anonymous quote submission with a sample `.stl` file. Open Supabase Studio to verify the upload succeeded in the `quotes` storage bucket and a new row was inserted into the `quotes` table with `user_id` as NULL.
* **Notification Verification:** Verify the local Supabase Edge function registers the trigger successfully from the database INSERT and initiates the Resend payload without formatting errors.
