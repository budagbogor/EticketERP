-- Fix car_brands: Restrict modifications to admin users only
DROP POLICY IF EXISTS "Authenticated users can delete car brands" ON public.car_brands;
DROP POLICY IF EXISTS "Authenticated users can insert car brands" ON public.car_brands;
DROP POLICY IF EXISTS "Authenticated users can update car brands" ON public.car_brands;

DROP POLICY IF EXISTS "Admins can delete car brands" ON public.car_brands;
CREATE POLICY "Admins can delete car brands" 
ON public.car_brands 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert car brands" ON public.car_brands;
CREATE POLICY "Admins can insert car brands" 
ON public.car_brands 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update car brands" ON public.car_brands;
CREATE POLICY "Admins can update car brands" 
ON public.car_brands 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix car_models: Restrict modifications to admin users only
DROP POLICY IF EXISTS "Authenticated users can delete car models" ON public.car_models;
DROP POLICY IF EXISTS "Authenticated users can insert car models" ON public.car_models;
DROP POLICY IF EXISTS "Authenticated users can update car models" ON public.car_models;

DROP POLICY IF EXISTS "Admins can delete car models" ON public.car_models;
CREATE POLICY "Admins can delete car models" 
ON public.car_models 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert car models" ON public.car_models;
CREATE POLICY "Admins can insert car models" 
ON public.car_models 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update car models" ON public.car_models;
CREATE POLICY "Admins can update car models" 
ON public.car_models 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix app_users: Remove password_hash column (Supabase Auth handles authentication)
ALTER TABLE public.app_users DROP COLUMN IF EXISTS password_hash;