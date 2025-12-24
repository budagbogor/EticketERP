-- Migration to populate Nissan data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Nissan' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Nissan';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Nissan') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: LIVINA (Rebadged Xpander 2019+)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Livina' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Livina', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 VL AT
    INSERT INTO vehicle_specifications (
        brand_id, model_id, variant_name, year_start, year_end,
        engine_type, engine_code, transmission,
        engine_oil_capacity, engine_oil_type, engine_oil_quality_standard, engine_oil_replacement_interval_km,
        transmission_oil_capacity, transmission_oil_type, transmission_oil_replacement_interval_km,
        shock_depan_recommended_brands, shock_belakang_recommended_brands,
        tire_size_front, tire_size_rear, tire_pressure_front, tire_pressure_rear,
        battery_type, battery_model,
        wiper_size_driver, wiper_size_passenger, wiper_size_rear,
        spark_plug_type, air_filter_type, oil_filter_type, cabin_filter_type
    ) VALUES (
        v_brand_id, v_model_id, '1.5 VL AT', 2019, 2024,
        '1.5L Petrol', '4A91', 'AT',
        '4.0', '0W-20 / 5W-30', 'API SN', '10000',
        '5.5 (Total)', 'ATF Matic S', '40000',
        'KYB', 'KYB',
        '205/55 R16', '205/55 R16', '30', '30',
        'Basah', 'NS40ZL',
        '26"', '17"', '12"',
        'NGK LZFR6AI', 'Nissan Genuine 16546-1HK0A', 'Nissan Genuine 15208-65F0A', 'Nissan Genuine 27277-1HK0A'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: MAGNITE
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Magnite' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Magnite', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.0 Turbo CVT
    INSERT INTO vehicle_specifications (
        brand_id, model_id, variant_name, year_start, year_end,
        engine_type, engine_code, transmission,
        engine_oil_capacity, engine_oil_type, engine_oil_quality_standard, engine_oil_replacement_interval_km,
        transmission_oil_capacity, transmission_oil_type, transmission_oil_replacement_interval_km,
        shock_depan_recommended_brands, shock_belakang_recommended_brands,
        tire_size_front, tire_size_rear, tire_pressure_front, tire_pressure_rear,
        battery_type, battery_model,
        wiper_size_driver, wiper_size_passenger, wiper_size_rear,
        spark_plug_type, air_filter_type, oil_filter_type, cabin_filter_type
    ) VALUES (
        v_brand_id, v_model_id, '1.0 Premium CVT', 2020, 2024,
        '1.0L Turbo', 'HRA0', 'CVT',
        '3.5', '5W-30 / 5W-40', 'API SN', '10000',
        '4.0', 'Nissan NS-3 CVT Fluid', '40000',
        'Monroe', 'Monroe',
        '195/60 R16', '195/60 R16', '33', '33',
        'Basah', 'LN1 / DIN45', -- European Standard
        '24"', '13"', '10"',
        'NGK', 'Nissan Genuine', 'Nissan Genuine', 'Nissan Genuine'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: GRAND LIVINA (L10/L11)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Grand Livina' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Grand Livina', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 XV CVT (L11)
    INSERT INTO vehicle_specifications (
        brand_id, model_id, variant_name, year_start, year_end,
        engine_type, engine_code, transmission,
        engine_oil_capacity, engine_oil_type, engine_oil_quality_standard, engine_oil_replacement_interval_km,
        transmission_oil_capacity, transmission_oil_type, transmission_oil_replacement_interval_km,
        shock_depan_recommended_brands, shock_belakang_recommended_brands,
        tire_size_front, tire_size_rear, tire_pressure_front, tire_pressure_rear,
        battery_type, battery_model,
        wiper_size_driver, wiper_size_passenger, wiper_size_rear,
        spark_plug_type, air_filter_type, oil_filter_type, cabin_filter_type
    ) VALUES (
        v_brand_id, v_model_id, '1.5 XV CVT (HWS)', 2013, 2019,
        '1.5L Petrol', 'HR15DE', 'CVT',
        '3.0', '0W-20 / 5W-30', 'API SN', '10000',
        '7.0 (Total)', 'Nissan NS-3 CVT Fluid', '40000',
        'KYB, Tokico', 'KYB, Tokico',
        '185/65 R15', '185/65 R15', '33', '33',
        'Basah', 'NS40ZL',
        '24"', '14"', '12"',
        'NGK LZKAR6AP-11', 'Nissan Genuine 16546-1HK0A', 'Nissan Genuine 15208-65F0A', 'Nissan Genuine 27277-1HK0A'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
