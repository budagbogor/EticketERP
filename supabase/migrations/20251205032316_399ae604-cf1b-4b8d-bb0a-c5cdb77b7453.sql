-- Create complaints table to store ticket data
CREATE TABLE IF NOT EXISTS public.complaints (
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
DROP POLICY IF EXISTS "Authenticated users can view complaints" ON public.complaints;
CREATE POLICY "Authenticated users can view complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (true);

-- Staff can create complaints
DROP POLICY IF EXISTS "Staff can create complaints" ON public.complaints;
CREATE POLICY "Staff can create complaints"
ON public.complaints
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Staff can update their own complaints, admins can update all
DROP POLICY IF EXISTS "Users can update complaints" ON public.complaints;
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
DROP POLICY IF EXISTS "Admins can delete complaints" ON public.complaints;
CREATE POLICY "Admins can delete complaints"
ON public.complaints
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create complaint_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.complaint_history (
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
DROP POLICY IF EXISTS "Authenticated users can view complaint history" ON public.complaint_history;
CREATE POLICY "Authenticated users can view complaint history"
ON public.complaint_history
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create history entries
DROP POLICY IF EXISTS "Authenticated users can create history" ON public.complaint_history;
CREATE POLICY "Authenticated users can create history"
ON public.complaint_history
FOR INSERT
TO authenticated
WITH CHECK (true);