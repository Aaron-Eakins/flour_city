-- Add status and tracking to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending Review',
ADD COLUMN IF NOT EXISTS last_resend_message_id TEXT;

-- Create Project Notes table
CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Note Policies
CREATE POLICY "Users can insert own notes" ON public.project_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notes" ON public.project_notes
    FOR SELECT USING (auth.uid() = user_id);

-- Ensure quotes are viewable by owners
-- Note: There might already be a policy, but we enforce this one for the dashboard
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id);
