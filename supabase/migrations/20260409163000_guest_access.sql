-- Allow guest inserts into quotes table
CREATE POLICY "Allow guest inserts on quotes" ON "public"."quotes" 
FOR INSERT TO anon 
WITH CHECK (true);

-- Allow guest inserts into contacts table
CREATE POLICY "Allow guest inserts on contacts" ON "public"."contacts" 
FOR INSERT TO anon 
WITH CHECK (true);

-- Ensure storage bucket 'quotes' allows anonymous uploads
-- This assumes the bucket already exists and RLS is enabled on storage.objects
-- We target the 'quotes' bucket based on its name
CREATE POLICY "Allow guest uploads to quotes bucket" ON storage.objects 
FOR INSERT TO anon 
WITH CHECK (bucket_id = 'quotes');
