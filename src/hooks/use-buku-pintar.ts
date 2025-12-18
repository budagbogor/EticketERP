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
    const { data: specifications = [], isLoading: isSpecsLoading } = useQuery({
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
                const supabaseSpecs = specifications.filter(
                    (spec: any) =>
                        spec.car_brands?.name.toLowerCase() === brand.name.toLowerCase() &&
                        spec.car_models?.name.toLowerCase() === model.name.toLowerCase()
                );

                // Convert Supabase specs to VehicleVariant format
                const supabaseVariants: VehicleVariant[] = supabaseSpecs.map((spec: any) => ({
                    id: spec.id,
                    name: spec.variant_name,
                    year_start: spec.year_start,
                    year_end: spec.year_end,
                    engine_type: spec.engine_type,
                    engine_oil: {
                        capacity: spec.engine_oil_capacity,
                        type: spec.engine_oil_type
                    },
                    transmission_oil: {
                        capacity: spec.transmission_oil_capacity,
                        type: spec.transmission_oil_type
                    },
                    power_steering_oil: {
                        capacity: spec.power_steering_oil_capacity,
                        type: spec.power_steering_oil_type
                    },
                    brake_oil: {
                        type: spec.brake_oil_type
                    },
                    radiator_coolant: {
                        capacity: spec.radiator_coolant_capacity,
                        type: spec.radiator_coolant_type
                    },
                    ac_freon: {
                        capacity: spec.ac_freon_capacity,
                        type: spec.ac_freon_type
                    },
                    tire: {
                        front_size: spec.tire_size_front,
                        rear_size: spec.tire_size_rear,
                        front_pressure: spec.tire_pressure_front,
                        rear_pressure: spec.tire_pressure_rear
                    },
                    battery: {
                        type: spec.battery_type
                    },
                    wiper: {
                        driver: spec.wiper_size_driver,
                        passenger: spec.wiper_size_passenger,
                        rear: spec.wiper_size_rear
                    },
                    filters: {
                        spark_plug: spec.spark_plug_type,
                        air_filter: spec.air_filter_type,
                        cabin_filter: spec.cabin_filter_type,
                        fuel_filter: spec.fuel_filter_type,
                        oil_filter: spec.oil_filter_type
                    },
                    brake_parts: {
                        front_pad: spec.brake_pad_front_type,
                        rear_pad: spec.brake_pad_rear_type,
                        front_disc: spec.brake_disc_front_type,
                        rear_disc: spec.brake_disc_rear_type
                    },
                    suspension: {
                        shock_depan: {
                            recommended_brands: spec.shock_depan_recommended_brands
                        },
                        shock_belakang: {
                            recommended_brands: spec.shock_belakang_recommended_brands
                        },
                        rack_end: {
                            recommended_brands: spec.rack_end_recommended_brands
                        },
                        tie_rod: {
                            recommended_brands: spec.tie_rod_recommended_brands
                        },
                        link_stabilizer: {
                            recommended_brands: spec.link_stabilizer_recommended_brands
                        },
                        lower_arm: {
                            recommended_brands: spec.lower_arm_recommended_brands
                        },
                        upper_arm: {
                            recommended_brands: spec.upper_arm_recommended_brands
                        },
                        upper_support: {
                            recommended_brands: spec.upper_support_recommended_brands
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
        engine_oil_capacity: variant.engine_oil?.capacity || null,
        engine_oil_type: variant.engine_oil?.type || null,
        transmission_oil_capacity: variant.transmission_oil?.capacity || null,
        transmission_oil_type: variant.transmission_oil?.type || null,
        power_steering_oil_capacity: variant.power_steering_oil?.capacity || null,
        power_steering_oil_type: variant.power_steering_oil?.type || null,
        brake_oil_type: variant.brake_oil?.type || null,
        radiator_coolant_capacity: variant.radiator_coolant?.capacity || null,
        radiator_coolant_type: variant.radiator_coolant?.type || null,
        ac_freon_capacity: variant.ac_freon?.capacity || null,
        ac_freon_type: variant.ac_freon?.type || null,
        tire_size_front: variant.tire?.front_size || null,
        tire_size_rear: variant.tire?.rear_size || null,
        tire_pressure_front: variant.tire?.front_pressure || null,
        tire_pressure_rear: variant.tire?.rear_pressure || null,
        battery_type: variant.battery?.type || null,
        wiper_size_driver: variant.wiper?.driver || null,
        wiper_size_passenger: variant.wiper?.passenger || null,
        wiper_size_rear: variant.wiper?.rear || null,
        spark_plug_type: variant.filters?.spark_plug || null,
        air_filter_type: variant.filters?.air_filter || null,
        cabin_filter_type: variant.filters?.cabin_filter || null,
        fuel_filter_type: variant.filters?.fuel_filter || null,
        oil_filter_type: variant.filters?.oil_filter || null,
        brake_pad_front_type: variant.brake_parts?.front_pad || null,
        brake_pad_rear_type: variant.brake_parts?.rear_pad || null,
        brake_disc_front_type: variant.brake_parts?.front_disc || null,
        brake_disc_rear_type: variant.brake_parts?.rear_disc || null,
        shock_depan_recommended_brands: variant.suspension?.shock_depan?.recommended_brands || null,
        shock_belakang_recommended_brands: variant.suspension?.shock_belakang?.recommended_brands || null,
        rack_end_recommended_brands: variant.suspension?.rack_end?.recommended_brands || null,
        tie_rod_recommended_brands: variant.suspension?.tie_rod?.recommended_brands || null,
        link_stabilizer_recommended_brands: variant.suspension?.link_stabilizer?.recommended_brands || null,
        lower_arm_recommended_brands: variant.suspension?.lower_arm?.recommended_brands || null,
        upper_arm_recommended_brands: variant.suspension?.upper_arm?.recommended_brands || null,
        upper_support_recommended_brands: variant.suspension?.upper_support?.recommended_brands || null,
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
        refreshVehicles,
        addVariantData,
        updateVariantData,
        deleteVariantData,
        importVehicleData
    };
}
