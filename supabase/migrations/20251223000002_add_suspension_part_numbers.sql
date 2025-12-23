-- Add suspension part number columns to vehicle_specifications table
ALTER TABLE vehicle_specifications
ADD COLUMN IF NOT EXISTS shock_absorber_front TEXT,
ADD COLUMN IF NOT EXISTS shock_absorber_rear TEXT,
ADD COLUMN IF NOT EXISTS rack_end TEXT,
ADD COLUMN IF NOT EXISTS tie_rod_end TEXT,
ADD COLUMN IF NOT EXISTS link_stabilizer TEXT,
ADD COLUMN IF NOT EXISTS lower_arm TEXT,
ADD COLUMN IF NOT EXISTS upper_arm TEXT,
ADD COLUMN IF NOT EXISTS upper_support TEXT;
