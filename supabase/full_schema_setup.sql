-- Create social_complaints table
CREATE TABLE IF NOT EXISTS public.social_complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel TEXT NOT NULL,
    username TEXT NOT NULL,
    link TEXT,
    datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    complain_category TEXT NOT NULL,
    complain_summary TEXT NOT NULL,
    original_complain_text TEXT NOT NULL,
    contact_status TEXT NOT NULL DEFAULT 'Belum Dicoba',
    viral_risk TEXT NOT NULL DEFAULT 'Normal',
    follow_up_note TEXT,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.social_complaints ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all actions for authenticated users for now)
CREATE POLICY "Allow authenticated read access" ON public.social_complaints
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access" ON public.social_complaints
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON public.social_complaints
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON public.social_complaints
    FOR DELETE TO authenticated USING (true);
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'tech_support', 'psd', 'viewer');

-- Create users table for employee management
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nik TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  branch TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policy for reading users (all authenticated can read)
CREATE POLICY "Anyone can view users" 
ON public.app_users 
FOR SELECT 
USING (true);

-- Create policy for inserting users (anyone can insert for now - will be restricted later with admin role)
CREATE POLICY "Anyone can insert users" 
ON public.app_users 
FOR INSERT 
WITH CHECK (true);

-- Create policy for updating users
CREATE POLICY "Anyone can update users" 
ON public.app_users 
FOR UPDATE 
USING (true);

-- Create policy for deleting users
CREATE POLICY "Anyone can delete users" 
ON public.app_users 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_app_users_updated_at
BEFORE UPDATE ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial mock data
INSERT INTO public.app_users (nik, name, email, role, branch) VALUES
('160201011', 'Admin User', 'admin@mobeng.com', 'admin', 'Jakarta Pusat'),
('160201012', 'Staff User', 'staff@mobeng.com', 'staff', 'Jakarta Selatan'),
('160201013', 'Tech Support', 'tech@mobeng.com', 'tech_support', 'Bandung'),
('160201014', 'PSD User', 'psd@mobeng.com', 'psd', 'Surabaya');
-- Create car_brands table
CREATE TABLE public.car_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create car_models table
CREATE TABLE public.car_models (
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
CREATE POLICY "Anyone can view car brands" ON public.car_brands
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert car brands" ON public.car_brands
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update car brands" ON public.car_brands
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete car brands" ON public.car_brands
FOR DELETE TO authenticated USING (true);

-- RLS policies for car_models
CREATE POLICY "Anyone can view car models" ON public.car_models
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert car models" ON public.car_models
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update car models" ON public.car_models
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete car models" ON public.car_models
FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_car_brands_updated_at
BEFORE UPDATE ON public.car_brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  ('Chery'), ('DFSK'), ('BYD');

-- Insert models for Toyota
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Avanza'), ('Innova'), ('Fortuner'), ('Rush'), ('Yaris'), ('Vios'), ('Camry'), ('Corolla Cross'), ('Raize'), ('Veloz'), ('Kijang'), ('Alphard'), ('HiAce'), ('Hilux'), ('Land Cruiser'), ('Agya'), ('Calya'), ('Supra'), ('GR86')) AS m(model)
WHERE b.name = 'Toyota';

-- Insert models for Honda
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Brio'), ('Jazz'), ('City'), ('Civic'), ('Accord'), ('HR-V'), ('CR-V'), ('BR-V'), ('WR-V'), ('Mobilio'), ('Freed'), ('Odyssey'), ('CRF'), ('PCX'), ('Vario'), ('BeAT'), ('Scoopy')) AS m(model)
WHERE b.name = 'Honda';

-- Insert models for Suzuki
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Ertiga'), ('XL7'), ('Ignis'), ('Baleno'), ('Swift'), ('SX4 S-Cross'), ('Jimny'), ('APV'), ('Carry'), ('Karimun Wagon R'), ('S-Presso'), ('Grand Vitara')) AS m(model)
WHERE b.name = 'Suzuki';

-- Insert models for Daihatsu
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Xenia'), ('Terios'), ('Rocky'), ('Sigra'), ('Ayla'), ('Gran Max'), ('Luxio'), ('Sirion'), ('Taft')) AS m(model)
WHERE b.name = 'Daihatsu';

-- Insert models for Mitsubishi
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Xpander'), ('Pajero Sport'), ('Triton'), ('Outlander'), ('Eclipse Cross'), ('Colt L300'), ('Fuso'), ('Delica')) AS m(model)
WHERE b.name = 'Mitsubishi';

-- Insert models for Nissan
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Livina'), ('X-Trail'), ('Serena'), ('Terra'), ('Navara'), ('Kicks'), ('Magnite'), ('Leaf'), ('GT-R')) AS m(model)
WHERE b.name = 'Nissan';

-- Insert models for Mazda
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Mazda2'), ('Mazda3'), ('Mazda6'), ('CX-3'), ('CX-30'), ('CX-5'), ('CX-8'), ('CX-9'), ('MX-5')) AS m(model)
WHERE b.name = 'Mazda';

-- Insert models for Hyundai
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Creta'), ('Stargazer'), ('Santa Fe'), ('Palisade'), ('Ioniq 5'), ('Ioniq 6'), ('Kona'), ('Staria'), ('H-1')) AS m(model)
WHERE b.name = 'Hyundai';

-- Insert models for KIA
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Seltos'), ('Sonet'), ('Carens'), ('Sportage'), ('Sorento'), ('EV6'), ('Carnival')) AS m(model)
WHERE b.name = 'KIA';

-- Insert models for Wuling
INSERT INTO public.car_models (brand_id, name)
SELECT b.id, m.model FROM public.car_brands b
CROSS JOIN (VALUES ('Confero'), ('Almaz'), ('Cortez'), ('Air ev'), ('Formo'), ('BinguoEV')) AS m(model)
WHERE b.name = 'Wuling';
-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'tech_support', 'psd', 'viewer');

