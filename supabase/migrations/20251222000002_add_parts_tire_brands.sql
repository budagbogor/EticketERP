-- Add recommended brands columns for Tire
ALTER TABLE vehicle_specifications 
ADD COLUMN IF NOT EXISTS tire_recommended_brands TEXT;

-- Add recommended brands columns for Brakes
ALTER TABLE vehicle_specifications 
ADD COLUMN IF NOT EXISTS brake_pad_front_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS brake_pad_rear_recommended_brands TEXT;

-- Add recommended brands columns for Parts (Filters & Spark Plugs)
ALTER TABLE vehicle_specifications 
ADD COLUMN IF NOT EXISTS oil_filter_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS air_filter_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS cabin_filter_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS fuel_filter_recommended_brands TEXT,
ADD COLUMN IF NOT EXISTS spark_plug_recommended_brands TEXT;
