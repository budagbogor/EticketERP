-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view complaint history" ON complaint_history;

-- Create a restricted policy that only allows users to view history for complaints they can access
DROP POLICY IF EXISTS "Users can view relevant complaint history" ON complaint_history;
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