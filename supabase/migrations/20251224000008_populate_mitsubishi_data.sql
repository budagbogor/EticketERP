-- Migration to populate Mitsubishi data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Mitsubishi' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Mitsubishi';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Mitsubishi') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: XPANDER (2017-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Xpander' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Xpander', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Ultimate AT (Pre-Facelift)
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
        v_brand_id, v_model_id, '1.5 Ultimate AT', 2017, 2021,
        '1.5L Petrol', '4A91', 'AT',
        '4.0', '0W-20 / 5W-30', 'API SN', '10000',
        '5.5 (Total)', 'ATF SP-III', '40000',
        'KYB', 'KYB',
        '205/55 R16', '205/55 R16', '30', '30',
        'Basah', 'NS40ZL', -- Or 34B19L
        '26"', '16"', '12"',
        'NGK LZFR6AI', 'Mitsubishi Genuine 1500A617', 'Mitsubishi Genuine 1230A182', 'Mitsubishi Genuine 7803A004'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- Variant: 1.5 Ultimate CVT (Facelift)
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
        v_brand_id, v_model_id, '1.5 Ultimate CVT', 2021, 2024,
        '1.5L Petrol', '4A91', 'CVT',
        '4.0', '0W-20 / 5W-30', 'API SN / SP', '10000',
        '5.5 (Total)', 'CVT Fluid J4', '40000',
        'KYB', 'KYB',
        '205/55 R17', '205/55 R17', '30', '30',
        'Basah', 'NS40ZL',
        '26"', '16"', '12"',
        'NGK LZFR6AI', 'Mitsubishi Genuine 1500A617', 'Mitsubishi Genuine 1230A182', 'Mitsubishi Genuine 7803A004'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: PAJERO SPORT (Dakar 2016+)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Pajero Sport' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Pajero Sport', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 2.4 Dakar AT (4N15)
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
        v_brand_id, v_model_id, '2.4 Dakar AT (4N15)', 2016, 2024,
        '2.4L Diesel Turbo', '4N15', 'AT',
        '7.0', '5W-30 / 10W-30', 'API CF-4 / CI-4 / DL-1', '10000',
        '10.9 (Total)', 'ATF MA-1 (8 Speed)', '80000',
        'KYB', 'KYB',
        '265/60 R18', '265/60 R18', '29', '32',
        'Basah', '95D31L',
        '22"', '18"', '10"',
        '-', 'Mitsubishi Genuine 1500A608', 'Mitsubishi Genuine 1230A182', 'Mitsubishi Genuine 7803A112'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
