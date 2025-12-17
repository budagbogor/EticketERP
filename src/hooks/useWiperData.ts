import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type WiperSpecification = Tables<"wiper_specifications">;
type WiperSize = Tables<"wiper_sizes">;
type WiperSpecificationInsert = TablesInsert<"wiper_specifications">;
type WiperSizeInsert = TablesInsert<"wiper_sizes">;

export interface WiperSpecWithSizes extends WiperSpecification {
    wiper_sizes: WiperSize[];
}

export function useWiperSpecifications() {
    return useQuery({
        queryKey: ["wiper-specifications"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("wiper_specifications")
                .select(`
          *,
          wiper_sizes (*)
        `)
                .order("brand", { ascending: true })
                .order("model", { ascending: true });

            if (error) throw error;
            return data as WiperSpecWithSizes[];
        },
    });
}

export function useAddWiperSpecification() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            specification,
            sizes,
        }: {
            specification: WiperSpecificationInsert;
            sizes: Omit<WiperSizeInsert, "specification_id">[];
        }) => {
            // Insert specification
            const { data: specData, error: specError } = await supabase
                .from("wiper_specifications")
                .insert(specification)
                .select()
                .single();

            if (specError) throw specError;

            // Insert sizes
            const sizesWithSpecId = sizes.map((size) => ({
                ...size,
                specification_id: specData.id,
            }));

            const { error: sizesError } = await supabase
                .from("wiper_sizes")
                .insert(sizesWithSpecId);

            if (sizesError) throw sizesError;

            return specData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wiper-specifications"] });
            toast({
                title: "Sukses",
                description: "Data wiper berhasil ditambahkan",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useUpdateWiperSpecification() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            id,
            specification,
            sizes,
        }: {
            id: string;
            specification: Partial<WiperSpecification>;
            sizes: Omit<WiperSizeInsert, "specification_id">[];
        }) => {
            // Update specification
            const { error: specError } = await supabase
                .from("wiper_specifications")
                .update(specification)
                .eq("id", id);

            if (specError) throw specError;

            // Delete existing sizes
            const { error: deleteError } = await supabase
                .from("wiper_sizes")
                .delete()
                .eq("specification_id", id);

            if (deleteError) throw deleteError;

            // Insert new sizes
            const sizesWithSpecId = sizes.map((size) => ({
                ...size,
                specification_id: id,
            }));

            const { error: sizesError } = await supabase
                .from("wiper_sizes")
                .insert(sizesWithSpecId);

            if (sizesError) throw sizesError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wiper-specifications"] });
            toast({
                title: "Sukses",
                description: "Data wiper berhasil diperbarui",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteWiperSpecification() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("wiper_specifications")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wiper-specifications"] });
            toast({
                title: "Sukses",
                description: "Data wiper berhasil dihapus",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useImportWiperData() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (
            data: {
                specification: WiperSpecificationInsert;
                sizes: Omit<WiperSizeInsert, "specification_id">[];
            }[]
        ) => {
            let imported = 0;
            let skipped = 0;
            let failed = 0;

            for (const item of data) {
                try {
                    // Check if data already exists
                    const { data: existing, error: checkError } = await supabase
                        .from("wiper_specifications")
                        .select("id")
                        .eq("brand", item.specification.brand)
                        .eq("model", item.specification.model)
                        .eq("year_start", item.specification.year_start)
                        .maybeSingle();

                    if (checkError) throw checkError;

                    if (existing) {
                        // Data already exists, skip
                        skipped++;
                        continue;
                    }

                    // Insert specification
                    const { data: specData, error: specError } = await supabase
                        .from("wiper_specifications")
                        .insert(item.specification)
                        .select()
                        .single();

                    if (specError) throw specError;

                    // Insert sizes
                    const sizesWithSpecId = item.sizes.map((size) => ({
                        ...size,
                        specification_id: specData.id,
                    }));

                    const { error: sizesError } = await supabase
                        .from("wiper_sizes")
                        .insert(sizesWithSpecId);

                    if (sizesError) throw sizesError;

                    imported++;
                } catch (error) {
                    console.error("Error importing wiper data:", error);
                    failed++;
                }
            }

            return { imported, skipped, failed, total: data.length };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["wiper-specifications"] });

            const messages = [];
            if (result.imported > 0) messages.push(`${result.imported} data berhasil diimport`);
            if (result.skipped > 0) messages.push(`${result.skipped} data dilewati (sudah ada)`);
            if (result.failed > 0) messages.push(`${result.failed} data gagal`);

            toast({
                title: "Import Selesai",
                description: messages.join(", "),
                variant: result.failed > 0 ? "destructive" : "default",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