-- Create user_roles table (separate from app_users)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik text UNIQUE,
  name text NOT NULL,
  email text,
  branch text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'name', new.email), new.email);
  
  -- Assign default 'staff' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'staff');
  
  RETURN new;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for profile updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies for user_roles (only admins can modify, authenticated can view own)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop insecure policies on app_users
DROP POLICY IF EXISTS "Anyone can view users" ON public.app_users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.app_users;
DROP POLICY IF EXISTS "Anyone can update users" ON public.app_users;
DROP POLICY IF EXISTS "Anyone can delete users" ON public.app_users;

-- Create secure policies for app_users (only admins can access)
CREATE POLICY "Admins can view app_users" ON public.app_users
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert app_users" ON public.app_users
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app_users" ON public.app_users
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app_users" ON public.app_users
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- Fix car_brands: Restrict modifications to admin users only
DROP POLICY IF EXISTS "Authenticated users can delete car brands" ON public.car_brands;
DROP POLICY IF EXISTS "Authenticated users can insert car brands" ON public.car_brands;
DROP POLICY IF EXISTS "Authenticated users can update car brands" ON public.car_brands;

CREATE POLICY "Admins can delete car brands" 
ON public.car_brands 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert car brands" 
ON public.car_brands 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update car brands" 
ON public.car_brands 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix car_models: Restrict modifications to admin users only
DROP POLICY IF EXISTS "Authenticated users can delete car models" ON public.car_models;
DROP POLICY IF EXISTS "Authenticated users can insert car models" ON public.car_models;
DROP POLICY IF EXISTS "Authenticated users can update car models" ON public.car_models;

CREATE POLICY "Admins can delete car models" 
ON public.car_models 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert car models" 
ON public.car_models 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update car models" 
ON public.car_models 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix app_users: Remove password_hash column (Supabase Auth handles authentication)
ALTER TABLE public.app_users DROP COLUMN IF EXISTS password_hash;
-- Create complaints table to store ticket data
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  
  -- Vehicle info
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_plate_number TEXT,
  vehicle_vin TEXT,
  vehicle_odometer INTEGER,
  vehicle_transmission TEXT,
  vehicle_fuel_type TEXT,
  last_service_date TIMESTAMP WITH TIME ZONE,
  last_service_items TEXT,
  
  -- Complaint info
  branch TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  description TEXT NOT NULL,
  attachments TEXT[],
  status TEXT NOT NULL DEFAULT 'new',
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_department TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can view complaints
CREATE POLICY "Authenticated users can view complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (true);

-- Staff can create complaints
CREATE POLICY "Staff can create complaints"
ON public.complaints
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Staff can update their own complaints, admins can update all
CREATE POLICY "Users can update complaints"
ON public.complaints
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() 
  OR assigned_to = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'tech_support'::app_role)
);

