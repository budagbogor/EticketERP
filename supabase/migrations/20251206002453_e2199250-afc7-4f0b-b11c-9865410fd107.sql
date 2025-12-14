-- Create technical_reports table
CREATE TABLE IF NOT EXISTS public.technical_reports (
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
DROP POLICY IF EXISTS "Users can view relevant technical reports" ON public.technical_reports;
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

DROP POLICY IF EXISTS "Non-viewers can create technical reports" ON public.technical_reports;
CREATE POLICY "Non-viewers can create technical reports"
ON public.technical_reports
FOR INSERT
WITH CHECK (
    created_by = auth.uid()
    AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

DROP POLICY IF EXISTS "Non-viewers can update own technical reports" ON public.technical_reports;
CREATE POLICY "Non-viewers can update own technical reports"
ON public.technical_reports
FOR UPDATE
USING (
    created_by = auth.uid()
    AND NOT has_role(auth.uid(), 'viewer'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete technical reports" ON public.technical_reports;
CREATE POLICY "Admins can delete technical reports"
ON public.technical_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_technical_reports_updated_at ON public.technical_reports;
CREATE TRIGGER update_technical_reports_updated_at
BEFORE UPDATE ON public.technical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();