-- Seed Data for Buku Pintar
-- Ensures we have at least one record to test display

-- Insert test data securely looking up IDs
DO $$
DECLARE
    brand_id_val UUID;
    model_id_val UUID;
BEGIN
    -- Get ID for a common brand (e.g., Toyota or Honda)
    -- Adjust 'Toyota' to a brand you KNOW exists in car_brands
    SELECT id INTO brand_id_val FROM car_brands WHERE name ILIKE '%Toyota%' LIMIT 1;
    
    -- If no Toyota, try Honda
    IF brand_id_val IS NULL THEN
        SELECT id INTO brand_id_val FROM car_brands WHERE name ILIKE '%Honda%' LIMIT 1;
    END IF;

    -- If still null, just pick ANY brand
    IF brand_id_val IS NULL THEN
        SELECT id INTO brand_id_val FROM car_brands LIMIT 1;
    END IF;

    -- Get a model for that brand
    SELECT id INTO model_id_val FROM car_models WHERE brand_id = brand_id_val LIMIT 1;

    -- If we found a brand and model, insert specification
    IF brand_id_val IS NOT NULL AND model_id_val IS NOT NULL THEN
        INSERT INTO vehicle_specifications (
            brand_id,
            model_id,
            variant_name,
            year_start,
            engine_type,
            engine_oil_capacity,
            engine_oil_type,
            transmission_oil_capacity,
            transmission_oil_type,
            tire_size_front,
            created_by
        ) VALUES (
            brand_id_val,
            model_id_val,
            'Test Variant 1.5',
            2023,
            'Bensin',
            '4.0',
            '0W-20',
            '2.5',
            'CVT Fluid',
            '185/65 R15',
            auth.uid() -- Assign to current user if running in SQL editor with valid auth context, otherwise might verify RLS
        )
        ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;
        
        RAISE NOTICE 'Seeded test data for brand_id % and model_id %', brand_id_val, model_id_val;
    ELSE
        RAISE NOTICE 'Could not find Brand/Model to seed data. Please check car_brands table.';
    END IF;
END $$;
