-- Add engine oil quality standard column to vehicle_specifications table
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS engine_oil_quality_standard TEXT;
