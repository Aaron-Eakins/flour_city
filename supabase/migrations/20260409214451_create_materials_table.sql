-- Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_family TEXT NOT NULL,
    color_name TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    list_order INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.materials
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Insert initial data
INSERT INTO public.materials (material_family, color_name, stock, list_order, is_default)
VALUES 
    -- PLA - Matte
    ('PLA - Matte', 'Slate Grey', 10, 10, true),
    ('PLA - Matte', 'High Falls Ochre', 10, 11, false),
    ('PLA - Matte', 'Charcoal Black', 10, 12, false),
    ('PLA - Matte', 'Cloud White', 10, 13, false),
    ('PLA - Matte', 'Sage Green', 10, 14, false),
    
    -- PLA - Silk
    ('PLA - Silk', 'Antique Gold', 10, 20, false),
    ('PLA - Silk', 'Sterling Silver', 10, 21, false),
    ('PLA - Silk', 'Polished Copper', 10, 22, false),
    ('PLA - Silk', 'Deep Emerald', 10, 23, false),
    ('PLA - Silk', 'Ruby Red', 10, 24, false),
    
    -- PLA - Standard
    ('PLA - Standard', 'Signal Red', 10, 30, false),
    ('PLA - Standard', 'Royal Blue', 10, 31, false),
    ('PLA - Standard', 'Bright Yellow', 10, 32, false),
    ('PLA - Standard', 'Forest Green', 10, 33, false),
    ('PLA - Standard', 'Basic White', 10, 34, false),
    
    -- PETG - Functional
    ('PETG - Functional', 'Translucent Clear', 10, 40, false),
    ('PETG - Functional', 'Solid Black', 10, 41, false),
    ('PETG - Functional', 'Solid White', 10, 42, false),
    ('PETG - Functional', 'Industrial Grey', 10, 43, false);
