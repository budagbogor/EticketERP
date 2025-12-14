-- Add branch column to social_complaints table
ALTER TABLE public.social_complaints ADD COLUMN IF NOT EXISTS branch TEXT;
