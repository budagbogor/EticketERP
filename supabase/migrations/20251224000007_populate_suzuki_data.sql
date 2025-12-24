-- Migration to populate Suzuki data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Suzuki' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Suzuki';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Suzuki') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: ERTIGA (2018-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Ertiga' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Ertiga', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 GX AT
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
        v_brand_id, v_model_id, '1.5 GX AT', 2018, 2024,
        '1.5L Petrol', 'K15B', 'AT',
        '3.6', '0W-20 / 5W-30', 'API SN', '10000',
        '2.5', 'ATF AW-1 / Suzuki ATF 3317', '40000',
        'KYB, Tokico', 'KYB, Tokico',
        '185/65 R15', '185/65 R15', '33', '33',
        'Basah', 'NS40ZL', -- Or NS60 for upgrades
        '22"', '16"', '12"',
        'NGK KR6A-10', 'Suzuki Genuine 13780-77M', 'Suzuki Genuine 16510-61J', 'Suzuki Genuine 95860-61J'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: XL7
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'XL7' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('XL7', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Alpha AT
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
        v_brand_id, v_model_id, '1.5 Alpha AT', 2020, 2024,
        '1.5L Petrol', 'K15B', 'AT',
        '3.6', '0W-20', 'API SN / SP', '10000',
        '2.5', 'ATF AW-1', '40000',
        'KYB', 'KYB',
        '195/60 R16', '195/60 R16', '33', '33',
        'Basah', 'NS40ZL',
        '22"', '16"', '12"',
        'NGK KR6A-10', 'Suzuki Genuine 13780-77M', 'Suzuki Genuine 16510-61J', 'Suzuki Genuine 95860-61J'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: BALENO (Hatchback 2017+)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Baleno' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Baleno', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.4 AT
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
        v_brand_id, v_model_id, '1.4 AT', 2017, 2022,
        '1.4L Petrol', 'K14B', 'AT',
        '3.4', '0W-20 / 5W-30', 'API SN', '10000',
        '2.5', 'ATF 3317', '40000',
        'KYB', 'KYB',
        '195/55 R16', '195/55 R16', '32', '29',
        'Basah', 'NS40ZL',
        '22"', '17"', '12"',
        'NGK KR6A-10', 'Suzuki Genuine', 'Suzuki Genuine 16510-61J', 'Suzuki Genuine'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
