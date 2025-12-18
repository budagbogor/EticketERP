-- Delete all dummy data from technical_reports and social_complaints tables
-- This migration prepares the database for real production data

-- Delete all technical reports (this will cascade from complaints)
DELETE FROM public.technical_reports;

-- Delete all tickets/complaints
DELETE FROM public.complaints;

-- Delete all social media complaints
DELETE FROM public.social_complaints;

-- Reset sequences if needed (optional - uncomment if you want to reset IDs)
-- Note: UUIDs don't use sequences, so this is not needed for these tables

-- Add comment
COMMENT ON TABLE public.technical_reports IS 'Technical reports table - dummy data cleared on 2025-12-17';
COMMENT ON TABLE public.complaints IS 'Complaints table - dummy data cleared on 2025-12-17';
COMMENT ON TABLE public.social_complaints IS 'Social complaints table - dummy data cleared on 2025-12-17';
