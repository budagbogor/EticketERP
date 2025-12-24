-- Migration to populate Daihatsu data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Daihatsu' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Daihatsu';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Daihatsu') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: XENIA (2015-2021) - RWD (Great New)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Xenia' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Xenia', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.3 R AT (Great New)
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
        v_brand_id, v_model_id, '1.3 R AT (Great New)', 2015, 2021,
        '1.3L Petrol', '1NR-VE', 'AT',
        '3.5', '5W-30', 'API SN', '10000',
        '4.9 (Total)', 'ATF D3-SP / T-IV', '40000',
        'Tokico', 'Tokico',
        '185/70 R14', '185/70 R14', '33', '36',
        'Basah', 'NS40ZL',
        '20"', '16"', '14"',
        'Denso XU22PR9', 'Daihatsu Genuine 17801-BZ040', 'Daihatsu Genuine 15601-BZ010', 'Daihatsu Genuine 88568-BZ050'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: TERIOS (2018-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Terios' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Terios', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 R AT
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
        v_brand_id, v_model_id, '1.5 R AT (All New)', 2018, 2024,
        '1.5L Petrol', '2NR-VE', 'AT',
        '3.5', '0W-20 / 5W-30', 'API SN', '10000',
        '2.5', 'ATF WS', '80000',
        'KYB', 'KYB',
        '215/60 R17', '215/60 R17', '33', '33',
        'Kering', '34B19L', -- Often upgraded to NS40ZL size but maintenance free
        '21"', '18"', '12"',
        'Denso XU22PR9', 'Daihatsu Genuine 17801-BZ100', 'Daihatsu Genuine 15601-BZ030', 'Daihatsu Genuine 88568-BZ060'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: SIGRA
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Sigra' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Sigra', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.2 R AT
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
        v_brand_id, v_model_id, '1.2 R AT', 2016, 2024,
        '1.2L Petrol', '3NR-VE', 'AT',
        '3.5', '0W-20 / 5W-30', 'API SN', '10000',
        '2.5', 'ATF WS', '80000',
        'KYB', 'KYB',
        '175/65 R14', '175/65 R14', '36', '36',
        'Basah', 'NS40ZL',
        '22"', '16"', '12"',
        'Denso XU22PR9', 'Daihatsu Genuine 17801-BZ100', 'Daihatsu Genuine 15601-BZ030', 'Daihatsu Genuine 88568-BZ060'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: GRAN MAX
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Gran Max' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Gran Max', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 PU/MB
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
        v_brand_id, v_model_id, '1.5 VVT-i', 2015, 2021,
        '1.5L Petrol', '3SZ-VE', 'MT',
        '3.5', '5W-30 / 10W-40', 'API SL/SN', '10000',
        '2.2', 'GL-4 75W-90', '40000',
        'Tokico', 'Tokico',
        '175 R13C', '175 R13C', '33', '45', -- Heavy load rear
        'Basah', 'NS40Z',
        '20"', '16"', '-',
        'Denso XU22PR9', 'Daihatsu Genuine 17801-BZ060', 'Daihatsu Genuine 15601-BZ010', '-'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
