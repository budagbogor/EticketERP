-- Migration to populate Mazda, Isuzu, and Wuling data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- =========================================================================
    -- BRAND: MAZDA
    -- =========================================================================
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Mazda';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Mazda') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: CX-5 (KF 2017+)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'CX-5' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('CX-5', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 2.5 Elite / Kuro (Skyactiv-G)
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
        v_brand_id, v_model_id, '2.5 Elite', 2017, 2024,
        '2.5L Skyactiv-G', 'PY-VPS', 'AT',
        '4.5', '0W-20', 'API SN / SP', '10000',
        '7.8 (Total)', 'Mazda FZ ATF', 'Life Time (Check 40k)', -- Often claimed lifetime but recommend check
        'KYB', 'KYB',
        '225/55 R19', '225/55 R19', '36', '36',
        'Basah', 'Q85 (i-Stop)',
        '24"', '18"', '14"',
        'NGK ILKAR7L11', 'Mazda Genuine PE07-13-3A0A', 'Mazda Genuine PE01-14-302', 'Mazda Genuine KD45-61-J6X'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: MAZDA 2 (DJ 2014+)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Mazda 2' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Mazda 2', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 GT Skyactiv
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
        v_brand_id, v_model_id, '1.5 GT Skyactiv', 2014, 2024,
        '1.5L Skyactiv-G', 'P5-VPS', 'AT',
        '4.2', '0W-20', 'API SN', '10000',
        '7.0 (Total)', 'Mazda FZ ATF', 'Life Time (Check 40k)',
        'KYB', 'KYB',
        '185/60 R16', '185/60 R16', '33', '33',
        'Basah', 'Q85 (i-Stop)',
        '22"', '17"', '14"',
        'NGK ILZKAR7L11', 'Mazda Genuine P501-13-3A0', 'Mazda Genuine PE01-14-302', 'Mazda Genuine D09W-61-J6X'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;


    -- =========================================================================
    -- BRAND: ISUZU
    -- =========================================================================
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Isuzu';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Isuzu') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: MU-X (2014-2021)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Mu-X' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Mu-X', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 2.5 TD (4JK1)
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
        v_brand_id, v_model_id, '2.5 TD', 2014, 2021,
        '2.5L Diesel Turbo', '4JK1-TCX', 'AT',
        '7.0', '5W-30 / 10W-30', 'API CI-4 / DH-1', '10000',
        '10.0 (Total)', 'Isuzu ATF WSI', '40000',
        'Tokico', 'Tokico',
        '255/65 R17', '255/65 R17', '30', '30',
        'Basah', '80D26L',
        '22"', '19"', '12"',
        '-', 'Isuzu Genuine 8-98140266-0', 'Isuzu Genuine 8-98185312-0', 'Isuzu Genuine 8-98139428-0'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;


    -- =========================================================================
    -- BRAND: WULING
    -- =========================================================================
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Wuling';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Wuling') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: ALMAZ
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Almaz' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Almaz', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Turbo CVT
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
        v_brand_id, v_model_id, '1.5 Turbo CVT', 2019, 2024,
        '1.5L Turbo', 'LJO', 'CVT',
        '4.0', '5W-30', 'API SN', '10000',
        '4.5', 'Wuling CVT Fluid', '40000',
        'Wuling Genuine', 'Wuling Genuine',
        '215/60 R17', '215/60 R17', '33', '33',
        'Basah', '55B24LS',
        '24"', '16"', '10"',
        'NGK', 'Wuling Genuine', 'Wuling Genuine 24553258', 'Wuling Genuine'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: CONFERO
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Confero' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Confero', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 S MT
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
        v_brand_id, v_model_id, '1.5 S MT', 2017, 2024,
        '1.5L Petrol', 'L2B', 'MT',
        '3.5', '5W-30', 'API SN', '10000',
        '1.3', 'GL-4 75W-90', '40000',
        'Wuling Genuine', 'Wuling Genuine',
        '195/60 R15', '195/60 R15', '33', '36',
        'Basah', 'NS40ZL',
        '22"', '16"', '12"',
        'NGK', 'Wuling Genuine', 'Wuling Genuine', 'Wuling Genuine'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
