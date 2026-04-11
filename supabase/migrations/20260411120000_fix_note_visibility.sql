-- Fix note visibility to ensure project owners can see official Lab responses
DROP POLICY IF EXISTS "Users can view own notes" ON public.project_notes;
DROP POLICY IF EXISTS "Users can view all notes for their own quotes" ON public.project_notes;

CREATE POLICY "Users can view all notes for their own quotes" ON public.project_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quotes q 
            WHERE q.id = project_notes.quote_id 
            AND q.user_id = auth.uid()
        )
    );
