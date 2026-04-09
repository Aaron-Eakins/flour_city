# Phase 1 Implementation Plan: MVP Quoting Workflow

## Objective
Implement a frictionless, guest-first quote request system for Flour City Labs to enable immediate launch. Account creation is still an option if the user would like to do that, but they should be able to send a quote request and file without signing up first. 

## Tech Stack Context
* **Frontend:** React (Vite-based)
* **Backend & Auth:** Supabase (PostgreSQL)
* **Email Delivery:** Resend
* **Serverless Logic:** Supabase Edge Functions (Deno)

## Architecture & Workflow

### 1. Frontend: The Guest Form
* **Action:** Ensure the quote submission form at the `/quote` (or equivalent) route is fully accessible without an account.
* **Fields:** Name, Email, Upload File, Details/Intent.
* **Submission:** On "Submit Quote", perform a direct `INSERT` into the Supabase `quotes` table. 
* **UX:** Display a simple success state: *"Thank you for your request. We are reviewing your file and will be in touch shortly with an estimate."* No prompts to create an account. There should be an error message, which I think you already have in place, if the file is not the correct type. 

### 2. Backend: Supabase `quotes` Table
* **Action:** Verify the `quotes` table accepts unauthenticated (anon key) inserts via Row Level Security (RLS) policies, restricting users to only insert data, not read other quotes.

### 3. Notification System: Supabase Edge Function
* **Trigger:** The existing webhook listening for `INSERT` operations on the `quotes` table.
* **Action:** Ensure the Deno Edge Function (`supabase/functions/send-notification`) executes the following via the Resend API:
    * **Admin Email:** Sends the full quote details and a link/reference to the uploaded file to the FCL Admin email.
    * **Customer Email:** Sends a plain-text/simple HTML receipt to the customer's provided email confirming receipt of the file.

### 4. Admin Workflow (No Code Required)
* **Process:** No admin dashboard is to be built in this phase. The admin will use Supabase Studio directly to view the `quotes` table, download the customer's STL/3MF file, slice it for the P1S (factoring in PLA material costs), and manually reply to the customer's email with the final price and payment link.

## Required Tasks for Agent
1.  Review current frontend routing and components to ensure no auth walls block the quote form.
2.  Review RLS policies on the `quotes` and `contacts` tables to ensure secure guest insertions.
3.  Verify the `send-notification` Edge Function is correctly formatting the admin alert and customer receipt using the Resend integration.