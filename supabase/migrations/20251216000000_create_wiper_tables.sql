-- Create wiper_specifications table
CREATE TABLE IF NOT EXISTS public.wiper_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_start INTEGER NOT NULL,
    year_end INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wiper_sizes table (one-to-many relationship with wiper_specifications)
CREATE TABLE IF NOT EXISTS public.wiper_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES public.wiper_specifications(id) ON DELETE CASCADE,
    position VARCHAR(20) NOT NULL CHECK (position IN ('kiri', 'kanan', 'belakang')),
    size_inch INTEGER NOT NULL,
    blade_brand VARCHAR(100),
    part_code VARCHAR(100),
    stock INTEGER,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wiper_specs_brand ON public.wiper_specifications(brand);
CREATE INDEX IF NOT EXISTS idx_wiper_specs_model ON public.wiper_specifications(model);
CREATE INDEX IF NOT EXISTS idx_wiper_specs_year_start ON public.wiper_specifications(year_start);
CREATE INDEX IF NOT EXISTS idx_wiper_specs_year_end ON public.wiper_specifications(year_end);
CREATE INDEX IF NOT EXISTS idx_wiper_sizes_spec_id ON public.wiper_sizes(specification_id);
CREATE INDEX IF NOT EXISTS idx_wiper_sizes_position ON public.wiper_sizes(position);

-- Enable Row Level Security
ALTER TABLE public.wiper_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiper_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies for wiper_specifications
-- Allow all authenticated users to read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_specifications' 
    AND policyname = 'Allow authenticated users to read wiper specifications'
  ) THEN
    CREATE POLICY "Allow authenticated users to read wiper specifications"
        ON public.wiper_specifications
        FOR SELECT
        TO authenticated
        USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_specifications' 
    AND policyname = 'Allow authenticated users to insert wiper specifications'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert wiper specifications"
        ON public.wiper_specifications
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_specifications' 
    AND policyname = 'Allow authenticated users to update wiper specifications'
  ) THEN
    CREATE POLICY "Allow authenticated users to update wiper specifications"
        ON public.wiper_specifications
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_specifications' 
    AND policyname = 'Allow authenticated users to delete wiper specifications'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete wiper specifications"
        ON public.wiper_specifications
        FOR DELETE
        TO authenticated
        USING (true);
  END IF;
END $$;

-- Create policies for wiper_sizes
-- Allow all authenticated users to read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_sizes' 
    AND policyname = 'Allow authenticated users to read wiper sizes'
  ) THEN
    CREATE POLICY "Allow authenticated users to read wiper sizes"
        ON public.wiper_sizes
        FOR SELECT
        TO authenticated
        USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_sizes' 
    AND policyname = 'Allow authenticated users to insert wiper sizes'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert wiper sizes"
        ON public.wiper_sizes
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_sizes' 
    AND policyname = 'Allow authenticated users to update wiper sizes'
  ) THEN
    CREATE POLICY "Allow authenticated users to update wiper sizes"
        ON public.wiper_sizes
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wiper_sizes' 
    AND policyname = 'Allow authenticated users to delete wiper sizes'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete wiper sizes"
        ON public.wiper_sizes
        FOR DELETE
        TO authenticated
        USING (true);
  END IF;
END $$;

