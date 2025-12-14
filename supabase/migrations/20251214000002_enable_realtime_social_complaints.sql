-- Enable Realtime for social_complaints table
-- Note: supabase_realtime publication exists by default in Supabase projects

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'social_complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_complaints;
  END IF;
END
$$;
