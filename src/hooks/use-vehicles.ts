import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CarModel {
    id: string;
    name: string;
    brand_id: string;
}

export interface CarBrand {
    id: string;
    name: string;
    models: CarModel[];
}

export function useVehicles() {
    const [brands, setBrands] = useState<CarBrand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const { data: brandsData, error: brandsError } = await supabase
                .from("car_brands")
                .select("id, name")
                .order("name");

            if (brandsError) throw brandsError;

            const { data: modelsData, error: modelsError } = await supabase
                .from("car_models")
                .select("id, name, brand_id");

            if (modelsError) throw modelsError;

            const brandsWithModels: CarBrand[] = (brandsData || []).map((brand) => ({
                id: brand.id,
                name: brand.name,
                models: (modelsData || []).filter((model) => model.brand_id === brand.id),
            }));

            setBrands(brandsWithModels);
        } catch (error) {
            console.error("Error fetching brands:", error);
            toast({
                title: "Error",
                description: "Gagal memuat data kendaraan dari server",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const refreshVehicles = () => {
        fetchBrands();
    };

    return { brands, isLoading, refreshVehicles };
}
