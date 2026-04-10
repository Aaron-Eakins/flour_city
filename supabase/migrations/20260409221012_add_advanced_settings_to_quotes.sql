-- Add advanced engineering settings to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS nozzle TEXT,
ADD COLUMN IF NOT EXISTS infill TEXT,
ADD COLUMN IF NOT EXISTS walls TEXT,
ADD COLUMN IF NOT EXISTS speed TEXT,
ADD COLUMN IF NOT EXISTS resolution TEXT,
ADD COLUMN IF NOT EXISTS supports TEXT;
