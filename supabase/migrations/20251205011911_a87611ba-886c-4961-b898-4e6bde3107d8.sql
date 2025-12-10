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