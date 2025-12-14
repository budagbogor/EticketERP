-- Add sub_category column to social_complaints table
ALTER TABLE public.social_complaints 
ADD COLUMN IF NOT EXISTS sub_category TEXT;
