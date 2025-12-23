-- Add battery model column to vehicle_specifications table
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS battery_model TEXT;
