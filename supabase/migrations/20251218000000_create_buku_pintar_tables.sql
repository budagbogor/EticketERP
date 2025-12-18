-- Create vehicle_specifications table for Buku Pintar
CREATE TABLE IF NOT EXISTS vehicle_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES car_brands(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    year_start INTEGER NOT NULL,
    year_end INTEGER,
    
    -- Engine specifications
    engine_type TEXT,
    engine_oil_capacity TEXT,
    engine_oil_type TEXT,
    transmission_oil_capacity TEXT,
    transmission_oil_type TEXT,
    power_steering_oil_capacity TEXT,
    power_steering_oil_type TEXT,
    brake_oil_type TEXT,
    radiator_coolant_capacity TEXT,
    radiator_coolant_type TEXT,
    ac_freon_capacity TEXT,
    ac_freon_type TEXT,
    
    -- Tire specifications
    tire_size_front TEXT,
    tire_size_rear TEXT,
    tire_pressure_front TEXT,
    tire_pressure_rear TEXT,
    
    -- Battery
    battery_type TEXT,
    
    -- Wiper specifications
    wiper_size_driver TEXT,
    wiper_size_passenger TEXT,
    wiper_size_rear TEXT,
    
    -- Filter and maintenance parts
    spark_plug_type TEXT,
    air_filter_type TEXT,
    cabin_filter_type TEXT,
    fuel_filter_type TEXT,
    oil_filter_type TEXT,
    
    -- Brake parts
    brake_pad_front_type TEXT,
    brake_pad_rear_type TEXT,
    brake_disc_front_type TEXT,
    brake_disc_rear_type TEXT,
    
    -- Suspension parts with recommended brands
    shock_depan_recommended_brands TEXT,
    shock_belakang_recommended_brands TEXT,
    rack_end_recommended_brands TEXT,
    tie_rod_recommended_brands TEXT,
    link_stabilizer_recommended_brands TEXT,
    lower_arm_recommended_brands TEXT,
    upper_arm_recommended_brands TEXT,
    upper_support_recommended_brands TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Ensure unique variant per brand/model combination
    UNIQUE(brand_id, model_id, variant_name, year_start)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicle_specifications_brand_model ON vehicle_specifications(brand_id, model_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_specifications_created_by ON vehicle_specifications(created_by);

-- Enable Row Level Security
ALTER TABLE vehicle_specifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read vehicle specifications" ON vehicle_specifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert vehicle specifications" ON vehicle_specifications;
DROP POLICY IF EXISTS "Allow users to update vehicle specifications" ON vehicle_specifications;
DROP POLICY IF EXISTS "Allow users to delete vehicle specifications" ON vehicle_specifications;

-- Allow authenticated users to read all specifications
CREATE POLICY "Allow authenticated users to read vehicle specifications"
    ON vehicle_specifications
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert specifications
CREATE POLICY "Allow authenticated users to insert vehicle specifications"
    ON vehicle_specifications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own specifications or admins to update any
CREATE POLICY "Allow users to update vehicle specifications"
    ON vehicle_specifications
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role = 'admin'
        )
    );

-- Allow users to delete their own specifications or admins to delete any
CREATE POLICY "Allow users to delete vehicle specifications"
    ON vehicle_specifications
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_specifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vehicle_specifications_updated_at
    BEFORE UPDATE ON vehicle_specifications
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_specifications_updated_at();
