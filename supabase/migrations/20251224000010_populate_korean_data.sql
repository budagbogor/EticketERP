-- Migration to populate Hyundai and Kia data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- =========================================================================
    -- BRAND: HYUNDAI
    -- =========================================================================
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Hyundai';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Hyundai') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: CRETA (2022-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Creta' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Creta', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Prime IVT
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
        v_brand_id, v_model_id, '1.5 Prime IVT', 2022, 2024,
        '1.5L Petrol', 'Smartstream G1.5', 'IVT',
        '3.8', '0W-20', 'API SP / ILSAC GF-6', '10000',
        '3.6', 'SP-CVT 1', '40000',
        'Mando', 'Mando',
        '215/60 R17', '215/60 R17', '33', '33',
        'Basah', 'DIN45 (Start/Stop)', -- Uses DIN standard often
        '24"', '18"', '12"',
        'NGK SILZKR6D8E', 'Hyundai Genuine 28113-BV800', 'Hyundai Genuine 26300-35505', 'Hyundai Genuine 97133-BV000'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: STARGAZER
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Stargazer' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Stargazer', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Prime IVT
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
        v_brand_id, v_model_id, '1.5 Prime IVT', 2022, 2024,
        '1.5L Petrol', 'Smartstream G1.5', 'IVT',
        '3.8', '0W-20', 'API SP / ILSAC GF-6', '10000',
        '3.6', 'SP-CVT 1', '40000',
        'Mando', 'Mando',
        '205/55 R16', '205/55 R16', '33', '35',
        'Basah', 'DIN45',
        '24"', '18"', '12"',
        'NGK SILZKR6D8E', 'Hyundai Genuine 28113-BV800', 'Hyundai Genuine 26300-35505', 'Hyundai Genuine 97133-BV000'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;


    -- =========================================================================
    -- BRAND: KIA
    -- =========================================================================
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Kia';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Kia') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: SONET
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Sonet' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Sonet', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Premiere iVT
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
        v_brand_id, v_model_id, '1.5 Premiere iVT', 2020, 2024,
        '1.5L Petrol', 'Smartstream G1.5', 'IVT',
        '3.8', '0W-20', 'API SP', '10000',
        '3.6', 'SP-CVT 1', '40000',
        'Mando', 'Mando',
        '215/60 R16', '215/60 R16', '33', '33',
        'Basah', 'DIN45',
        '24"', '18"', '12"',
        'NGK SILZKR6D8E', 'Kia Genuine', 'Kia Genuine 26300-35505', 'Kia Genuine'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