-- Insert seed data
INSERT INTO public.wiper_specifications (id, brand, model, year_start, year_end, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Toyota', 'Avanza', 2004, 2011, NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Toyota', 'Avanza', 2012, 2018, 'Termasuk Veloz generasi awal'),
('550e8400-e29b-41d4-a716-446655440003', 'Toyota', 'Kijang Innova Reborn', 2016, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440004', 'Mitsubishi', 'Xpander', 2017, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440005', 'Honda', 'Brio', 2012, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440006', 'Honda', 'Jazz GE8', 2008, 2013, NULL),
('550e8400-e29b-41d4-a716-446655440007', 'Daihatsu', 'Terios', 2018, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440008', 'Suzuki', 'Ertiga', 2012, 2018, NULL),
('550e8400-e29b-41d4-a716-446655440009', 'Suzuki', 'Ignis', 2017, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440010', 'Nissan', 'Grand Livina', 2007, 2018, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wiper_sizes (specification_id, position, size_inch, blade_brand, part_code, stock, price)
SELECT v.specification_id, v.position, v.size_inch, v.blade_brand, v.part_code, v.stock, v.price
FROM (VALUES
-- Toyota Avanza Gen 1
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'kiri', 20, 'Universal', NULL, 6, 65000),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'kanan', 16, 'Universal', NULL, 8, 60000),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'belakang', 12, 'Universal', NULL, 4, 55000),
-- Toyota Avanza Gen 2
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'kiri', 24, 'Premium', NULL, 5, 85000),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'kanan', 14, 'Premium', NULL, 5, 80000),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'belakang', 12, 'Universal', NULL, 3, 60000),
-- Toyota Innova Reborn
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'kiri', 26, 'Premium', NULL, 2, 95000),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'kanan', 16, 'Premium', NULL, 2, 90000),
-- Mitsubishi Xpander
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'kiri', 24, 'OEM', NULL, 5, 90000),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'kanan', 16, 'OEM', NULL, 5, 88000),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'belakang', 12, 'Universal', NULL, 4, 65000),
-- Honda Brio
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'kiri', 22, 'Universal', NULL, 7, 75000),
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'kanan', 14, 'Universal', NULL, 7, 70000),
-- Honda Jazz GE8
('550e8400-e29b-41d4-a716-446655440006'::uuid, 'kiri', 24, 'Premium', NULL, 3, 90000),
('550e8400-e29b-41d4-a716-446655440006'::uuid, 'kanan', 14, 'Premium', NULL, 3, 85000),
('550e8400-e29b-41d4-a716-446655440006'::uuid, 'belakang', 14, 'Universal', NULL, 3, 70000),
-- Daihatsu Terios
('550e8400-e29b-41d4-a716-446655440007'::uuid, 'kiri', 24, 'OEM', NULL, 4, 88000),
('550e8400-e29b-41d4-a716-446655440007'::uuid, 'kanan', 14, 'OEM', NULL, 4, 84000),
('550e8400-e29b-41d4-a716-446655440007'::uuid, 'belakang', 12, 'Universal', NULL, 3, 65000),
-- Suzuki Ertiga
('550e8400-e29b-41d4-a716-446655440008'::uuid, 'kiri', 22, 'Universal', NULL, 6, 80000),
('550e8400-e29b-41d4-a716-446655440008'::uuid, 'kanan', 16, 'Universal', NULL, 6, 78000),
('550e8400-e29b-41d4-a716-446655440008'::uuid, 'belakang', 10, 'Universal', NULL, 4, 60000),
-- Suzuki Ignis
('550e8400-e29b-41d4-a716-446655440009'::uuid, 'kiri', 21, 'OEM', NULL, 4, 88000),
('550e8400-e29b-41d4-a716-446655440009'::uuid, 'kanan', 16, 'OEM', NULL, 4, 85000),
('550e8400-e29b-41d4-a716-446655440009'::uuid, 'belakang', 12, 'Universal', NULL, 3, 65000),
-- Nissan Grand Livina
('550e8400-e29b-41d4-a716-446655440010'::uuid, 'kiri', 24, 'Universal', NULL, 5, 85000),
('550e8400-e29b-41d4-a716-446655440010'::uuid, 'kanan', 16, 'Universal', NULL, 5, 80000),
('550e8400-e29b-41d4-a716-446655440010'::uuid, 'belakang', 12, 'Universal', NULL, 3, 65000)
) AS v(specification_id, position, size_inch, blade_brand, part_code, stock, price)
WHERE NOT EXISTS (
    SELECT 1 FROM public.wiper_sizes ws 
    WHERE ws.specification_id = v.specification_id 
    AND ws.position = v.position
);

-- Add comment to tables
COMMENT ON TABLE public.wiper_specifications IS 'Stores wiper blade specifications for different vehicle models';
COMMENT ON TABLE public.wiper_sizes IS 'Stores individual wiper sizes for each position (kiri, kanan, belakang)';
