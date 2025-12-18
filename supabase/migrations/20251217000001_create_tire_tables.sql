--- Create tire_brands table
CREATE TABLE IF NOT EXISTS public.tire_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    logo VARCHAR(10),
    tier VARCHAR(20) CHECK (tier IN ('premium', 'mid', 'budget')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tire_products table
CREATE TABLE IF NOT EXISTS public.tire_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.tire_brands(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    types TEXT[] NOT NULL DEFAULT '{}',
    price_min NUMERIC(12, 2),
    price_max NUMERIC(12, 2),
    features TEXT[] DEFAULT '{}',
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    warranty VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tire_brands_slug ON public.tire_brands(slug);
CREATE INDEX IF NOT EXISTS idx_tire_brands_tier ON public.tire_brands(tier);
CREATE INDEX IF NOT EXISTS idx_tire_products_brand_id ON public.tire_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_tire_products_rating ON public.tire_products(rating);

-- Enable Row Level Security
ALTER TABLE public.tire_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_products ENABLE ROW LEVEL SECURITY;

-- Create policies for tire_brands
CREATE POLICY "Allow authenticated users to read tire brands"
    ON public.tire_brands
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert tire brands"
    ON public.tire_brands
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tire brands"
    ON public.tire_brands
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete tire brands"
    ON public.tire_brands
    FOR DELETE
    TO authenticated
    USING (true);

-- Create policies for tire_products
CREATE POLICY "Allow authenticated users to read tire products"
    ON public.tire_products
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert tire products"
    ON public.tire_products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tire products"
    ON public.tire_products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete tire products"
    ON public.tire_products
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert seed data for tire brands
-- Insert seed data for tire brands
INSERT INTO public.tire_brands (slug, name, country, logo, tier, description) VALUES
('bridgestone', 'Bridgestone', 'Jepang', '🅱️', 'premium', 'Produsen ban terbesar di dunia dengan teknologi mutakhir.'),
('dunlop', 'Dunlop', 'Inggris/Jepang', '🔵', 'premium', 'Pelopor ban pneumatik dengan heritage motorsport kuat.'),
('hankook', 'Hankook', 'Korea Selatan', '🔴', 'mid', 'Ban OEM untuk banyak pabrikan Eropa dengan kualitas tinggi.'),
('gt-radial', 'GT Radial', 'Indonesia', '🟢', 'mid', 'Produk Gajah Tunggal, pilihan value terbaik lokal.'),
('achilles', 'Achilles', 'Indonesia', '⚡', 'budget', 'Ban lokal berkualitas dengan harga terjangkau.'),
('accelera', 'Accelera', 'Indonesia', '🏁', 'budget', 'Pilihan ekonomis untuk penggunaan sehari-hari.')
ON CONFLICT (slug) DO NOTHING;

-- Insert seed data for tire products
-- First, ensure we don't insert duplicates by adding a UNIQUE constraint on (brand_id, name) if acceptable,
-- or by checking existence. For this migration, let's just insert if not exists.
INSERT INTO public.tire_products (brand_id, name, sizes, types, price_min, price_max, features, rating, warranty)
SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- Bridgestone products
    ('Turanza T005A', ARRAY['195/65R15', '205/55R16', '205/65R16', '215/55R17', '215/60R17', '225/45R18'], ARRAY['touring', 'all-season'], 850000, 1650000, ARRAY['Noise reduction', 'Wet grip excellence', 'Long mileage'], 4.7, '5 tahun'),
    ('Potenza RE004', ARRAY['195/50R16', '205/45R17', '215/45R17', '225/40R18', '235/40R18', '245/40R18'], ARRAY['performance'], 1100000, 2200000, ARRAY['Sports handling', 'Corner stability', 'Dry grip'], 4.8, '5 tahun'),
    ('Ecopia EP300', ARRAY['185/65R15', '195/65R15', '205/55R16', '205/65R16', '215/60R16'], ARRAY['all-season', 'touring'], 750000, 1400000, ARRAY['Fuel efficient', 'Eco-friendly', 'Low rolling resistance'], 4.5, '5 tahun'),
    ('Potenza Sport', ARRAY['225/45R17', '235/40R18', '255/35R19'], ARRAY['performance'], 2500000, 4000000, ARRAY['Maximum grip', 'Wet braking', 'Premium'], 4.9, '5 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'bridgestone'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
)

UNION ALL

SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- Dunlop products
    ('SP Sport Maxx 050+', ARRAY['205/45R17', '215/45R17', '225/45R17', '225/40R18', '235/40R18', '245/35R19'], ARRAY['performance'], 1050000, 2100000, ARRAY['Ultra-high performance', 'Precise steering', 'Motorsport DNA'], 4.7, '5 tahun'),
    ('Enasave EC300+', ARRAY['185/65R15', '195/65R15', '195/60R16', '205/55R16', '205/65R16', '215/60R16'], ARRAY['all-season', 'touring'], 700000, 1350000, ARRAY['Low fuel consumption', 'Quiet ride', 'Durability'], 4.4, '5 tahun'),
    ('Grandtrek AT5', ARRAY['215/70R16', '225/65R17', '235/60R18', '265/60R18', '265/65R17'], ARRAY['all-terrain'], 1200000, 2400000, ARRAY['Off-road capability', 'On-road comfort', 'All-weather'], 4.6, '5 tahun'),
    ('SP Sport LM705', ARRAY['185/65R15', '195/65R15', '205/55R16', '215/55R17', '215/60R16'], ARRAY['touring'], 800000, 1500000, ARRAY['Silent drive', 'Shinobi technology', 'Comfort'], 4.5, '5 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'dunlop'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
)

UNION ALL

SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- Hankook products
    ('Ventus Prime 3', ARRAY['195/55R16', '205/55R16', '205/50R17', '215/45R17', '225/45R17', '225/40R18'], ARRAY['performance', 'touring'], 850000, 1700000, ARRAY['OEM quality', 'Aqua groove', 'Noise optimized'], 4.6, '5 tahun'),
    ('Kinergy Eco 2', ARRAY['185/65R15', '195/65R15', '195/60R15', '205/55R16', '205/60R16', '215/60R16'], ARRAY['all-season'], 650000, 1250000, ARRAY['Eco-friendly', 'Fuel saving', 'Silent pattern'], 4.4, '5 tahun'),
    ('Dynapro AT2', ARRAY['215/70R16', '225/65R17', '235/65R17', '265/60R18', '265/65R17'], ARRAY['all-terrain'], 1100000, 2200000, ARRAY['3D sipe technology', 'Mud & snow', 'Long wear'], 4.5, '5 tahun'),
    ('Ventus S1 evo3', ARRAY['225/45R17', '225/40R18', '245/40R18', '255/35R19'], ARRAY['performance'], 1500000, 3000000, ARRAY['High speed stability', 'Ecological', 'Handling'], 4.7, '5 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'hankook'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
)

UNION ALL

SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- GT Radial products
    ('Champiro GTX Pro', ARRAY['185/65R15', '195/65R15', '195/55R16', '205/55R16', '205/65R16', '215/55R17'], ARRAY['touring', 'all-season'], 500000, 950000, ARRAY['Quiet comfort', 'All-season', 'Long mileage'], 4.3, '3 tahun'),
    ('SportActive 2', ARRAY['195/50R16', '205/45R17', '215/45R17', '225/45R17', '225/40R18', '235/40R18'], ARRAY['performance'], 650000, 1300000, ARRAY['High-speed stability', 'Sporty handling', 'Modern design'], 4.4, '3 tahun'),
    ('Savero SUV', ARRAY['215/70R16', '225/65R17', '235/60R18', '235/55R19', '265/60R18'], ARRAY['all-terrain', 'touring'], 750000, 1500000, ARRAY['SUV optimized', 'Comfort ride', 'Durability'], 4.2, '3 tahun'),
    ('Champiro Ecotec', ARRAY['175/65R14', '185/65R15', '195/65R15', '205/55R16'], ARRAY['all-season'], 450000, 850000, ARRAY['Eco friendly', 'Low silica', 'Fuel saving'], 4.2, '3 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'gt-radial'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
)

UNION ALL

SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- Achilles products
    ('ATR Sport 2', ARRAY['195/50R16', '205/45R17', '215/45R17', '225/45R17', '225/40R18', '235/35R19'], ARRAY['performance'], 550000, 1100000, ARRAY['Sporty look', 'Grip performance', 'Value for money'], 4.1, '2 tahun'),
    ('122', ARRAY['185/65R15', '195/65R15', '195/60R15', '205/55R16', '205/65R16', '215/60R16'], ARRAY['all-season', 'touring'], 400000, 800000, ARRAY['Economic choice', 'Daily driving', 'Reliable'], 4.0, '2 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'achilles'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
)

UNION ALL

SELECT 
    b.id,
    p.name,
    p.sizes,
    p.types,
    p.price_min,
    p.price_max,
    p.features,
    p.rating,
    p.warranty
FROM public.tire_brands b
CROSS JOIN LATERAL (
    VALUES
    -- Accelera products
    ('PHI R', ARRAY['195/50R16', '205/45R17', '215/45R17', '225/45R17', '225/40R18', '235/40R18'], ARRAY['performance'], 500000, 1000000, ARRAY['Racing style', 'Affordable sport', 'Wet traction'], 4.0, '2 tahun'),
    ('Eco Plush', ARRAY['185/65R15', '195/65R15', '195/60R16', '205/55R16', '205/65R16'], ARRAY['all-season'], 380000, 750000, ARRAY['Budget friendly', 'Fuel economy', 'Comfort'], 3.9, '2 tahun'),
    ('651 Sport', ARRAY['195/50R15', '205/45R17', '225/45R17', '235/40R18'], ARRAY['performance'], 600000, 1200000, ARRAY['Semi-slick', 'Track ready', 'budget performance'], 4.3, '2 tahun')
) AS p(name, sizes, types, price_min, price_max, features, rating, warranty)
WHERE b.slug = 'accelera'
AND NOT EXISTS (
    SELECT 1 FROM public.tire_products tp 
    WHERE tp.brand_id = b.id AND tp.name = p.name
);

-- Add comments
COMMENT ON TABLE public.tire_brands IS 'Stores tire brand information';
COMMENT ON TABLE public.tire_products IS 'Stores tire product details with brand relationship';
