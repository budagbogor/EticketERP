import { supabase } from "@/integrations/supabase/client";
import { TireBrand, TireProduct } from "@/lib/tireBrands";

// Database types matching the schema
type DBTireBrand = {
    id: string;
    slug: string;
    name: string;
    country: string | null;
    logo: string | null;
    tier: 'premium' | 'mid' | 'budget' | null;
    description: string | null;
};

type DBTireProduct = {
    id: string;
    brand_id: string;
    name: string;
    sizes: string[] | null;
    types: string[] | null;
    price_min: number | null;
    price_max: number | null;
    features: string[] | null;
    rating: number | null;
    warranty: string | null;
};

// Mappers directly to existing interfaces to minimize refactoring
const mapBrandFromDB = (brand: DBTireBrand): TireBrand => ({
    id: brand.id, // Note: DB uses UUID, code expects ID string. Compatible.
    name: brand.name,
    country: brand.country || "",
    logo: brand.logo || "🛞",
    tier: (brand.tier as 'premium' | 'mid' | 'budget') || 'mid',
    description: brand.description || "",
});

const mapProductFromDB = (product: DBTireProduct, brand?: DBTireBrand): (TireProduct & { brand?: TireBrand }) => {
    const mappedProduct: TireProduct = {
        id: product.id,
        brandId: product.brand_id,
        name: product.name,
        sizes: product.sizes || [],
        types: product.types || [],
        priceRange: {
            min: product.price_min || 0,
            max: product.price_max || 0,
        },
        features: product.features || [],
        rating: product.rating || 0,
        warranty: product.warranty || "-",
    };

    if (brand) {
        return {
            ...mappedProduct,
            brand: mapBrandFromDB(brand)
        };
    }

    return mappedProduct;
};

export const tireService = {
    async getBrands(): Promise<TireBrand[]> {
        const { data, error } = await supabase
            .from('tire_brands')
            .select('*')
            .order('name');

        if (error) throw error;
        return (data as DBTireBrand[]).map(mapBrandFromDB);
    },

    async getProducts(): Promise<(TireProduct & { brand: TireBrand })[]> {
        const { data, error } = await supabase
            .from('tire_products')
            .select(`
        *,
        brand:tire_brands(*)
      `);

        if (error) throw error;

        // Validating that the join returned data correctly
        return (data as (DBTireProduct & { brand: DBTireBrand })[]).map(item => ({
            ...mapProductFromDB(item),
            brand: mapBrandFromDB(item.brand)
        }));
    },

    async createBrand(brand: Omit<TireBrand, 'id'>) {
        const { data, error } = await supabase
            .from('tire_brands')
            .insert({
                slug: brand.name.toLowerCase().replace(/\s+/g, '-'),
                name: brand.name,
                country: brand.country,
                logo: brand.logo,
                tier: brand.tier,
                description: brand.description
            })
            .select()
            .single();

        if (error) throw error;
        return mapBrandFromDB(data as DBTireBrand);
    },

    async createProduct(product: Omit<TireProduct, 'id'>) {
        const { data, error } = await supabase
            .from('tire_products')
            .insert({
                brand_id: product.brandId,
                name: product.name,
                sizes: product.sizes,
                types: product.types,
                price_min: product.priceRange.min,
                price_max: product.priceRange.max,
                features: product.features,
                rating: product.rating,
                warranty: product.warranty
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteBrand(id: string) {
        const { error } = await supabase
            .from('tire_brands')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('tire_products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async updateProduct(id: string, updates: Partial<Omit<TireProduct, 'id' | 'brandId'>>) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.sizes) dbUpdates.sizes = updates.sizes;
        if (updates.types) dbUpdates.types = updates.types;
        if (updates.priceRange) {
            dbUpdates.price_min = updates.priceRange.min;
            dbUpdates.price_max = updates.priceRange.max;
        }
        if (updates.features) dbUpdates.features = updates.features;
        if (updates.rating) dbUpdates.rating = updates.rating;
        if (updates.warranty) dbUpdates.warranty = updates.warranty;

        const { data, error } = await supabase
            .from('tire_products')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
