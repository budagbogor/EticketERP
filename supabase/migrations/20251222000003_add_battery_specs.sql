-- Add battery specification columns to vehicle_specifications table
ALTER TABLE vehicle_specifications 
ADD COLUMN IF NOT EXISTS battery_ampere INTEGER,
ADD COLUMN IF NOT EXISTS battery_voltage INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS battery_dimensions TEXT;
