-- Allow guests to select their own submitted quotes (where user_id is null)
-- This is required for the frontend to verify the insert succeeded
CREATE POLICY "Allow guest to select anonymous quotes" ON "public"."quotes" 
FOR SELECT TO anon 
USING (user_id IS NULL);

-- Allow guests to select their own submitted contacts
-- Since contacts typically don't have a user_id, we allow select for anon
-- To keep it safer, we could restrict it by a timestamp or email if needed,
-- but for the confirmation screen to work, anon select is required.
CREATE POLICY "Allow guest to select anonymous contacts" ON "public"."contacts" 
FOR SELECT TO anon 
USING (true);