-- Only admins can delete complaints
CREATE POLICY "Admins can delete complaints"
ON public.complaints
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create complaint_history table for tracking changes
CREATE TABLE public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES auth.users(id) NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view history
CREATE POLICY "Authenticated users can view complaint history"
ON public.complaint_history
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create history entries
CREATE POLICY "Authenticated users can create history"
ON public.complaint_history
FOR INSERT
TO authenticated
WITH CHECK (true);
-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaint_categories table
CREATE TABLE public.complaint_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_categories table
CREATE TABLE public.sub_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel_types table
CREATE TABLE public.fuel_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transmission_types table
CREATE TABLE public.transmission_types (
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
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Anyone can view complaint_categories" ON public.complaint_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view sub_categories" ON public.sub_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view fuel_types" ON public.fuel_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view transmission_types" ON public.transmission_types FOR SELECT USING (true);

-- Create admin-only INSERT/UPDATE/DELETE policies
CREATE POLICY "Admins can insert branches" ON public.branches FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update branches" ON public.branches FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete branches" ON public.branches FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert complaint_categories" ON public.complaint_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update complaint_categories" ON public.complaint_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete complaint_categories" ON public.complaint_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sub_categories" ON public.sub_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sub_categories" ON public.sub_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sub_categories" ON public.sub_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert fuel_types" ON public.fuel_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update fuel_types" ON public.fuel_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete fuel_types" ON public.fuel_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert transmission_types" ON public.transmission_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update transmission_types" ON public.transmission_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete transmission_types" ON public.transmission_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaint_categories_updated_at BEFORE UPDATE ON public.complaint_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sub_categories_updated_at BEFORE UPDATE ON public.sub_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fuel_types_updated_at BEFORE UPDATE ON public.fuel_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transmission_types_updated_at BEFORE UPDATE ON public.transmission_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments', 
  'ticket-attachments', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow anyone to view ticket attachments (public bucket)
CREATE POLICY "Anyone can view ticket attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'ticket-attachments');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own ticket attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Fix 1: Customer PII Exposure - Restrict complaints SELECT to relevant users
DROP POLICY IF EXISTS "Authenticated users can view complaints" ON complaints;
CREATE POLICY "Users can view relevant complaints" ON complaints FOR SELECT
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'tech_support'::app_role)
);

-- Fix 2: Audit Trail Manipulation - Restrict complaint_history INSERT
DROP POLICY IF EXISTS "Authenticated users can create history" ON complaint_history;
CREATE POLICY "Users create own history entries" ON complaint_history FOR INSERT
WITH CHECK (
  performed_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_id AND (
      c.created_by = auth.uid() OR
      c.assigned_to = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'tech_support'::app_role)
    )
  )
);

-- Fix 3: Make storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'ticket-attachments';

-- Update storage SELECT policy to require authentication
DROP POLICY IF EXISTS "Anyone can view ticket attachments" ON storage.objects;
CREATE POLICY "Authenticated users view ticket attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'ticket-attachments' AND
  auth.role() = 'authenticated'
);
-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view complaint history" ON complaint_history;

-- Create a restricted policy that only allows users to view history for complaints they can access
CREATE POLICY "Users can view relevant complaint history" ON complaint_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_history.complaint_id AND (
      c.created_by = auth.uid() OR
      c.assigned_to = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'tech_support'::app_role)
    )
  )
);
-- Update handle_new_user function to include branch from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email, branch)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email), 
    new.email,
    new.raw_user_meta_data ->> 'branch'
  );
  
  -- Determine role based on email or other criteria
  -- Use IF statement for specific admin emails
  IF new.email = 'admin@mobeng.com' OR new.email = 'budagbogor@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;

  -- Assign the determined role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, assigned_role);
  
  RETURN new;
END;
$$;
-- Update complaints SELECT policy to include psd and viewer
DROP POLICY IF EXISTS "Users can view relevant complaints" ON public.complaints;

CREATE POLICY "Users can view relevant complaints" ON public.complaints
FOR SELECT USING (
  (created_by = auth.uid()) OR 
  (assigned_to = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'tech_support'::app_role) OR
  has_role(auth.uid(), 'psd'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

-- Update complaint_history SELECT policy to include psd and viewer
DROP POLICY IF EXISTS "Users can view relevant complaint history" ON public.complaint_history;

CREATE POLICY "Users can view relevant complaint history" ON public.complaint_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_history.complaint_id
    AND (
      c.created_by = auth.uid() OR 
      c.assigned_to = auth.uid() OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'tech_support'::app_role) OR
      has_role(auth.uid(), 'psd'::app_role) OR
      has_role(auth.uid(), 'viewer'::app_role)
    )
  )
);
-- Update complaints INSERT policy to exclude viewer (viewer = read only)
DROP POLICY IF EXISTS "Staff can create complaints" ON public.complaints;

