-- Add engine_oil_replacement_interval_km to vehicle_specifications
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS engine_oil_replacement_interval_km TEXT;
