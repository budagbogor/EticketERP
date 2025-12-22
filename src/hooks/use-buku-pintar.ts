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

                // Convert Supabase specs to VehicleVariant format with nested specifications
                const supabaseVariants: VehicleVariant[] = supabaseSpecs.map((spec: any) => ({
                    id: spec.id,
                    name: spec.variant_name,
                    year_start: spec.year_start,
                    year_end: spec.year_end,
                    engine_type: spec.engine_type,
                    transmission: "AT" as any, // Default, will be updated if needed
                    engine_code: "", // Not stored in Supabase yet
                    specifications: {
                        engine_oil: {
                            viscosity_options: spec.engine_oil_type ? [spec.engine_oil_type] : [],
                            capacity_liter: parseFloat(spec.engine_oil_capacity) || 0,
                            capacity_with_filter_liter: parseFloat(spec.engine_oil_capacity) || 0,
                            quality_standard: spec.engine_oil_type || "",
                            recommended_brands: []
                        },
                        transmission_oil: {
                            type: spec.transmission_oil_type || "",
                            capacity_liter: parseFloat(spec.transmission_oil_capacity) || 0,
                            recommended_brands: []
                        },
                        differential_oil: spec.power_steering_oil_type ? {
                            type: spec.power_steering_oil_type,
                            capacity_liter: parseFloat(spec.power_steering_oil_capacity) || 0,
                            recommended_brands: []
                        } : undefined,
                        parts: [
                            ...(spec.oil_filter_type ? [{
                                category: "Filter Oli" as any,
                                name: spec.oil_filter_type,
                                part_number: "",
                                compatible_brands: []
                            }] : []),
                            ...(spec.air_filter_type ? [{
                                category: "Filter Udara" as any,
                                name: spec.air_filter_type,
                                part_number: "",
                                compatible_brands: []
                            }] : []),
                            ...(spec.cabin_filter_type ? [{
                                category: "Filter Kabin" as any,
                                name: spec.cabin_filter_type,
                                part_number: "",
                                compatible_brands: []
                            }] : []),
                            ...(spec.spark_plug_type ? [{
                                category: "Busi" as any,
                                name: spec.spark_plug_type,
                                part_number: "",
                                compatible_brands: []
                            }] : []),
                            ...(spec.fuel_filter_type ? [{
                                category: "Filter Bensin" as any,
                                name: spec.fuel_filter_type,
                                part_number: "",
                                compatible_brands: []
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
                            size: spec.tire_size_front,
                            pressure_psi_front: parseFloat(spec.tire_pressure_front) || 0,
                            pressure_psi_rear: parseFloat(spec.tire_pressure_rear) || 0,
                            recommended_brands: []
                        }] : [],
                        suspension: {
                            shock_absorber_front: "",
                            shock_absorber_front_brands: spec.shock_depan_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            shock_absorber_rear: "",
                            shock_absorber_rear_brands: spec.shock_belakang_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            rack_end: "",
                            rack_end_brands: spec.rack_end_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            tie_rod_end: "",
                            tie_rod_end_brands: spec.tie_rod_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            link_stabilizer: "",
                            link_stabilizer_brands: spec.link_stabilizer_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            lower_arm: "",
                            lower_arm_brands: spec.lower_arm_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            upper_arm: "",
                            upper_arm_brands: spec.upper_arm_recommended_brands?.split(',').map((s: string) => s.trim()) || [],
                            upper_support: "",
                            upper_support_brands: spec.upper_support_recommended_brands?.split(',').map((s: string) => s.trim()) || []
                        },
                        battery: spec.battery_type ? {
                            type: spec.battery_type,
                            model: "",
                            ampere: 0,
                            voltage: 12
                        } : undefined,
                        brakes: {
                            front_type: spec.brake_disc_front_type || "",
                            rear_type: spec.brake_disc_rear_type || "",
                            fluid_type: spec.brake_oil_type || "",
                            pad_part_number_front: spec.brake_pad_front_type || "",
                            shoe_part_number_rear: spec.brake_pad_rear_type || "",
                            recommended_brands_front: [],
                            recommended_brands_rear: []
                        }
                    }
                }));

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
    const variantToDbFormat = (variant: VehicleVariant, brandId: string, modelId: string) => ({
        brand_id: brandId,
        model_id: modelId,
        variant_name: variant.name,
        year_start: variant.year_start || new Date().getFullYear(),
        year_end: variant.year_end || null,
        engine_type: variant.engine_type || null,
        engine_oil_capacity: variant.specifications.engine_oil?.capacity_liter?.toString() || null,
        engine_oil_type: variant.specifications.engine_oil?.type || null,
        transmission_oil_capacity: variant.specifications.transmission_oil?.capacity_liter?.toString() || null,
        transmission_oil_type: variant.specifications.transmission_oil?.type || null,
        power_steering_oil_capacity: variant.specifications.power_steering_oil?.capacity_liter?.toString() || null,
        power_steering_oil_type: variant.specifications.power_steering_oil?.type || null,
        brake_oil_type: variant.specifications.brake_oil?.type || null,
        radiator_coolant_capacity: variant.specifications.radiator_coolant?.capacity || null,
        radiator_coolant_type: variant.specifications.radiator_coolant?.type || null,
        ac_freon_capacity: variant.specifications.ac_freon?.capacity || null,
        ac_freon_type: variant.specifications.ac_freon?.type || null,
        tire_size_front: variant.specifications.tire?.front_size || null,
        tire_size_rear: variant.specifications.tire?.rear_size || null,
        tire_pressure_front: variant.specifications.tire?.front_pressure?.toString() || null,
        tire_pressure_rear: variant.specifications.tire?.rear_pressure?.toString() || null,
        battery_type: variant.specifications.battery?.type || null,
        wiper_size_driver: variant.specifications.wiper?.driver || null,
        wiper_size_passenger: variant.specifications.wiper?.passenger || null,
        wiper_size_rear: variant.specifications.wiper?.rear || null,
        spark_plug_type: variant.specifications.filters?.spark_plug || null,
        air_filter_type: variant.specifications.filters?.air_filter || null,
        cabin_filter_type: variant.specifications.filters?.cabin_filter || null,
        fuel_filter_type: variant.specifications.filters?.fuel_filter || null,
        oil_filter_type: variant.specifications.filters?.oil_filter || null,
        brake_pad_front_type: variant.specifications.brake_parts?.front_pad || null,
        brake_pad_rear_type: variant.specifications.brake_parts?.rear_pad || null,
        brake_disc_front_type: variant.specifications.brake_parts?.front_disc || null,
        brake_disc_rear_type: variant.specifications.brake_parts?.rear_disc || null,
        shock_depan_recommended_brands: variant.specifications.suspension?.shock_absorber_front_brands?.join(", ") || null,
        shock_belakang_recommended_brands: variant.specifications.suspension?.shock_absorber_rear_brands?.join(", ") || null,
        rack_end_recommended_brands: variant.specifications.suspension?.rack_end_brands?.join(", ") || null,
        tie_rod_recommended_brands: variant.specifications.suspension?.tie_rod_end_brands?.join(", ") || null,
        link_stabilizer_recommended_brands: variant.specifications.suspension?.link_stabilizer_brands?.join(", ") || null,
        lower_arm_recommended_brands: variant.specifications.suspension?.lower_arm_brands?.join(", ") || null,
        upper_arm_recommended_brands: variant.specifications.suspension?.upper_arm_brands?.join(", ") || null,
        upper_support_recommended_brands: variant.specifications.suspension?.upper_support_brands?.join(", ") || null,
        created_by: user?.id || null
    });

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
