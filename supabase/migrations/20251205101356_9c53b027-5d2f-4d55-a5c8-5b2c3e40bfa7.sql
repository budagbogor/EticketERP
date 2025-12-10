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