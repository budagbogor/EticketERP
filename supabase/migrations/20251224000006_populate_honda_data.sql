-- Migration to populate Honda data
-- Uses DO block to handle variable IDs

DO $$
DECLARE
    v_brand_id UUID;
    v_model_id UUID;
BEGIN
    -- 1. Ensure Brand 'Honda' exists
    SELECT id INTO v_brand_id FROM car_brands WHERE name = 'Honda';
    IF v_brand_id IS NULL THEN
        INSERT INTO car_brands (name) VALUES ('Honda') RETURNING id INTO v_brand_id;
    END IF;

    -- ==========================================
    -- MODEL: BRIO (2018-Present)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Brio' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Brio', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.2 RS CVT (Satya/RS)
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
        v_brand_id, v_model_id, '1.2 RS CVT', 2018, 2024,
        '1.2L Petrol', 'L12B', 'CVT',
        '3.6', '0W-20 / 5W-30', 'API SN / SP', '10000',
        '3.5', 'CVIT Fluid (HCF-2)', '40000',
        'Showa', 'Showa',
        '185/55 R15', '185/55 R15', '32', '30',
        'Basah', 'NS40ZL',
        '22"', '15"', '12"',
        'NGK Dilkar', 'Honda Genuine 17220-5TP', 'Honda Genuine 15400-RAF', 'Honda Genuine 80292-TG0'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: HR-V (2015-2021)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'HR-V' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('HR-V', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 E CVT
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
        v_brand_id, v_model_id, '1.5 E CVT', 2015, 2021,
        '1.5L Petrol', 'L15Z', 'CVT',
        '3.6', '0W-20 / 5W-30', 'API SN', '10000',
        '3.5', 'CVIT Fluid (HCF-2)', '40000',
        'Sachs, Showa', 'Sachs, Showa',
        '215/55 R17', '215/55 R17', '32', '30',
        'Basah', 'NS60LS', -- Or N50Z depending on region
        '26"', '18"', '10"',
        'NGK IZFR6K13', 'Honda Genuine 17220-51B', 'Honda Genuine 15400-RAF', 'Honda Genuine 80292-T50'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- Variant: 1.8 Prestige
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
        v_brand_id, v_model_id, '1.8 Prestige', 2015, 2021,
        '1.8L Petrol', 'R18Z', 'CVT',
        '3.7', '5W-30', 'API SN', '10000',
        '3.5', 'CVIT Fluid (HCF-2)', '40000',
        'Sachs, Showa', 'Sachs, Showa',
        '215/55 R17', '215/55 R17', '32', '30',
        'Basah', 'NS60LS',
        '26"', '18"', '10"',
        'NGK IZFR6K13', 'Honda Genuine 17220-51B', 'Honda Genuine 15400-RAF', 'Honda Genuine 80292-T50'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: CR-V (Turbo & Non-Turbo)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'CR-V' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('CR-V', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 Turbo
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
        v_brand_id, v_model_id, '1.5 Turbo', 2017, 2022,
        '1.5L Turbo', 'L15B7', 'CVT',
        '3.5', '0W-20', 'API SN / SP', '10000',
        '3.7', 'CVIT Fluid (HCF-2)', '40000',
        'Showa', 'Showa',
        '235/60 R18', '235/60 R18', '33', '33',
        'Basah', '55B24L', -- Or N50Z / NS60
        '26"', '16"', '12"',
        'NGK Dilkar', 'Honda Genuine 17220-5PA', 'Honda Genuine 15400-RAF', 'Honda Genuine 80292-TGO'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

    -- ==========================================
    -- MODEL: JAZZ (GK5)
    -- ==========================================
    SELECT id INTO v_model_id FROM car_models WHERE name = 'Jazz' AND brand_id = v_brand_id;
    IF v_model_id IS NULL THEN
        INSERT INTO car_models (name, brand_id) VALUES ('Jazz', v_brand_id) RETURNING id INTO v_model_id;
    END IF;

    -- Variant: 1.5 RS CVT (GK5)
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
        v_brand_id, v_model_id, '1.5 RS CVT (GK5)', 2014, 2021,
        '1.5L Petrol', 'L15Z', 'CVT',
        '3.6', '0W-20 / 5W-30', 'API SN', '10000',
        '3.5', 'CVIT Fluid (HCF-2)', '40000',
        'Showa, KYB', 'Showa, KYB',
        '185/55 R16', '185/55 R16', '32', '30',
        'Basah', 'NS40ZL',
        '26"', '14"', '14"',
        'NGK IZFR6K13', 'Honda Genuine 17220-55A', 'Honda Genuine 15400-RAF', 'Honda Genuine 80292-TG0'
    ) ON CONFLICT (brand_id, model_id, variant_name, year_start) DO NOTHING;

END $$;
