-- Add media_attachments column to technical_reports table
ALTER TABLE public.technical_reports
ADD COLUMN media_attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the column structure
COMMENT ON COLUMN public.technical_reports.media_attachments IS 'Array of media attachments. Each item contains: {name: string, type: string, data: string (base64), size: number}';
