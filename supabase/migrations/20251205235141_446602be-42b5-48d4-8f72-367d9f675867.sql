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