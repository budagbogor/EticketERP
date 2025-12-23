import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, VehicleVariant } from "@/types/buku-pintar";
import { bukuPintarData as initialMockData } from "@/lib/buku-pintar-data";
import { useVehicles } from "./use-vehicles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useBukuPintar() {
    const { brands: supabaseBrands, isLoading: isSupabaseLoading, refreshVehicles } = useVehicles();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [completeData, setCompleteData] = useState<Vehicle[]>([]);

    // Fetch vehicle specifications from Supabase
    const { data: specifications = [], isLoading: isSpecsLoading, error } = useQuery({
        queryKey: ["vehicle-specifications"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vehicle_specifications")
                .select(`
                    *,
                    engine_oil_recommended_brands,
                    transmission_oil_recommended_brands,
                    power_steering_oil_recommended_brands,
                    brake_oil_recommended_brands,
                    radiator_coolant_recommended_brands,
                    ac_freon_recommended_brands,
                    tire_recommended_brands,
                    brake_pad_front_recommended_brands,
                    brake_pad_rear_recommended_brands,
                    oil_filter_recommended_brands,
                    air_filter_recommended_brands,
                    cabin_filter_recommended_brands,
                    fuel_filter_recommended_brands,
                    spark_plug_recommended_brands,
                    battery_ampere,
                    battery_voltage,
                    battery_dimensions,
                    car_brands!vehicle_specifications_brand_id_fkey(id, name),
                    car_models!vehicle_specifications_model_id_fkey(id, name)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        },
    });

    // Merge Supabase brands/models with Mock Specs + Supabase Specs
    useEffect(() => {
        if (isSupabaseLoading || isSpecsLoading) return;

        const mergedVehicles: Vehicle[] = [];

        supabaseBrands.forEach(brand => {
            brand.models.forEach(model => {
                // Find matching mock specifications
                const mockVehicle = initialMockData.find(
                    v => v.brand.toLowerCase() === brand.name.toLowerCase() &&
                        v.model.toLowerCase() === model.name.toLowerCase()
                );

                // Find matching Supabase specifications
                const supabaseSpecs = (specifications || []).filter(
                    (spec: any) =>
                        spec.car_brands?.name.toLowerCase() === brand.name.toLowerCase() &&
                        spec.car_models?.name.toLowerCase() === model.name.toLowerCase()
                );

                // Helper to clean spec string (remove text in parentheses)
                const cleanSpecString = (str: string | null) => {
                    if (!str) return "";
                    // Remove content in parentheses, e.g., "0W-20 (Nissan Genuine)" -> "0W-20"
                    return str.replace(/\s*\(.*?\)\s*/g, "").trim();
                };

                // Helper to extract brand from spec string (text in parentheses)
                const extractBrandFromSpec = (str: string | null): string[] => {
                    if (!str) return [];
                    const matches = str.match(/\((.*?)\)/g);
                    if (!matches) return [];
                    return matches.map(m => m.replace(/[()]/g, "").trim());
                };

                // Convert Supabase specs to VehicleVariant format with nested specifications
                const supabaseVariants: VehicleVariant[] = supabaseSpecs.map((spec: any) => {
                    // Pre-calculate extracted brands from legacy fields
                    const legacyEngineBrands = extractBrandFromSpec(spec.engine_oil_type);
                    const legacyTransBrands = extractBrandFromSpec(spec.transmission_oil_type);
                    const legacyDiffBrands = extractBrandFromSpec(spec.power_steering_oil_type);
                    const legacyPowerSteeringBrands = extractBrandFromSpec(spec.power_steering_oil_type);

                    const dbEngineBrands = spec.engine_oil_recommended_brands ? spec.engine_oil_recommended_brands.split(',').map((s: string) => s.trim()) : [];
                    const dbTransBrands = spec.transmission_oil_recommended_brands ? spec.transmission_oil_recommended_brands.split(',').map((s: string) => s.trim()) : [];
                    const dbPsBrands = spec.power_steering_oil_recommended_brands ? spec.power_steering_oil_recommended_brands.split(',').map((s: string) => s.trim()) : [];

                    // Merge and deduplicate
                    const engineBrands = Array.from(new Set([...dbEngineBrands, ...legacyEngineBrands]));
                    const transBrands = Array.from(new Set([...dbTransBrands, ...legacyTransBrands]));
                    const psBrands = Array.from(new Set([...dbPsBrands, ...legacyDiffBrands]));

                    // Helper to parse battery string (Legacy: "MF (34B19L) 35Ah 12V" or "Kering 55D23L 55Ah 12V")
                    const parseBatteryData = (rawType: string | null) => {
                        if (!rawType) return { type: "", model: "", ampere: 0, voltage: 12, dimensions: "" };

                        let remainingString = rawType;
                        let type = "";
                        let model = "";
                        let ampere = 0;
                        let voltage = 12;
                        let dimensions = "";

                        // Extract Type (MF, Kering, Basah, etc.) - usually at the beginning
                        const typeMatch = remainingString.match(/^(MF|Kering|Basah|Maintenance Free|Wet|Dry)\s*/i);
                        if (typeMatch) {
                            type = typeMatch[1];
                            remainingString = remainingString.replace(typeMatch[0], "");
                        }

                        // Extract Model Code in parentheses (e.g., (34B19L) or (55D23L))
                        const modelInParenMatch = remainingString.match(/\(([A-Z0-9]+)\)/);
                        if (modelInParenMatch) {
                            model = modelInParenMatch[1];
                            remainingString = remainingString.replace(modelInParenMatch[0], "");
                        }

                        // If no model in parentheses, try to extract alphanumeric model code
                        if (!model) {
                            const modelMatch = remainingString.match(/([A-Z0-9]{5,})/);
                            if (modelMatch) {
                                model = modelMatch[1];
                                remainingString = remainingString.replace(modelMatch[0], "");
                            }
                        }

                        // Extract Ampere (e.g., 35Ah or 35 Ah or 35ah)
                        const ahMatch = remainingString.match(/(\d+)\s*Ah/i);
                        if (ahMatch) {
                            ampere = parseInt(ahMatch[1]);
                            remainingString = remainingString.replace(ahMatch[0], "");
                        }

                        // Extract Voltage (e.g., 12V or 12 V)
                        const vMatch = remainingString.match(/(\d+)\s*V\b/i);
                        if (vMatch) {
                            voltage = parseInt(vMatch[1]);
                            remainingString = remainingString.replace(vMatch[0], "");
                        }

                        // Extract Dimensions (e.g., [238x175x190])
                        const dimMatch = remainingString.match(/\[([\dxX]+)\]/);
                        if (dimMatch) {
                            dimensions = dimMatch[1];
                            remainingString = remainingString.replace(dimMatch[0], "");
                        }

                        return { type, model: model.trim(), ampere, voltage, dimensions };
                    };

                    const batteryParsed = spec.battery_type ? parseBatteryData(spec.battery_type) : { type: "", model: "", ampere: 0, voltage: 12, dimensions: "" };

                    // Helper to parse part string (e.g., "123-456 (Denso) [10000 KM]")
                    const parsePartData = (rawString: string | null) => {
                        if (!rawString) return { part_number: "", interval_km: 0, legacy_brands: [] as string[] };

                        let cleanString = rawString;
                        let interval_km = 0;
                        let legacy_brands: string[] = [];

                        // Extract Interval [10000 KM] or [10.000 KM]
                        const intervalMatch = cleanString.match(/\[([\d\.]+)\s*KM\]/i);
                        if (intervalMatch) {
                            const numStr = intervalMatch[1].replace(/\./g, "");
                            interval_km = parseInt(numStr);
                            cleanString = cleanString.replace(intervalMatch[0], "");
                        }

                        // Extract Brands (Brand)
                        const brandMatches = cleanString.match(/\((.*?)\)/g);
                        if (brandMatches) {
                            legacy_brands = brandMatches.map(m => m.replace(/[()]/g, "").trim());
                            cleanString = cleanString.replace(/\(.*?\)/g, "");
                        }

                        cleanString = cleanString.trim().replace(/\s+/g, " ");
                        return { part_number: cleanString, interval_km, legacy_brands };
                    };

                    const createPart = (category: any, name: string, rawString: string | null, dbBrandsString: string | null) => {
                        if (!rawString) return null;
                        const parsed = parsePartData(rawString);
                        const dbBrands = dbBrandsString ? dbBrandsString.split(',').map(s => s.trim()) : [];
                        const allBrands = Array.from(new Set([...dbBrands, ...parsed.legacy_brands]));

                        return {
                            category,
                            name,
                            part_number: parsed.part_number,
                            replacement_interval_km: parsed.interval_km || undefined,
                            compatible_brands: allBrands
                        };
                    };

                    return {
                        id: spec.id,
                        name: spec.variant_name,
                        year_start: spec.year_start,
                        year_end: spec.year_end,
                        engine_type: spec.engine_type,
                        transmission: "AT" as any,
                        engine_code: "",
                        specifications: {
                            engine_oil: {
                                viscosity_options: spec.engine_oil_type ? [cleanSpecString(spec.engine_oil_type)] : [],
                                capacity_liter: parseFloat(spec.engine_oil_capacity) || 0,
                                capacity_with_filter_liter: parseFloat(spec.engine_oil_capacity) || 0,
                                quality_standard: cleanSpecString(spec.engine_oil_type) || "",
                                recommended_brands: engineBrands
                            },
                            transmission_oil: {
                                type: cleanSpecString(spec.transmission_oil_type) || "",
                                capacity_liter: parseFloat(spec.transmission_oil_capacity) || 0,
                                recommended_brands: transBrands
                            },
                            differential_oil: spec.power_steering_oil_type ? {
                                type: cleanSpecString(spec.power_steering_oil_type),
                                capacity_liter: parseFloat(spec.power_steering_oil_capacity) || 0,
                                recommended_brands: psBrands
                            } : undefined,
                            parts: [
                                ...(spec.oil_filter_type ? [createPart("Filter Oli", "Oil Filter", spec.oil_filter_type, spec.oil_filter_recommended_brands)!] : []),
                                ...(spec.air_filter_type ? [createPart("Filter Udara", "Air Filter", spec.air_filter_type, spec.air_filter_recommended_brands)!] : []),
                                ...(spec.cabin_filter_type ? [createPart("Filter Kabin", "Cabin Filter", spec.cabin_filter_type, spec.cabin_filter_recommended_brands)!] : []),
                                ...(spec.spark_plug_type ? [createPart("Busi", "Spark Plug", spec.spark_plug_type, spec.spark_plug_recommended_brands)!] : []),
                                ...(spec.fuel_filter_type ? [createPart("Filter Bensin", "Fuel Filter", spec.fuel_filter_type, spec.fuel_filter_recommended_brands)!] : []),
                                ...(spec.wiper_size_driver ? [{
                                    category: "Wiper" as const,
                                    name: `Driver: ${spec.wiper_size_driver}, Passenger: ${spec.wiper_size_passenger || '-'}, Rear: ${spec.wiper_size_rear || '-'}`,
                                    part_number: "",
                                    compatible_brands: []
                                }] : [])
                            ],
                            tires: spec.tire_size_front ? [{
                                location: "Depan & Belakang" as any,
                                size: spec.tire_size_front,
                                pressure_psi_front: parseFloat(spec.tire_pressure_front) || 0,
                                pressure_psi_rear: parseFloat(spec.tire_pressure_rear) || 0,
                                load_speed_index: spec.tire_load_speed_index || undefined,
                                recommended_brands: spec.tire_recommended_brands?.split(',').map((s: string) => s.trim()) || []
                            }] : [],
                            suspension: {
                                shock_absorber_front: spec.shock_absorber_front || undefined,
                                shock_absorber_front_brands: spec.shock_depan_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                shock_absorber_rear: spec.shock_absorber_rear || undefined,
                                shock_absorber_rear_brands: spec.shock_belakang_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                rack_end: spec.rack_end || undefined,
                                rack_end_brands: spec.rack_end_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                tie_rod_end: spec.tie_rod_end || undefined,
                                tie_rod_end_brands: spec.tie_rod_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                link_stabilizer: spec.link_stabilizer || undefined,
                                link_stabilizer_brands: spec.link_stabilizer_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                lower_arm: spec.lower_arm || undefined,
                                lower_arm_brands: spec.lower_arm_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                upper_arm: spec.upper_arm || undefined,
                                upper_arm_brands: spec.upper_arm_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                upper_support: spec.upper_support || undefined,
                                upper_support_brands: spec.upper_support_recommended_brands?.split(',').map((s: string) => s.trim()) || []
                            },



                            battery: spec.battery_type ? {
                                type: batteryParsed.type || "Aki Mobil", // Use extracted type or fallback to "Aki Mobil"
                                model: batteryParsed.model, // Cleaned model code
                                ampere: spec.battery_ampere || batteryParsed.ampere,
                                voltage: spec.battery_voltage || batteryParsed.voltage,
                                dimensions: spec.battery_dimensions || batteryParsed.dimensions
                            } : undefined,
                            brakes: {
                                front_type: spec.brake_disc_front_type || "",
                                rear_type: spec.brake_disc_rear_type || "",
                                fluid_type: cleanSpecString(spec.brake_oil_type) || "",
                                pad_part_number_front: spec.brake_pad_front_type || "",
                                shoe_part_number_rear: spec.brake_pad_rear_type || "",
                                recommended_brands_front: spec.brake_pad_front_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                                recommended_brands_rear: spec.brake_pad_rear_recommended_brands?.split(',').map((s: string) => s.trim()) || []
                            }
                        }
                    };
                });

                // Merge variants
                let variants: VehicleVariant[] = [];
                if (mockVehicle) variants = [...variants, ...mockVehicle.variants];
                variants = [...variants, ...supabaseVariants];

                mergedVehicles.push({
                    id: model.id,
                    brand: brand.name,
                    model: model.name,
                    year_start: mockVehicle?.year_start || supabaseVariants[0]?.year_start || 2000,
                    year_end: mockVehicle?.year_end || supabaseVariants[0]?.year_end || null,
                    variants: variants
                });
            });
        });

        setCompleteData(mergedVehicles);
    }, [supabaseBrands, specifications, isSupabaseLoading, isSpecsLoading]);

    // Helper function to convert VehicleVariant to database format
    const variantToDbFormat = (variant: VehicleVariant, brandId: string, modelId: string) => {
        // Map engine oil type from type OR viscosity (ImportDialog uses viscosity_options)
        const engineOilType = variant.specifications.engine_oil?.type ||
            variant.specifications.engine_oil?.viscosity_options?.[0] || null;

        // Map recommended brands
        const engineOilBrands = variant.specifications.engine_oil?.recommended_brands?.join(", ") || null;
        const transmissionOilBrands = variant.specifications.transmission_oil?.recommended_brands?.join(", ") || null;

        // Map brake oil from brake_oil.type OR brakes.fluid_type
        const brakeOilType = variant.specifications.brake_oil?.type ||
            variant.specifications.brakes?.fluid_type || null;

        // Map differential oil to power_steering_oil columns (matching the fetcher logic behavior)
        // detailed in useEffect above: differential_oil maps to power_steering_oil_*
        const diffOil = variant.specifications.differential_oil || variant.specifications.diff_oil;
        const psOilCapacity = diffOil?.capacity_liter?.toString() ||
            variant.specifications.power_steering_oil?.capacity_liter?.toString() || null;
        const psOilType = diffOil?.type ||
            variant.specifications.power_steering_oil?.type || null;
        const psOilBrands = diffOil?.recommended_brands?.join(", ") ||
            variant.specifications.power_steering_oil?.recommended_brands?.join(", ") || null;

        // Map tires from legacy object OR array (ImportDialog uses tires array)
        // Use 'any' type to handle union of TireSpec definitions
        const tireSpec: any = variant.specifications.tire || variant.specifications.tires?.[0] || {};
        const tireBrands = tireSpec.recommended_brands?.join(", ") || null;

        // Helpers to extract part data from 'parts' array if 'filters' object is missing
        const getPart = (category: string, namePart: string) => {
            return variant.specifications.parts?.find(p => p.category === category && p.name === namePart);
        };
        const getPartBrands = (category: string, namePart: string) => {
            const part = getPart(category, namePart);
            return part?.compatible_brands?.join(", ") || null;
        };
        const getPartNumber = (category: string, namePart: string) => {
            const part = getPart(category, namePart);
            if (!part) return null;

            // Reconstruct part_number string with interval if it exists
            let partString = part.part_number || "";
            if (part.replacement_interval_km) {
                partString += ` [${part.replacement_interval_km} KM]`;
            }
            return partString || null;
        };

        // Extract Filter values (try legacy object first, then parts array)
        // Note: AddDataDialog uses "Spark Plug" as name, type is "Busi" in category logic above but here we search by Name if available
        // Actually AddDataDialog saves: category="Busi", name="Spark Plug"
        const sparkPlug = variant.specifications.filters?.spark_plug || getPartNumber("Busi", "Spark Plug");
        const sparkPlugBrands = getPartBrands("Busi", "Spark Plug");

        const airFilter = variant.specifications.filters?.air_filter || getPartNumber("Filter Udara", "Air Filter");
        const airFilterBrands = getPartBrands("Filter Udara", "Air Filter");

        const cabinFilter = variant.specifications.filters?.cabin_filter || getPartNumber("Filter Kabin", "Cabin Filter");
        const cabinFilterBrands = getPartBrands("Filter Kabin", "Cabin Filter");

        // Fuel Filter might be "Filter Bensin" or "Filter Solar"
        const fuelFilter = variant.specifications.filters?.fuel_filter || getPartNumber("Filter Bensin", "Fuel Filter") || getPartNumber("Filter Solar", "Fuel Filter");
        const fuelFilterBrands = getPartBrands("Filter Bensin", "Fuel Filter") || getPartBrands("Filter Solar", "Fuel Filter");

        const oilFilter = variant.specifications.filters?.oil_filter || getPartNumber("Filter Oli", "Oil Filter");
        const oilFilterBrands = getPartBrands("Filter Oli", "Oil Filter");

        return {
            brand_id: brandId,
            model_id: modelId,
            variant_name: variant.name,
            year_start: variant.year_start || new Date().getFullYear(),
            year_end: variant.year_end || null,
            engine_type: variant.engine_type || null,

            engine_oil_capacity: variant.specifications.engine_oil?.capacity_liter?.toString() || null,
            engine_oil_type: engineOilType,
            engine_oil_recommended_brands: engineOilBrands,

            transmission_oil_capacity: variant.specifications.transmission_oil?.capacity_liter?.toString() || null,
            transmission_oil_type: variant.specifications.transmission_oil?.type || null,
            transmission_oil_recommended_brands: transmissionOilBrands,

            // Mapping Differential Oil input to Power Steering columns as per existing schema reuse
            power_steering_oil_capacity: psOilCapacity,
            power_steering_oil_type: psOilType,
            power_steering_oil_recommended_brands: psOilBrands,

            brake_oil_type: brakeOilType,

            radiator_coolant_capacity: variant.specifications.radiator_coolant?.capacity || null,
            radiator_coolant_type: variant.specifications.radiator_coolant?.type || null,

            ac_freon_capacity: variant.specifications.ac_freon?.capacity || null,
            ac_freon_type: variant.specifications.ac_freon?.type || null,

            tire_size_front: tireSpec.front_size || tireSpec.size || null,
            tire_size_rear: tireSpec.rear_size || tireSpec.size || null,
            tire_pressure_front: tireSpec.front_pressure?.toString() || tireSpec.pressure_psi_front?.toString() || null,
            tire_pressure_rear: tireSpec.rear_pressure?.toString() || tireSpec.pressure_psi_rear?.toString() || null,
            tire_load_speed_index: tireSpec.load_speed_index || null,
            tire_recommended_brands: tireBrands,

            // Reconstruct battery_type string to include type, model, ampere, voltage, dimensions
            // Format: "Type Model AmpereAh VoltageV [Dimensions]"
            // Example: "MF 55D23L 55Ah 12V [238x175x190]"
            battery_type: variant.specifications.battery ? (() => {
                const b = variant.specifications.battery;
                let batteryString = "";

                // Add type if available (e.g., "MF", "Kering", "Basah")
                if (b.type && b.type !== "Aki Mobil") {
                    batteryString += b.type + " ";
                }

                // Add model code (e.g., "55D23L")
                if (b.model) {
                    batteryString += b.model + " ";
                }

                // Add ampere (e.g., "55Ah")
                if (b.ampere) {
                    batteryString += b.ampere + "Ah ";
                }

                // Add voltage (e.g., "12V")
                if (b.voltage) {
                    batteryString += b.voltage + "V ";
                }

                // Add dimensions (e.g., "[238x175x190]")
                if (b.dimensions) {
                    batteryString += "[" + b.dimensions + "]";
                }

                return batteryString.trim() || null;
            })() : null,
            battery_ampere: variant.specifications.battery?.ampere || null,
            battery_voltage: variant.specifications.battery?.voltage || null,
            battery_dimensions: variant.specifications.battery?.dimensions || null,

            wiper_size_driver: variant.specifications.wiper?.driver || null,
            wiper_size_passenger: variant.specifications.wiper?.passenger || null,
            wiper_size_rear: variant.specifications.wiper?.rear || null,

            spark_plug_type: sparkPlug,
            spark_plug_recommended_brands: sparkPlugBrands,
            air_filter_type: airFilter,
            air_filter_recommended_brands: airFilterBrands,
            cabin_filter_type: cabinFilter,
            cabin_filter_recommended_brands: cabinFilterBrands,
            fuel_filter_type: fuelFilter,
            fuel_filter_recommended_brands: fuelFilterBrands,
            oil_filter_type: oilFilter,
            oil_filter_recommended_brands: oilFilterBrands,

            brake_pad_front_type: variant.specifications.brake_parts?.front_pad || variant.specifications.brakes?.pad_part_number_front || null,
            brake_pad_front_recommended_brands: variant.specifications.brakes?.recommended_brands_front?.join(", ") || null,
            brake_pad_rear_type: variant.specifications.brake_parts?.rear_pad || variant.specifications.brakes?.shoe_part_number_rear || null,
            brake_pad_rear_recommended_brands: variant.specifications.brakes?.recommended_brands_rear?.join(", ") || null,
            brake_disc_front_type: variant.specifications.brake_parts?.front_disc || variant.specifications.brakes?.front_type || null,
            brake_disc_rear_type: variant.specifications.brake_parts?.rear_disc || variant.specifications.brakes?.rear_type || null,

            shock_depan_recommended_brands: variant.specifications.suspension?.shock_absorber_front_brands?.join(", ") || null,
            shock_belakang_recommended_brands: variant.specifications.suspension?.shock_absorber_rear_brands?.join(", ") || null,
            rack_end_recommended_brands: variant.specifications.suspension?.rack_end_brands?.join(", ") || null,
            tie_rod_recommended_brands: variant.specifications.suspension?.tie_rod_end_brands?.join(", ") || null,
            link_stabilizer_recommended_brands: variant.specifications.suspension?.link_stabilizer_brands?.join(", ") || null,
            lower_arm_recommended_brands: variant.specifications.suspension?.lower_arm_brands?.join(", ") || null,
            upper_arm_recommended_brands: variant.specifications.suspension?.upper_arm_brands?.join(", ") || null,
            upper_support_recommended_brands: variant.specifications.suspension?.upper_support_brands?.join(", ") || null,

            created_by: user?.id || null
        };
    };

    // Add variant mutation
    const addVariantMutation = useMutation({
        mutationFn: async ({ brandName, modelName, variant }: { brandName: string; modelName: string; variant: VehicleVariant }) => {
            // Find brand and model IDs
            const brand = supabaseBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
            const model = brand?.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

            if (!brand || !model) {
                throw new Error("Brand or model not found");
            }

            const dbData = variantToDbFormat(variant, brand.id, model.id);

            const { data, error } = await supabase
                .from("vehicle_specifications")
                .insert(dbData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-specifications"] });
            toast({
                title: "Berhasil",
                description: "Data berhasil ditambahkan",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    // Update variant mutation
    const updateVariantMutation = useMutation({
        mutationFn: async ({ brandName, modelName, updatedVariant }: { brandName: string; modelName: string; updatedVariant: VehicleVariant }) => {
            const brand = supabaseBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
            const model = brand?.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

            if (!brand || !model) {
                throw new Error("Brand or model not found");
            }

            const dbData = variantToDbFormat(updatedVariant, brand.id, model.id);

            const { data, error } = await supabase
                .from("vehicle_specifications")
                .update(dbData)
                .eq("id", updatedVariant.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-specifications"] });
            toast({
                title: "Berhasil",
                description: "Data berhasil diupdate",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    // Delete variant mutation
    const deleteVariantMutation = useMutation({
        mutationFn: async (variantId: string) => {
            const { error } = await supabase
                .from("vehicle_specifications")
                .delete()
                .eq("id", variantId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-specifications"] });
            toast({
                title: "Berhasil",
                description: "Data berhasil dihapus",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    // Import vehicle data mutation with batching and robust auto-create brand/model
    const importDataMutation = useMutation({
        mutationFn: async (data: { brand: string; model: string; variant: VehicleVariant }[]) => {
            console.log("Starting Import. Total rows:", data.length);
            console.log("Current User ID for RLS:", user?.id);

            const insertData = [];
            // Create a local cache of brands/models to avoid refetching constantly
            // We start with the currently loaded brands, but deep copy to modify local state
            let localBrands = JSON.parse(JSON.stringify(supabaseBrands));
            let newBrandsCount = 0;
            let newModelsCount = 0;

            for (const [index, item] of data.entries()) {
                let brandId = "";
                let modelId = "";

                const brandName = String(item.brand || "").trim();
                const modelName = String(item.model || "").trim();

                if (!brandName || !modelName) {
                    console.warn(`Skipping row ${index + 1}: Missing Brand or Model`, item);
                    continue;
                }

                // 1. Find or Create Brand
                let brandIndex = localBrands.findIndex((b: any) => b.name.toLowerCase() === brandName.toLowerCase());

                if (brandIndex === -1) {
                    // Try to Create Brand
                    try {
                        console.log(`Creating new brand: ${brandName}`);
                        const { data: newBrand, error: brandError } = await supabase
                            .from("car_brands")
                            .insert({ name: brandName })
                            .select("id, name")
                            .single();

                        if (brandError) {
                            if (brandError.code === '23505') { // Unique violation
                                console.log(`Brand exists (race condition): ${brandName}`);
                                const { data: existingBrand } = await supabase
                                    .from("car_brands")
                                    .select("id, name")
                                    .ilike("name", brandName)
                                    .single();
                                if (existingBrand) {
                                    const newBrandObj = { ...existingBrand, models: [] };
                                    localBrands.push(newBrandObj);
                                    brandIndex = localBrands.length - 1;
                                    brandId = existingBrand.id;
                                } else {
                                    console.error("Failed to recover existing brand:", brandName);
                                    throw brandError;
                                }
                            } else {
                                console.error("Error creating brand:", brandError);
                                throw brandError;
                            }
                        } else {
                            newBrandsCount++;
                            const newBrandObj = { ...newBrand, models: [] };
                            localBrands.push(newBrandObj);
                            brandIndex = localBrands.length - 1;
                            brandId = newBrand.id;
                        }
                    } catch (e) {
                        // Fallback try to fetch if insert threw generic error but maybe it exists
                        const { data: existingBrand } = await supabase
                            .from("car_brands")
                            .select("id, name")
                            .ilike("name", brandName)
                            .single();
                        if (existingBrand) {
                            const newBrandObj = { ...existingBrand, models: [] };
                            localBrands.push(newBrandObj);
                            brandIndex = localBrands.length - 1;
                            brandId = existingBrand.id;
                        } else {
                            throw e;
                        }
                    }
                } else {
                    brandId = localBrands[brandIndex].id;
                }

                // 2. Find or Create Model
                const currentBrand = localBrands[brandIndex];
                // Need to fetch models if they are empty (potentially fresh brand obj) but we only populated it with []?
                // Actually if we just fetched the brand from DB, it has no models loaded.
                // But we can check if model exists in DB if not found in local array.

                let model = currentBrand.models.find((m: any) => m.name.toLowerCase() === modelName.toLowerCase());

                if (!model) {
                    try {
                        console.log(`Creating new model: ${modelName} for brand ${currentBrand.name}`);
                        const { data: newModel, error: modelError } = await supabase
                            .from("car_models")
                            .insert({ name: modelName, brand_id: brandId })
                            .select("id, name, brand_id")
                            .single();

                        if (modelError) {
                            if (modelError.code === '23505') {
                                console.log(`Model exists (race condition): ${modelName}`);
                                const { data: existingModel } = await supabase
                                    .from("car_models")
                                    .select("id, name, brand_id")
                                    .eq("brand_id", brandId)
                                    .ilike("name", modelName)
                                    .single();

                                if (existingModel) {
                                    currentBrand.models.push(existingModel);
                                    modelId = existingModel.id;
                                } else {
                                    // Sometimes race condition creates duplicates if we are not careful?
                                    // But we read it. If it fails, we really can't proceed.
                                    console.error("Failed to recover existing model:", modelName);
                                    throw modelError;
                                }
                            } else {
                                console.error("Error creating model:", modelError);
                                throw modelError;
                            }
                        } else {
                            newModelsCount++;
                            currentBrand.models.push(newModel);
                            modelId = newModel.id;
                        }
                    } catch (e) {
                        const { data: existingModel } = await supabase
                            .from("car_models")
                            .select("id, name, brand_id")
                            .eq("brand_id", brandId)
                            .ilike("name", modelName)
                            .single();

                        if (existingModel) {
                            currentBrand.models.push(existingModel);
                            modelId = existingModel.id;
                        } else {
                            throw e;
                        }
                    }
                } else {
                    modelId = model.id;
                }

                if (brandId && modelId) {
                    insertData.push(variantToDbFormat(item.variant, brandId, modelId));
                }
            }

            console.log(`Prepared ${insertData.length} records for upsert.`);
            console.log(`Created ${newBrandsCount} new brands and ${newModelsCount} new models locally.`);

            // Batch processing
            const BATCH_SIZE = 50;
            const results = [];

            for (let i = 0; i < insertData.length; i += BATCH_SIZE) {
                const batch = insertData.slice(i, i + BATCH_SIZE);
                console.log(`Upserting batch ${i / BATCH_SIZE + 1} size: ${batch.length}`);

                const { data: result, error } = await supabase
                    .from("vehicle_specifications")
                    .upsert(batch, {
                        onConflict: "brand_id,model_id,variant_name,year_start",
                        ignoreDuplicates: false
                    })
                    .select();

                if (error) {
                    console.error("Upsert error:", error);
                    throw error;
                }
                if (result) {
                    console.log(`Batch ${i / BATCH_SIZE + 1} success. Upserted/Returned: ${result.length}`);
                    results.push(...result);
                }
            }

            console.log("Import completed. Total results:", results.length);
            return results;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-specifications"] });
            // Also invalidate brands because we might have added new ones
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            refreshVehicles();
            toast({
                title: "Berhasil",
                description: `Import selesai. ${data.length} data diproses.`, // Verbose success message
            });
        },
        onError: (error: any) => {
            console.error("Mutation Error:", error);
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const addVariantData = (brandName: string, modelName: string, variant: VehicleVariant) => {
        addVariantMutation.mutate({ brandName, modelName, variant });
    };

    const updateVariantData = (brandName: string, modelName: string, updatedVariant: VehicleVariant) => {
        updateVariantMutation.mutate({ brandName, modelName, updatedVariant });
    };

    const deleteVariantData = (brandName: string, modelName: string, variantId: string) => {
        deleteVariantMutation.mutate(variantId);
    };

    const importVehicleData = (data: { brand: string; model: string; variant: VehicleVariant }[]) => {
        importDataMutation.mutate(data);
    };

    return {
        vehicles: completeData,
        supabaseBrands,
        isSupabaseLoading: isSupabaseLoading || isSpecsLoading,
        error, // Expose error
        refreshVehicles,
        addVariantData,
        updateVariantData,
        deleteVariantData,
        importVehicleData
    };
}
