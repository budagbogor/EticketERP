-- Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.channels;
CREATE POLICY "Allow authenticated read access" ON public.channels
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.channels;
CREATE POLICY "Allow authenticated insert access" ON public.channels
    FOR INSERT TO authenticated WITH CHECK (true);

-- Seed default channels
INSERT INTO public.channels (name) VALUES
('Instagram'),
('Twitter/X'),
('Facebook'),
('TikTok'),
('YouTube'),
('WhatsApp'),
('Telegram'),
('Lainnya')
ON CONFLICT (name) DO NOTHING;
