-- Add transmission and engine_code columns to vehicle_specifications
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS transmission TEXT,
ADD COLUMN IF NOT EXISTS engine_code TEXT;
