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
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_created ON public.password_reset_attempts(email, created_at);

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

DROP TRIGGER IF EXISTS cleanup_reset_attempts_trigger ON public.password_reset_attempts;
CREATE TRIGGER cleanup_reset_attempts_trigger
AFTER INSERT ON public.password_reset_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_reset_attempts();

-- Fix storage policy: restrict attachment access to complaint owners
DROP POLICY IF EXISTS "Authenticated users view ticket attachments" ON storage.objects;

DROP POLICY IF EXISTS "Users can view relevant ticket attachments" ON storage.objects;
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