import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MasterDataItem {
  id: string;
  name: string;
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });
}

export function useComplaintCategories() {
  return useQuery({
    queryKey: ["complaint-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });
}

export function useSubCategories() {
  return useQuery({
    queryKey: ["sub-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });
}

export function useFuelTypes() {
  return useQuery({
    queryKey: ["fuel-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuel_types")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });
}

export function useTransmissionTypes() {
  return useQuery({
    queryKey: ["transmission-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transmission_types")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });
}

export function useCarBrands() {
  return useQuery({
    queryKey: ["car-brands-with-models"],
    queryFn: async () => {
      const { data: brands, error: brandsError } = await supabase
        .from("car_brands")
        .select("id, name")
        .order("name");

      if (brandsError) throw brandsError;

      const { data: models, error: modelsError } = await supabase
        .from("car_models")
        .select("id, name, brand_id")
        .order("name");

      if (modelsError) throw modelsError;

      return brands.map((brand) => ({
        ...brand,
        car_models: models.filter((m) => m.brand_id === brand.id),
      }));
    },
  });
}
