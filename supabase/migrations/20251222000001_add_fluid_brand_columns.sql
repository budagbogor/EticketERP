ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS engine_oil_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS transmission_oil_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS power_steering_oil_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS brake_oil_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS radiator_coolant_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS ac_freon_recommended_brands TEXT;
