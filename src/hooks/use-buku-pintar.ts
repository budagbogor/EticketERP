import { useState, useEffect } from "react";
import { Vehicle, VehicleVariant } from "@/types/buku-pintar";
import { bukuPintarData as initialMockData } from "@/lib/buku-pintar-data";
import { useVehicles, CarBrand } from "./use-vehicles";

const BUKU_PINTAR_STORAGE_KEY = "buku_pintar_custom_data";

export function useBukuPintar() {
    const { brands: supabaseBrands, isLoading: isSupabaseLoading, refreshVehicles } = useVehicles();
    const [completeData, setCompleteData] = useState<Vehicle[]>([]);
    const [customData, setCustomData] = useState<Vehicle[]>([]);

    // Load custom data from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(BUKU_PINTAR_STORAGE_KEY);
        if (stored) {
            try {
                setCustomData(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored buku pintar data", e);
            }
        }
    }, []);

    // Merge Supabase brands/models with Mock Specs + Custom Specs
    useEffect(() => {
        if (isSupabaseLoading) return;

        // 1. Start with Supabase Brands structure
        // 1. Start with Supabase Brands structure but flatten into Vehicle[] (per model)
        const mergedVehicles: Vehicle[] = [];

        supabaseBrands.forEach(brand => {
            // For each model in the brand, create a Vehicle entry
            brand.models.forEach(model => {
                // Find matching mock/custom specifications for this specific model
                const mockVehicle = initialMockData.find(
                    v => v.brand.toLowerCase() === brand.name.toLowerCase() &&
                        v.model.toLowerCase() === model.name.toLowerCase()
                );
                const customVehicle = customData.find(
                    v => v.brand.toLowerCase() === brand.name.toLowerCase() &&
                        v.model.toLowerCase() === model.name.toLowerCase()
                );

                // Merge variants
                let variants: VehicleVariant[] = [];
                if (mockVehicle) variants = [...variants, ...mockVehicle.variants];
                if (customVehicle) variants = [...variants, ...customVehicle.variants];

                mergedVehicles.push({
                    id: model.id,
                    brand: brand.name,
                    model: model.name,
                    year_start: mockVehicle?.year_start || customVehicle?.year_start || 2000,
                    year_end: mockVehicle?.year_end || customVehicle?.year_end || null,
                    variants: variants
                });
            });

            // Also handle case where we might have mock/custom data for models NOT in Supabase yet (edge case)
            // For simplicity, we assume sync is primary, but let's check customData for orphans
        });

        // 2. Add custom data orphans (if brand/model doesn't exist in Supabase yet)
        customData.forEach(cv => {
            const exists = mergedVehicles.some(
                mv => mv.brand.toLowerCase() === cv.brand.toLowerCase() &&
                    mv.model.toLowerCase() === cv.model.toLowerCase()
            );
            if (!exists) {
                mergedVehicles.push(cv);
            }
        });

        setCompleteData(mergedVehicles);
    }, [supabaseBrands, customData, isSupabaseLoading]);

    const addVariantData = (
        brandName: string,
        modelName: string,
        variant: VehicleVariant
    ) => {
        const newCustomData = [...customData];
        let vehicleIndex = newCustomData.findIndex(v => v.brand.toLowerCase() === brandName.toLowerCase());

        if (vehicleIndex === -1) {
            // Create new vehicle entry
            newCustomData.push({
                id: crypto.randomUUID(),
                brand: brandName,
                model: modelName,
                year_start: new Date().getFullYear(),
                year_end: null,
                variants: [variant]
            });
        } else {
            // Add to existing vehicle
            newCustomData[vehicleIndex].variants.push(variant);
        }

        setCustomData(newCustomData);
        localStorage.setItem(BUKU_PINTAR_STORAGE_KEY, JSON.stringify(newCustomData));

        // Refresh Supabase to ensure brands/models used are up to date
        refreshVehicles();
    };

    const updateVariantData = (
        brandName: string,
        modelName: string,
        updatedVariant: VehicleVariant
    ) => {
        const newCustomData = [...customData];
        const vehicleIndex = newCustomData.findIndex(
            v => v.brand.toLowerCase() === brandName.toLowerCase() &&
                v.model.toLowerCase() === modelName.toLowerCase()
        );

        if (vehicleIndex !== -1) {
            // Find and update the variant
            const variantIndex = newCustomData[vehicleIndex].variants.findIndex(
                v => v.id === updatedVariant.id
            );

            if (variantIndex !== -1) {
                newCustomData[vehicleIndex].variants[variantIndex] = updatedVariant;
            } else {
                // If variant not found in custom data, add it
                newCustomData[vehicleIndex].variants.push(updatedVariant);
            }
        } else {
            // If vehicle not found, create new entry with this variant
            newCustomData.push({
                id: crypto.randomUUID(),
                brand: brandName,
                model: modelName,
                year_start: updatedVariant.year_start || new Date().getFullYear(),
                year_end: updatedVariant.year_end || null,
                variants: [updatedVariant]
            });
        }

        setCustomData(newCustomData);
        localStorage.setItem(BUKU_PINTAR_STORAGE_KEY, JSON.stringify(newCustomData));
    };

    const deleteVariantData = (
        brandName: string,
        modelName: string,
        variantId: string
    ) => {
        const newCustomData = [...customData];
        const vehicleIndex = newCustomData.findIndex(
            v => v.brand.toLowerCase() === brandName.toLowerCase() &&
                v.model.toLowerCase() === modelName.toLowerCase()
        );

        if (vehicleIndex !== -1) {
            // Remove the variant from the vehicle
            newCustomData[vehicleIndex].variants = newCustomData[vehicleIndex].variants.filter(
                v => v.id !== variantId
            );

            // If no variants left, remove the entire vehicle entry
            if (newCustomData[vehicleIndex].variants.length === 0) {
                newCustomData.splice(vehicleIndex, 1);
            }
        }

        setCustomData(newCustomData);
        localStorage.setItem(BUKU_PINTAR_STORAGE_KEY, JSON.stringify(newCustomData));
    };

    return {
        vehicles: completeData,
        supabaseBrands,
        isSupabaseLoading,
        refreshVehicles,
        addVariantData,
        updateVariantData,
        deleteVariantData
    };
}
