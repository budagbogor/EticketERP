-- Add tire_load_speed_index column to vehicle_specifications table
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS tire_load_speed_index TEXT;
