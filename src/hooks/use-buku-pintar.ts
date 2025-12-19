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

                // Helper to unpacking brands from "Value (Brand1, Brand2) [Interval KM]" format
                const unpack = (val: string | null) => {
                    if (!val) return { value: "", brands: [], interval: undefined };
                    // Match: Value(group1) optional (Brands)(group2) optional [Interval KM](group3)
                    const match = val.match(/^(.*?)(?:\s\((.+)\))?(?:\s\[(\d+)\sKM\])?$/);
                    if (match) {
                        return {
                            value: match[1],
                            brands: match[2] ? match[2].split(",").map(s => s.trim()) : [],
                            interval: match[3] ? parseInt(match[3]) : undefined
                        };
                    }
                    return { value: val, brands: [], interval: undefined };
                };

                const unpackTire = (val: string | null) => {
                    if (!val) return { size: "", brands: [] as string[], loadIndex: "" };
                    // Match: Size (Brands) [LoadIndex]
                    const match = val.match(/^(.*?)(?:\s\((.+)\))?(?:\s\[(.+)\])?$/);
                    if (match) {
                        return {
                            size: match[1]?.trim() || "",
                            brands: match[2] ? match[2].split(",").map(b => b.trim()) : [],
                            loadIndex: match[3]?.trim() || ""
                        };
                    }
                    return { size: val, brands: [], loadIndex: "" };
                };

                // Helper to unpacking battery from "Type (Model) 45Ah 12V" format
                const unpackBattery = (val: string | null) => {
                    if (!val) return { type: "", model: "", ampere: 0, voltage: 12, dimensions: "" };

                    let remaining = val;
                    let dimensions = "";
                    let voltage = 12;
                    let ampere = 0;
                    let model = "";

                    // Extract Dimensions [xxx]
                    const dimMatch = remaining.match(/\[(.*?)\]/);
                    if (dimMatch) {
                        dimensions = dimMatch[1].trim();
                        remaining = remaining.replace(dimMatch[0], " ").trim();
                    }

                    // Extract Voltage (digits)V
                    const voltMatch = remaining.match(/\b(\d+)V\b/);
                    if (voltMatch) {
                        voltage = parseInt(voltMatch[1]);
                        remaining = remaining.replace(voltMatch[0], " ").trim();
                    }

                    // Extract Ampere (digits)Ah
                    const ampMatch = remaining.match(/\b(\d+)Ah\b/);
                    if (ampMatch) {
                        ampere = parseInt(ampMatch[1]);
                        remaining = remaining.replace(ampMatch[0], " ").trim();
                    }

                    // Extract Model (xxx)
                    const modelMatch = remaining.match(/\((.*?)\)/);
                    if (modelMatch) {
                        model = modelMatch[1].trim();
                        remaining = remaining.replace(modelMatch[0], " ").trim();
                    }

                    // Remainder is Type
                    return {
                        type: remaining.replace(/\s+/g, ' ').trim(),
                        model,
                        ampere,
                        voltage,
                        dimensions
                    };
                };

                // Helper to unpack suspension: "PartNumber | Brand1, Brand2"
                const unpackSuspension = (val: string | null) => {
                    if (!val) return { value: "", brands: [] as string[] };
                    const parts = val.split('|');
                    if (parts.length > 1) {
                        return {
                            value: parts[0].trim(),
                            brands: parts[1].split(',').map(s => s.trim()).filter(Boolean)
                        };
                    }
                    // Legacy: assume just brands if no pipe (or if only brands were stored previously)
                    return { value: "", brands: val.split(',').map(s => s.trim()) };
                };

                // Convert Supabase specs to VehicleVariant format with nested specifications
                const supabaseVariants: VehicleVariant[] = supabaseSpecs.map((spec: any) => {
                    const engineUnpacked = unpack(spec.engine_oil_type);
                    const transUnpacked = unpack(spec.transmission_oil_type);
                    const psUnpacked = unpack(spec.power_steering_oil_type);
                    const brakeFrontUnpacked = unpack(spec.brake_pad_front_type);
                    const brakeRearUnpacked = unpack(spec.brake_pad_rear_type);
                    const batteryUnpacked = unpackBattery(spec.battery_type);

                    // Unpack suspension
                    const shockFront = unpackSuspension(spec.shock_depan_recommended_brands);
                    const shockRear = unpackSuspension(spec.shock_belakang_recommended_brands);
                    const rackEnd = unpackSuspension(spec.rack_end_recommended_brands);
                    const tieRod = unpackSuspension(spec.tie_rod_recommended_brands);
                    const linkStabilizer = unpackSuspension(spec.link_stabilizer_recommended_brands);
                    const lowerArm = unpackSuspension(spec.lower_arm_recommended_brands);
                    const upperArm = unpackSuspension(spec.upper_arm_recommended_brands);
                    const upperSupport = unpackSuspension(spec.upper_support_recommended_brands);

                    return {
                        id: spec.id,
                        name: spec.variant_name,
                        year_start: spec.year_start,
                        year_end: spec.year_end,
                        engine_type: spec.engine_type,
                        transmission: "AT" as any, // Default, will be updated if needed
                        engine_code: "", // Not stored in Supabase yet
                        specifications: {
                            engine_oil: {
                                viscosity_options: engineUnpacked.value ? [engineUnpacked.value.split(" / ")[0]] : [],
                                capacity_liter: parseFloat(spec.engine_oil_capacity?.replace(",", ".")) || 0,
                                capacity_with_filter_liter: (parseFloat(spec.engine_oil_capacity?.replace(",", ".")) || 4) + 0.2,
                                capacity: spec.engine_oil_capacity, // Map raw string
                                quality_standard: engineUnpacked.value?.split(" / ")[1] || engineUnpacked.value || "",
                                recommended_brands: engineUnpacked.brands,
                                replacement_interval_km: engineUnpacked.interval
                            },
                            transmission_oil: {
                                type: transUnpacked.value || "",
                                capacity_liter: parseFloat(spec.transmission_oil_capacity?.replace(",", ".")) || 0,
                                capacity: spec.transmission_oil_capacity, // Map raw string
                                recommended_brands: transUnpacked.brands,
                                replacement_interval_km: transUnpacked.interval
                            },
                            differential_oil: spec.power_steering_oil_type ? {
                                type: psUnpacked.value,
                                capacity_liter: parseFloat(spec.power_steering_oil_capacity?.replace(",", ".")) || 0,
                                capacity: spec.power_steering_oil_capacity, // Map raw string
                                recommended_brands: psUnpacked.brands,
                                replacement_interval_km: psUnpacked.interval
                            } : undefined,
                            power_steering_oil: spec.power_steering_oil_type ? { // Add this for completeness even if aliased
                                type: psUnpacked.value,
                                capacity_liter: parseFloat(spec.power_steering_oil_capacity?.replace(",", ".")) || 0,
                                capacity: spec.power_steering_oil_capacity, // Map raw string
                                recommended_brands: psUnpacked.brands,
                                replacement_interval_km: psUnpacked.interval
                            } : undefined,
                            brake_oil: spec.brake_oil_type ? {
                                type: spec.brake_oil_type
                            } : undefined,
                            radiator_coolant: spec.radiator_coolant_type ? {
                                type: spec.radiator_coolant_type,
                                capacity: spec.radiator_coolant_capacity
                            } : undefined,
                            ac_freon: spec.ac_freon_type ? {
                                type: spec.ac_freon_type,
                                capacity: spec.ac_freon_capacity
                            } : undefined,
                            parts: [
                                ...(spec.oil_filter_type ? [{
                                    category: "Filter Oli" as any,
                                    name: "Oil Filter",
                                    part_number: unpack(spec.oil_filter_type).value,
                                    compatible_brands: unpack(spec.oil_filter_type).brands,
                                    replacement_interval_km: unpack(spec.oil_filter_type).interval
                                }] : []),
                                ...(spec.air_filter_type ? [{
                                    category: "Filter Udara" as any,
                                    name: "Air Filter",
                                    part_number: unpack(spec.air_filter_type).value,
                                    compatible_brands: unpack(spec.air_filter_type).brands,
                                    replacement_interval_km: unpack(spec.air_filter_type).interval
                                }] : []),
                                ...(spec.cabin_filter_type ? [{
                                    category: "Filter Kabin" as any,
                                    name: "Cabin Filter",
                                    part_number: unpack(spec.cabin_filter_type).value,
                                    compatible_brands: unpack(spec.cabin_filter_type).brands,
                                    replacement_interval_km: unpack(spec.cabin_filter_type).interval
                                }] : []),
                                ...(spec.spark_plug_type ? [{
                                    category: "Busi" as any,
                                    name: "Spark Plug",
                                    part_number: unpack(spec.spark_plug_type).value,
                                    compatible_brands: unpack(spec.spark_plug_type).brands,
                                    replacement_interval_km: unpack(spec.spark_plug_type).interval
                                }] : []),
                                ...(spec.fuel_filter_type ? [{
                                    category: "Filter Bensin" as any,
                                    name: "Fuel Filter",
                                    part_number: unpack(spec.fuel_filter_type).value,
                                    compatible_brands: unpack(spec.fuel_filter_type).brands,
                                    replacement_interval_km: unpack(spec.fuel_filter_type).interval
                                }] : []),
                                ...(spec.wiper_size_driver ? [{
                                    category: "Wiper" as any,
                                    name: `Driver: ${spec.wiper_size_driver}, Passenger: ${spec.wiper_size_passenger || '-'}, Rear: ${spec.wiper_size_rear || '-'}`,
                                    part_number: "",
                                    compatible_brands: []
                                }] : [])
                            ],
                            tires: spec.tire_size_front ? [{
                                location: "Depan & Belakang" as any,
                                size: unpackTire(spec.tire_size_front).size,
                                pressure_psi_front: parseFloat(spec.tire_pressure_front) || 0,
                                pressure_psi_rear: parseFloat(spec.tire_pressure_rear) || 0,
                                load_speed_index: unpackTire(spec.tire_size_front).loadIndex,
                                recommended_brands: unpackTire(spec.tire_size_front).brands
                            }] : [],
                            suspension: {
                                shock_absorber_front: shockFront.value,
                                shock_absorber_front_brands: shockFront.brands,
                                shock_absorber_rear: shockRear.value,
                                shock_absorber_rear_brands: shockRear.brands,
                                rack_end: rackEnd.value,
                                rack_end_brands: rackEnd.brands,
                                tie_rod_end: tieRod.value,
                                tie_rod_end_brands: tieRod.brands,
                                link_stabilizer: linkStabilizer.value,
                                link_stabilizer_brands: linkStabilizer.brands,
                                lower_arm: lowerArm.value,
                                lower_arm_brands: lowerArm.brands,
                                upper_arm: upperArm.value,
                                upper_arm_brands: upperArm.brands,
                                upper_support: upperSupport.value,
                                upper_support_brands: upperSupport.brands
                            },

                            battery: spec.battery_type ? {
                                type: batteryUnpacked.type,
                                model: batteryUnpacked.model,
                                ampere: batteryUnpacked.ampere,
                                voltage: batteryUnpacked.voltage,
                                dimensions: batteryUnpacked.dimensions
                            } : undefined,
                            brakes: {
                                front_type: spec.brake_disc_front_type || "",
                                rear_type: spec.brake_disc_rear_type || "",
                                fluid_type: spec.brake_oil_type || "",
                                pad_part_number_front: brakeFrontUnpacked.value || "",
                                shoe_part_number_rear: brakeRearUnpacked.value || "",
                                recommended_brands_front: brakeFrontUnpacked.brands,
                                recommended_brands_rear: brakeRearUnpacked.brands
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
        // Alias differential_oil (Oli Gardan) to power_steering_oil columns if PS not present, to preserve data
        // Priority: Differential > Power Steering (Fix shadowing issue where old PS data overwrites new Diff data)
        const psType = variant.specifications.differential_oil?.type || variant.specifications.power_steering_oil?.type || null;

        // Packing helper
        const pack = (val: string | undefined | null, brands: string[] | undefined, interval: number | undefined | null = undefined) => {
            let result = val || "";
            if (brands && brands.length > 0) {
                result += ` (${brands.join(", ")})`;
            }
            if (interval) {
                result += ` [${interval} KM]`;
            }
            return result.trim() || null;
        };

        // Use string capacity first, fall back to liters converted to string
        const psCap = variant.specifications.differential_oil?.capacity || variant.specifications.differential_oil?.capacity_liter?.toString() ||
            variant.specifications.power_steering_oil?.capacity || variant.specifications.power_steering_oil?.capacity_liter?.toString() || null;

        const engineOilCap = variant.specifications.engine_oil?.capacity || variant.specifications.engine_oil?.capacity_liter?.toString() || null;
        const transOilCap = variant.specifications.transmission_oil?.capacity || variant.specifications.transmission_oil?.capacity_liter?.toString() || null;

        // Extract parts from the array for DB mapping
        const getPart = (category: string, nameIncludes: string = "") => {
            return variant.specifications.parts?.find(p =>
                p.category === category &&
                (nameIncludes ? p.name?.toLowerCase().includes(nameIncludes.toLowerCase()) : true)
            );
        };

        const oilFilter = getPart("Filter Oli");
        const airFilter = getPart("Filter Udara");
        const cabinFilter = getPart("Filter Kabin");
        const fuelFilter = getPart("Filter Bensin") || getPart("Filter Solar");
        const sparkPlug = getPart("Busi");

        const wiperDriver = getPart("Wiper", "Driver")?.part_number || getPart("Wiper", "Depan (Kanan)")?.part_number || variant.specifications.wiper?.driver;
        const wiperPassenger = getPart("Wiper", "Passenger")?.part_number || getPart("Wiper", "Depan (Kiri)")?.part_number || variant.specifications.wiper?.passenger;
        const wiperRear = getPart("Wiper", "Rear")?.part_number || getPart("Wiper", "Belakang")?.part_number || variant.specifications.wiper?.rear;

        // Extract tires
        const tireFront = variant.specifications.tires?.find(t => t.location === "Depan" || t.location === "Depan & Belakang");
        const tireRear = variant.specifications.tires?.find(t => t.location === "Belakang" || t.location === "Depan & Belakang");

        return {
            brand_id: brandId,
            model_id: modelId,
            variant_name: variant.name,
            year_start: variant.year_start || new Date().getFullYear(),
            year_end: variant.year_end || null,
            engine_type: variant.engine_type || null,
            engine_oil_capacity: engineOilCap,
            // Pack Brands into Type
            engine_oil_type: pack(
                `${variant.specifications.engine_oil?.viscosity_options?.[0] || variant.specifications.engine_oil?.type || ""}${variant.specifications.engine_oil?.quality_standard ? ` / ${variant.specifications.engine_oil.quality_standard}` : ""}`.trim(),
                variant.specifications.engine_oil?.recommended_brands,
                variant.specifications.engine_oil?.replacement_interval_km
            ),
            transmission_oil_capacity: transOilCap,
            transmission_oil_type: pack(variant.specifications.transmission_oil?.type, variant.specifications.transmission_oil?.recommended_brands, variant.specifications.transmission_oil?.replacement_interval_km),
            power_steering_oil_capacity: psCap,
            power_steering_oil_type: pack(psType, variant.specifications.differential_oil?.recommended_brands || variant.specifications.power_steering_oil?.recommended_brands, variant.specifications.differential_oil?.replacement_interval_km || variant.specifications.power_steering_oil?.replacement_interval_km),
            brake_oil_type: variant.specifications.brakes?.fluid_type || variant.specifications.brake_oil?.type || null,
            radiator_coolant_capacity: variant.specifications.radiator_coolant?.capacity || null,
            radiator_coolant_type: variant.specifications.radiator_coolant?.type || null,
            ac_freon_capacity: variant.specifications.ac_freon?.capacity || null,
            ac_freon_type: variant.specifications.ac_freon?.type || null,

            // Pack Tire Data: Size (Brands) [Load Index]
            tire_size_front: tireFront ?
                `${tireFront.size}${tireFront.recommended_brands?.length ? ` (${tireFront.recommended_brands.join(", ")})` : ''}${tireFront.load_speed_index ? ` [${tireFront.load_speed_index}]` : ''}`.trim()
                : variant.specifications.tire?.front_size || null,

            tire_size_rear: tireRear ?
                `${tireRear.size}${tireRear.recommended_brands?.length ? ` (${tireRear.recommended_brands.join(", ")})` : ''}${tireRear.load_speed_index ? ` [${tireRear.load_speed_index}]` : ''}`.trim()
                : variant.specifications.tire?.rear_size || null,

            tire_pressure_front: tireFront?.pressure_psi_front?.toString() || variant.specifications.tire?.front_pressure?.toString() || null,
            tire_pressure_rear: tireRear?.pressure_psi_rear?.toString() || variant.specifications.tire?.rear_pressure?.toString() || null,

            // Pack Battery Details into battery_type since schema is limited
            battery_type: variant.specifications.battery ?
                `${variant.specifications.battery.type || ''} ${variant.specifications.battery.model ? `(${variant.specifications.battery.model})` : ''} ${variant.specifications.battery.ampere ? ` ${variant.specifications.battery.ampere}Ah` : ''} ${variant.specifications.battery.voltage ? `${variant.specifications.battery.voltage}V` : ''} ${variant.specifications.battery.dimensions ? `[${variant.specifications.battery.dimensions}]` : ''}`.trim()
                : null,

            wiper_size_driver: wiperDriver || null,
            wiper_size_passenger: wiperPassenger || null,
            wiper_size_rear: wiperRear || null,
            // Pack Parts Brands
            spark_plug_type: pack(sparkPlug?.part_number || variant.specifications.filters?.spark_plug, sparkPlug?.compatible_brands, sparkPlug?.replacement_interval_km),
            air_filter_type: pack(airFilter?.part_number || variant.specifications.filters?.air_filter, airFilter?.compatible_brands, airFilter?.replacement_interval_km),
            cabin_filter_type: pack(cabinFilter?.part_number || variant.specifications.filters?.cabin_filter, cabinFilter?.compatible_brands, cabinFilter?.replacement_interval_km),
            fuel_filter_type: pack(fuelFilter?.part_number || variant.specifications.filters?.fuel_filter, fuelFilter?.compatible_brands, fuelFilter?.replacement_interval_km),
            oil_filter_type: pack(oilFilter?.part_number || variant.specifications.filters?.oil_filter, oilFilter?.compatible_brands, oilFilter?.replacement_interval_km),
            // Pack Brake Brands
            brake_pad_front_type: pack(variant.specifications.brake_parts?.front_pad || variant.specifications.brakes?.pad_part_number_front, variant.specifications.brakes?.recommended_brands_front),
            brake_pad_rear_type: pack(variant.specifications.brake_parts?.rear_pad || variant.specifications.brakes?.shoe_part_number_rear, variant.specifications.brakes?.recommended_brands_rear),
            brake_disc_front_type: variant.specifications.brake_parts?.front_disc || variant.specifications.brakes?.front_type || null,
            brake_disc_rear_type: variant.specifications.brake_parts?.rear_disc || variant.specifications.brakes?.rear_type || null,

            // Pack Suspension Part Numbers with Brands (using pipe | separator as done previously)
            shock_depan_recommended_brands: ((variant.specifications.suspension?.shock_absorber_front ? `${variant.specifications.suspension.shock_absorber_front} | ` : "") + (variant.specifications.suspension?.shock_absorber_front_brands?.join(", ") || "")).trim() || null,
            shock_belakang_recommended_brands: ((variant.specifications.suspension?.shock_absorber_rear ? `${variant.specifications.suspension.shock_absorber_rear} | ` : "") + (variant.specifications.suspension?.shock_absorber_rear_brands?.join(", ") || "")).trim() || null,
            rack_end_recommended_brands: ((variant.specifications.suspension?.rack_end ? `${variant.specifications.suspension.rack_end} | ` : "") + (variant.specifications.suspension?.rack_end_brands?.join(", ") || "")).trim() || null,
            tie_rod_recommended_brands: ((variant.specifications.suspension?.tie_rod_end ? `${variant.specifications.suspension.tie_rod_end} | ` : "") + (variant.specifications.suspension?.tie_rod_end_brands?.join(", ") || "")).trim() || null,
            link_stabilizer_recommended_brands: ((variant.specifications.suspension?.link_stabilizer ? `${variant.specifications.suspension.link_stabilizer} | ` : "") + (variant.specifications.suspension?.link_stabilizer_brands?.join(", ") || "")).trim() || null,
            lower_arm_recommended_brands: ((variant.specifications.suspension?.lower_arm ? `${variant.specifications.suspension.lower_arm} | ` : "") + (variant.specifications.suspension?.lower_arm_brands?.join(", ") || "")).trim() || null,
            upper_arm_recommended_brands: ((variant.specifications.suspension?.upper_arm ? `${variant.specifications.suspension.upper_arm} | ` : "") + (variant.specifications.suspension?.upper_arm_brands?.join(", ") || "")).trim() || null,
            upper_support_recommended_brands: ((variant.specifications.suspension?.upper_support ? `${variant.specifications.suspension.upper_support} | ` : "") + (variant.specifications.suspension?.upper_support_brands?.join(", ") || "")).trim() || null,
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
            // Force refetch
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
            // Force refetch
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

    // Import vehicle data mutation
    const importDataMutation = useMutation({
        mutationFn: async (data: { brand: string; model: string; variant: VehicleVariant }[]) => {
            const insertData = [];

            for (const item of data) {
                const brand = supabaseBrands.find(b => b.name.toLowerCase() === item.brand.toLowerCase());
                const model = brand?.models.find(m => m.name.toLowerCase() === item.model.toLowerCase());

                if (brand && model) {
                    insertData.push(variantToDbFormat(item.variant, brand.id, model.id));
                }
            }

            const { data: result, error } = await supabase
                .from("vehicle_specifications")
                .upsert(insertData, {
                    onConflict: "brand_id,model_id,variant_name,year_start",
                    ignoreDuplicates: false
                })
                .select();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-specifications"] });
            refreshVehicles();
            toast({
                title: "Berhasil",
                description: "Data berhasil diimport",
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
