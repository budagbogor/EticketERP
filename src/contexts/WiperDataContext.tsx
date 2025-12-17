import { createContext, useContext, useMemo, ReactNode } from "react";
import { useWiperSpecifications, WiperSpecWithSizes } from "@/hooks/useWiperData";
import type { VehicleWiperSpec } from "@/data/wiperData";

interface WiperDataContextValue {
    data: VehicleWiperSpec[];
    isLoading: boolean;
    getBrands: () => string[];
    getModelsByBrand: (brand: string) => string[];
    getYearsForBrandModel: (brand: string, model: string) => number[];
    findWiperSpec: (brand: string, model: string, year: number) => VehicleWiperSpec | undefined;
}

const WiperDataContext = createContext<WiperDataContextValue | undefined>(undefined);

// Transform Supabase data to VehicleWiperSpec format
function transformToVehicleWiperSpec(specs: WiperSpecWithSizes[]): VehicleWiperSpec[] {
    return specs.map((spec) => ({
        id: spec.id,
        merek: spec.brand,
        model: spec.model,
        tahunMulai: spec.year_start,
        tahunSelesai: spec.year_end || undefined,
        catatan: spec.notes || undefined,
        wipers: spec.wiper_sizes.map((size) => ({
            posisi: size.position as "kiri" | "kanan" | "belakang",
            ukuranInch: size.size_inch,
            merekBlade: size.blade_brand || undefined,
            kodeBarang: size.part_code || undefined,
            stok: size.stock || undefined,
            harga: size.price ? Number(size.price) : undefined,
        })),
    }));
}

export const WiperDataProvider = ({ children }: { children: ReactNode }) => {
    const { data: supabaseData, isLoading } = useWiperSpecifications();

    const data = useMemo(() => {
        if (!supabaseData) return [];
        return transformToVehicleWiperSpec(supabaseData);
    }, [supabaseData]);

    const helpers = useMemo<WiperDataContextValue>(() => {
        const getBrands = () => Array.from(new Set(data.map((item) => item.merek))).sort((a, b) => a.localeCompare(b));

        const getModelsByBrand = (brand: string) =>
            Array.from(new Set(data.filter((item) => item.merek === brand).map((item) => item.model))).sort((a, b) =>
                a.localeCompare(b),
            );

        const getYearsForBrandModel = (brand: string, model: string) => {
            const years = new Set<number>();
            data
                .filter((item) => item.merek === brand && item.model === model)
                .forEach((item) => {
                    const end = item.tahunSelesai ?? new Date().getFullYear();
                    for (let y = item.tahunMulai; y <= end; y++) {
                        years.add(y);
                    }
                });
            return Array.from(years).sort((a, b) => a - b);
        };

        const findWiperSpec = (brand: string, model: string, year: number) => {
            return data.find((item) => {
                if (item.merek !== brand || item.model !== model) return false;
                const end = item.tahunSelesai ?? new Date().getFullYear();
                return year >= item.tahunMulai && year <= end;
            });
        };

        return {
            data,
            isLoading,
            getBrands,
            getModelsByBrand,
            getYearsForBrandModel,
            findWiperSpec,
        };
    }, [data, isLoading]);

    return <WiperDataContext.Provider value={helpers}>{children}</WiperDataContext.Provider>;
};

export const useWiperData = () => {
    const ctx = useContext(WiperDataContext);
    if (!ctx) {
        throw new Error("useWiperData must be used within WiperDataProvider");
    }
    return ctx;
};
