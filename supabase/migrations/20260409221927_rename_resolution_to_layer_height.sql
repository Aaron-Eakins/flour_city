-- Rename resolution to layer_height for better clarity and industry alignment
ALTER TABLE public.quotes 
RENAME COLUMN resolution TO layer_height;
