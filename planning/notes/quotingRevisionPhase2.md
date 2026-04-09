# Phase 2 Implementation Plan: Hybrid Auth & Customer Portal

## Agent Directives
* **IDE Context:** Antigravity. 
* **Model Usage:** Utilize Gemini Pro for the architectural planning and database schema design. Ask for user permission to switch to Gemini Flash for the execution of the frontend components and edge function code.
* **Execution Rules:** Ask for explicit user permission before executing any database migrations or deploying edge functions. 

## Objective
Transition Flour City Labs from a manual quoting process to a fully integrated hybrid system. Users will still submit quotes as guests, but the admin quoting process will automatically generate user accounts, magic links, and direct customers to a secure portal for quote approval.

## Tech Stack Context
* **Frontend:** React (Vite-based)
* **Backend & Auth:** Supabase (PostgreSQL + GoTrue)
* **Email Delivery:** Resend
* **Serverless Logic:** Supabase Edge Functions (Deno)

## Architecture & Workflow

### 1. Database Schema Updates
* **Action:** Update the `quotes` table to include new columns:
    * `status` (enum or text: `pending_review`, `quote_ready`, `approved`, `rejected`, `in_production`)
    * `quoted_price` (numeric/decimal)
    * `admin_notes` (text)
    * `user_id` (UUID, foreign key to `auth.users`, nullable initially)

### 2. The Admin Dashboard (Frontend)
* **Action:** Create a protected `/admin` route accessible only to the FCL admin (enforced via Supabase Auth/custom claims or specific user UUID).
* **Features:**
    * A data table displaying all records from the `quotes` table.
    * A detail view for a specific quote to download files.
    * A form to input the `quoted_price`, add `admin_notes`, and update the `status` from `pending_review` to `quote_ready`.

### 3. The Automation Trigger (Edge Function)
* **Action:** Create a new (or update existing) Supabase Edge Function triggered by an `UPDATE` on the `quotes` table.
* **Logic:** When a quote `status` changes to `quote_ready`:
    1.  **Auth Check:** Check if the email associated with the quote exists in Supabase Auth.
    2.  **Account Creation:** If the user does not exist, use the Supabase Admin API to create a new user silently. Update the `quotes` table record with the new `user_id`.
    3.  **Magic Link Generation:** Generate a Supabase Magic Link for that user.
    4.  **Email Dispatch:** Use Resend to send an email: *"Your quote for [Project Name] is ready! The total is $[quoted_price]. Click here to securely log in to your Flour City Labs portal to view details and approve."*

### 4. The Customer Portal (Frontend)
* **Action:** Create a protected `/portal` or `/dashboard` route.
* **Authentication:** Handled automatically when the user clicks the Magic Link from their email.
* **Features:**
    * Displays a list of the user's quotes (filtered by their `user_id` via RLS).
    * A detail view for the specific quote showing the price and admin notes.
    * Action buttons: "Approve & Pay" (moves status to `approved` and routes to Stripe/payment) or "Decline/Request Changes".

## Required Tasks for Agent
1.  Design and execute the Supabase migration for the `quotes` table updates.
2.  Build the React components for the `/admin` dashboard.
3.  Write and deploy the `quote_ready` Deno Edge Function utilizing the Supabase Admin API and Resend.
4.  Build the React components for the customer `/portal` and handle the Magic Link routing.
5.  Establish rigorous RLS policies to ensure customers can only ever see their own quotes, and only the admin can update pricing.