CREATE POLICY "Staff can create complaints" ON public.complaints
FOR INSERT WITH CHECK (
  NOT has_role(auth.uid(), 'viewer'::app_role)
);

-- Ensure viewer cannot update complaints (already excluded, but make explicit)
DROP POLICY IF EXISTS "Users can update complaints" ON public.complaints;

CREATE POLICY "Users can update complaints" ON public.complaints
FOR UPDATE USING (
  (
    (created_by = auth.uid()) OR 
    (assigned_to = auth.uid()) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'tech_support'::app_role) OR
    has_role(auth.uid(), 'psd'::app_role)
  )
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

-- Update complaint_history INSERT policy to exclude viewer
DROP POLICY IF EXISTS "Users create own history entries" ON public.complaint_history;

CREATE POLICY "Users create own history entries" ON public.complaint_history
FOR INSERT WITH CHECK (
  (performed_by = auth.uid()) 
  AND NOT has_role(auth.uid(), 'viewer'::app_role)
  AND EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = complaint_history.complaint_id
    AND (
      c.created_by = auth.uid() OR 
      c.assigned_to = auth.uid() OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'tech_support'::app_role) OR
      has_role(auth.uid(), 'psd'::app_role)
    )
  )
);
-- Create technical_reports table
CREATE TABLE public.technical_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    damage_analysis TEXT NOT NULL,
    repair_method TEXT NOT NULL,
    problem_parts TEXT,
    estimated_cost NUMERIC(15, 2),
    conclusion TEXT NOT NULL,
    recommendation TEXT,
    pic_name TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(complaint_id)
);

-- Enable RLS
ALTER TABLE public.technical_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view relevant technical reports"
ON public.technical_reports
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM complaints c
        WHERE c.id = technical_reports.complaint_id
        AND (
            c.created_by = auth.uid()
            OR c.assigned_to = auth.uid()
            OR has_role(auth.uid(), 'admin'::app_role)
            OR has_role(auth.uid(), 'tech_support'::app_role)
            OR has_role(auth.uid(), 'psd'::app_role)
            OR has_role(auth.uid(), 'viewer'::app_role)
        )
    )
);

CREATE POLICY "Non-viewers can create technical reports"
ON public.technical_reports
FOR INSERT
WITH CHECK (
    created_by = auth.uid()
    AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Non-viewers can update own technical reports"
ON public.technical_reports
FOR UPDATE
USING (
    created_by = auth.uid()
    AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can delete technical reports"
ON public.technical_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_technical_reports_updated_at
BEFORE UPDATE ON public.technical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create rate limiting table for password reset attempts
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only accessed via edge function with service role

-- Create index for efficient lookups
CREATE INDEX idx_password_reset_attempts_email_created ON public.password_reset_attempts(email, created_at);

-- Auto-cleanup old entries (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_reset_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_attempts
  WHERE created_at < now() - interval '24 hours';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_reset_attempts_trigger
AFTER INSERT ON public.password_reset_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_reset_attempts();

-- Fix storage policy: restrict attachment access to complaint owners
DROP POLICY IF EXISTS "Authenticated users view ticket attachments" ON storage.objects;

CREATE POLICY "Users can view relevant ticket attachments" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ticket-attachments' AND
    (
      -- Admins and tech_support can view all attachments
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'tech_support'::app_role) OR
      has_role(auth.uid(), 'psd'::app_role) OR
      has_role(auth.uid(), 'viewer'::app_role) OR
      -- Otherwise, check if user has access to the complaint
      EXISTS (
        SELECT 1 FROM complaints c
        WHERE name = ANY(c.attachments)
        AND (c.created_by = auth.uid() OR c.assigned_to = auth.uid())
      )
    )
  );
-- Add media_attachments column to technical_reports table
ALTER TABLE public.technical_reports
ADD COLUMN media_attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the column structure
COMMENT ON COLUMN public.technical_reports.media_attachments IS 'Array of media attachments. Each item contains: {name: string, type: string, data: string (base64), size: number}';
