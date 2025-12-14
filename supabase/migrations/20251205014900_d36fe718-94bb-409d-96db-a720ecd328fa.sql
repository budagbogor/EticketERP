-- Create car_brands table
CREATE TABLE IF NOT EXISTS public.car_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create car_models table
CREATE TABLE IF NOT EXISTS public.car_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.car_brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (brand_id, name)
);

-- Enable RLS
ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;

-- RLS policies for car_brands (public read, authenticated write)
DROP POLICY IF EXISTS "Anyone can view car brands" ON public.car_brands;
CREATE POLICY "Anyone can view car brands" ON public.car_brands
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert car brands" ON public.car_brands;
CREATE POLICY "Authenticated users can insert car brands" ON public.car_brands
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update car brands" ON public.car_brands;
CREATE POLICY "Authenticated users can update car brands" ON public.car_brands
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete car brands" ON public.car_brands;
CREATE POLICY "Authenticated users can delete car brands" ON public.car_brands
FOR DELETE TO authenticated USING (true);

-- RLS policies for car_models
DROP POLICY IF EXISTS "Anyone can view car models" ON public.car_models;
CREATE POLICY "Anyone can view car models" ON public.car_models
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert car models" ON public.car_models;
CREATE POLICY "Authenticated users can insert car models" ON public.car_models
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update car models" ON public.car_models;
CREATE POLICY "Authenticated users can update car models" ON public.car_models
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete car models" ON public.car_models;
CREATE POLICY "Authenticated users can delete car models" ON public.car_models
FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_car_brands_updated_at ON public.car_brands;
CREATE TRIGGER update_car_brands_updated_at
BEFORE UPDATE ON public.car_brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_car_models_updated_at ON public.car_models;
CREATE TRIGGER update_car_models_updated_at
BEFORE UPDATE ON public.car_models
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data from CAR_BRANDS
INSERT INTO public.car_brands (name) VALUES
  ('Toyota'), ('Honda'), ('Suzuki'), ('Daihatsu'), ('Mitsubishi'),
  ('Nissan'), ('Mazda'), ('Hyundai'), ('KIA'), ('Wuling'),
  ('Mercedes-Benz'), ('BMW'), ('Audi'), ('Volkswagen'), ('Chevrolet'),
  ('Ford'), ('Jeep'), ('Isuzu'), ('Hino'), ('UD Trucks'),
  ('Lexus'), ('Mini'), ('Peugeot'), ('Renault'), ('MG'),
  ('Chery'), ('DFSK'), ('BYD')
ON CONFLICT (name) DO NOTHING;

-- Insert models for Toyota
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Avanza'), ('Innova'), ('Fortuner'), ('Rush'), ('Yaris'), ('Vios'), ('Camry'), ('Corolla Cross'), ('Raize'), ('Veloz'), ('Kijang'), ('Alphard'), ('HiAce'), ('Hilux'), ('Land Cruiser'), ('Agya'), ('Calya'), ('Supra'), ('GR86')) AS m(model)
WHERE b.name = 'Toyota'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Honda
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Brio'), ('Jazz'), ('City'), ('Civic'), ('Accord'), ('HR-V'), ('CR-V'), ('BR-V'), ('WR-V'), ('Mobilio'), ('Freed'), ('Odyssey'), ('CRF'), ('PCX'), ('Vario'), ('BeAT'), ('Scoopy')) AS m(model)
WHERE b.name = 'Honda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Suzuki
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Ertiga'), ('XL7'), ('Ignis'), ('Baleno'), ('Swift'), ('SX4 S-Cross'), ('Jimny'), ('APV'), ('Carry'), ('Karimun Wagon R'), ('S-Presso'), ('Grand Vitara')) AS m(model)
WHERE b.name = 'Suzuki'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Daihatsu
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Xenia'), ('Terios'), ('Rocky'), ('Sigra'), ('Ayla'), ('Gran Max'), ('Luxio'), ('Sirion'), ('Taft')) AS m(model)
WHERE b.name = 'Daihatsu'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Mitsubishi
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Xpander'), ('Pajero Sport'), ('Triton'), ('Outlander'), ('Eclipse Cross'), ('Colt L300'), ('Fuso'), ('Delica')) AS m(model)
WHERE b.name = 'Mitsubishi'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Nissan
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Livina'), ('X-Trail'), ('Serena'), ('Terra'), ('Navara'), ('Kicks'), ('Magnite'), ('Leaf'), ('GT-R')) AS m(model)
WHERE b.name = 'Nissan'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Mazda
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Mazda2'), ('Mazda3'), ('Mazda6'), ('CX-3'), ('CX-30'), ('CX-5'), ('CX-8'), ('CX-9'), ('MX-5')) AS m(model)
WHERE b.name = 'Mazda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Hyundai
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Creta'), ('Stargazer'), ('Santa Fe'), ('Palisade'), ('Ioniq 5'), ('Ioniq 6'), ('Kona'), ('Staria'), ('H-1')) AS m(model)
WHERE b.name = 'Hyundai'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for KIA
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Seltos'), ('Sonet'), ('Carens'), ('Sportage'), ('Sorento'), ('EV6'), ('Carnival')) AS m(model)
WHERE b.name = 'KIA'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert models for Wuling
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Confero'), ('Almaz'), ('Cortez'), ('Air ev'), ('Formo'), ('BinguoEV')) AS m(model)
WHERE b.name = 'Wuling'
ON CONFLICT (brand_id, name) DO NOTHING;