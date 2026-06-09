CREATE TABLE IF NOT EXISTS public.email_audits (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type   text CHECK (input_type IN ('file', 'paste')),
  hop_count    int,
  from_domain  text,
  flags        jsonb DEFAULT '[]',
  spf_result   text,
  dkim_result  text,
  dmarc_result text,
  dmarc_policy text
);

ALTER TABLE public.email_audits ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can submit an audit
CREATE POLICY "Allow anyone to insert audits"
  ON public.email_audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view their own submissions
CREATE POLICY "Users can view own audits"
  ON public.email_audits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
