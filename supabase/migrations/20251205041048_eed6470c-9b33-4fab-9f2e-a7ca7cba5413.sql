-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaint_categories table
CREATE TABLE IF NOT EXISTS public.complaint_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel_types table
CREATE TABLE IF NOT EXISTS public.fuel_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transmission_types table
CREATE TABLE IF NOT EXISTS public.transmission_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_types ENABLE ROW LEVEL SECURITY;

-- Create SELECT policies (anyone authenticated can view)
DROP POLICY IF EXISTS "Anyone can view branches" ON public.branches;
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view complaint_categories" ON public.complaint_categories;
CREATE POLICY "Anyone can view complaint_categories" ON public.complaint_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view sub_categories" ON public.sub_categories;
CREATE POLICY "Anyone can view sub_categories" ON public.sub_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view fuel_types" ON public.fuel_types;
CREATE POLICY "Anyone can view fuel_types" ON public.fuel_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view transmission_types" ON public.transmission_types;
CREATE POLICY "Anyone can view transmission_types" ON public.transmission_types FOR SELECT USING (true);

-- Create admin-only INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Admins can insert branches" ON public.branches;
CREATE POLICY "Admins can insert branches" ON public.branches FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update branches" ON public.branches;
CREATE POLICY "Admins can update branches" ON public.branches FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete branches" ON public.branches;
CREATE POLICY "Admins can delete branches" ON public.branches FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert complaint_categories" ON public.complaint_categories;
CREATE POLICY "Admins can insert complaint_categories" ON public.complaint_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update complaint_categories" ON public.complaint_categories;
CREATE POLICY "Admins can update complaint_categories" ON public.complaint_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete complaint_categories" ON public.complaint_categories;
CREATE POLICY "Admins can delete complaint_categories" ON public.complaint_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert sub_categories" ON public.sub_categories;
CREATE POLICY "Admins can insert sub_categories" ON public.sub_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update sub_categories" ON public.sub_categories;
CREATE POLICY "Admins can update sub_categories" ON public.sub_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete sub_categories" ON public.sub_categories;
CREATE POLICY "Admins can delete sub_categories" ON public.sub_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert fuel_types" ON public.fuel_types;
CREATE POLICY "Admins can insert fuel_types" ON public.fuel_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update fuel_types" ON public.fuel_types;
CREATE POLICY "Admins can update fuel_types" ON public.fuel_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete fuel_types" ON public.fuel_types;
CREATE POLICY "Admins can delete fuel_types" ON public.fuel_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert transmission_types" ON public.transmission_types;
CREATE POLICY "Admins can insert transmission_types" ON public.transmission_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update transmission_types" ON public.transmission_types;
CREATE POLICY "Admins can update transmission_types" ON public.transmission_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete transmission_types" ON public.transmission_types;
CREATE POLICY "Admins can delete transmission_types" ON public.transmission_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_complaint_categories_updated_at ON public.complaint_categories;
CREATE TRIGGER update_complaint_categories_updated_at BEFORE UPDATE ON public.complaint_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_sub_categories_updated_at ON public.sub_categories;
CREATE TRIGGER update_sub_categories_updated_at BEFORE UPDATE ON public.sub_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_fuel_types_updated_at ON public.fuel_types;
CREATE TRIGGER update_fuel_types_updated_at BEFORE UPDATE ON public.fuel_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_transmission_types_updated_at ON public.transmission_types;
CREATE TRIGGER update_transmission_types_updated_at BEFORE UPDATE ON public.transmission_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();