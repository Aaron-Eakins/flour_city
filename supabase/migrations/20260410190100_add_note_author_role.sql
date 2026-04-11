-- Add author_role to distinguish between Client and Lab messages
ALTER TABLE public.project_notes 
ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'client' CHECK (author_role IN ('client', 'lab'));

-- Ensure edge functions can accurately insert as 'lab'
-- The RLS policies might need adjustment if they are too strict
DROP POLICY IF EXISTS "Users can insert own notes" ON public.project_notes;
CREATE POLICY "Allow authenticated or service role inserts" ON public.project_notes
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );
