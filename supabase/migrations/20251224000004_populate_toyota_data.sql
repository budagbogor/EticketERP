-- Migration to populate Toyota data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Toyota' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Toyota';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Toyota') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: AVANZA (2015-2021) - RWD
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Avanza' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Avanza', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.3 G AT (2015-2021)
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
        v_brand_id, v_model_id, '1.3 G AT (Grand New)', 2015, 2021,
        '1.3L Petrol', '1NR-VE', 'AT',
        '3.5', '5W-30', 'API SN / ILSAC GF-5', '10000',
        '4.9 (Total)', 'ATF T-IV / WS', '40000',
        'Tokico, KYB Excel-G', 'Tokico, KYB Excel-G',
        '185/70 R14', '185/70 R14', '33', '36',
        'Basah', 'NS40ZL',
        '20"', '16"', '14"',
        'Denso XU22PR9', 'Toyota Genuine 17801-BZ040', 'Toyota Genuine 15601-BZ010', 'Toyota Genuine 88568-BZ050'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- Variant: 1.5 G MT (2015-2021)
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
        v_brand_id, v_model_id, '1.5 G MT (Grand New)', 2015, 2021,
        '1.5L Petrol', '2NR-VE', 'MT',
        '3.5', '5W-30', 'API SN / ILSAC GF-5', '10000',
        '1.2', 'GL-4 80W-90', '40000',
        'Tokico, KYB Excel-G', 'Tokico, KYB Excel-G',
        '185/65 R15', '185/65 R15', '33', '36',
        'Basah', 'NS40ZL',
        '20"', '16"', '14"',
        'Denso XU22PR9', 'Toyota Genuine 17801-BZ040', 'Toyota Genuine 15601-BZ010', 'Toyota Genuine 88568-BZ050'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;


    -- ==========================================
    -- MODEL: INNOVA (Reborn 2016-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Innova' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Innova', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 2.4 Diesel AT (Reborn)
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
        v_brand_id, v_model_id, '2.4 G Diesel AT', 2016, 2022,
        '2.4L Diesel Turbo', '2GD-FTV', 'AT',
        '7.5', '5W-30 / 10W-30', 'API CF-4 / API CI-4', '10000',
        '9.5 (Total)', 'ATF WS', '80000',
        'Tokico, KYB', 'Tokico, KYB',
        '205/65 R16', '205/65 R16', '33', '33',
        'Basah', '80D26L',
        '26"', '16"', '12"',
        '-', 'Toyota Genuine 17801-0E010', 'Toyota Genuine 90915-YZZD4', 'Toyota Genuine 87139-0K010'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- Variant: 2.0 Bensin MT (Reborn)
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
        v_brand_id, v_model_id, '2.0 G Bensin MT', 2016, 2022,
        '2.0L Petrol', '1TR-FE', 'MT',
        '5.6', '5W-30 / 10W-40', 'API SN', '10000',
        '2.2', 'GL-4 75W-90', '40000',
        'Tokico, KYB', 'Tokico, KYB',
        '205/65 R16', '205/65 R16', '33', '33',
        'Basah', '55D23L',
        '26"', '16"', '12"',
        'Denso Iridium', 'Toyota Genuine 17801-0C010', 'Toyota Genuine 90915-YZZD2', 'Toyota Genuine 87139-0K010'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;


    -- ==========================================
    -- MODEL: CALYA
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Calya' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Calya', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.2 G AT
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
        v_brand_id, v_model_id, '1.2 G AT', 2016, 2024,
        '1.2L Petrol', '3NR-VE', 'AT',
        '3.5', '0W-20 / 5W-30', 'API SN / SP', '10000',
        '2.5', 'ATF WS', '80000',
        'KYB', 'KYB',
        '175/65 R14', '175/65 R14', '36', '36',
        'Basah', 'NS40ZL',
        '22"', '14"', '12"',
        'Denso XU22PR9', 'Toyota Genuine 17801-BZ100', 'Toyota Genuine 15601-BZ030', 'Toyota Genuine 88568-BZ060'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
