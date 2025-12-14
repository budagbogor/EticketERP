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
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.social_complaints;
CREATE POLICY "Allow authenticated read access" ON public.social_complaints
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.social_complaints;
CREATE POLICY "Allow authenticated insert access" ON public.social_complaints
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update access" ON public.social_complaints;
CREATE POLICY "Allow authenticated update access" ON public.social_complaints
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.social_complaints;
CREATE POLICY "Allow authenticated delete access" ON public.social_complaints
    FOR DELETE TO authenticated USING (true);
