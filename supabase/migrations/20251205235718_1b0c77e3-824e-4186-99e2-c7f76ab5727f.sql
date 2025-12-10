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