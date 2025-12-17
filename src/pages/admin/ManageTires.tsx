import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tireService } from "@/services/tireService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ManageTiresProps {
    isEmbedded?: boolean;
}

export default function ManageTires({ isEmbedded = false }: ManageTiresProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("products");
    const [isImporting, setIsImporting] = useState(false);

    // --- Brand State ---
    const [newBrand, setNewBrand] = useState({
        name: "",
        country: "",
        tier: "mid" as "premium" | "mid" | "budget",
        description: "",
    });

    // --- Product State ---
    const [newProduct, setNewProduct] = useState({
        brandId: "",
        name: "",
        sizes: "", // Comma separated
        types: "all-season", // Simple selection for now
        priceMin: "",
        priceMax: "",
    });

    // --- Queries ---
    const { data: brands = [], isLoading: loadingBrands } = useQuery({
        queryKey: ['tire-brands'],
        queryFn: tireService.getBrands,
    });

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['tire-products'],
        queryFn: tireService.getProducts,
    });

    // --- Mutations ---
    const createBrandMutation = useMutation({
        mutationFn: tireService.createBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
            toast({ title: "Berhasil", description: "Merek ban berhasil ditambahkan" });
            setNewBrand({ name: "", country: "", tier: "mid", description: "" });
        },
        onError: (error) => {
            toast({ title: "Gagal", description: error.message, variant: "destructive" });
        }
    });

    const createProductMutation = useMutation({
        mutationFn: async () => {
            return tireService.createProduct({
                brandId: newProduct.brandId,
                name: newProduct.name,
                sizes: newProduct.sizes.split(',').map(s => s.trim().toUpperCase()),
                types: [newProduct.types],
                priceRange: {
                    min: Number(newProduct.priceMin),
                    max: Number(newProduct.priceMax)
                },
                features: [],
                rating: 0,
                warranty: '-'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tire-products'] });
            toast({ title: "Berhasil", description: "Produk ban berhasil ditambahkan" });
            setNewProduct({ ...newProduct, name: "", sizes: "", priceMin: "", priceMax: "" });
        },
        onError: (error) => {
            toast({ title: "Gagal", description: error.message, variant: "destructive" });
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: tireService.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tire-products'] });
            toast({ title: "Dihapus", description: "Produk berhasil dihapus" });
        }
    });

    const handleCreateBrand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrand.name) return;
        createBrandMutation.mutate({ ...newBrand, logo: "🛞" });
    };

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.brandId || !newProduct.name || !newProduct.sizes) return;
        createProductMutation.mutate();
    };

    // --- Import Logic ---
    const downloadTemplate = () => {
        const headers = ["Brand", "Model", "Sizes (comma separated)", "PriceMin", "PriceMax", "Type", "Country", "Tier"];
        const data = [
            ["Michelin", "Pilot Sport 5", "225/45R17, 235/40R18", 2500000, 4000000, "performance", "France", "premium"],
            ["Toyo", "Proxes TR1", "195/50R15", 850000, 1200000, "performance", "Japan", "mid"]
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Tire_Data_Template.xlsx");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast({ title: "Kosong", description: "File tidak berisi data", variant: "destructive" });
                    setIsImporting(false);
                    return;
                }

                // Process Data
                let successCount = 0;
                let errorCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < (data as any[]).length; i++) {
                    const row = (data as any[])[i];
                    try {
                        const brandName = row["Brand"];
                        const modelName = row["Model"];

                        if (!brandName || !modelName) {
                            errors.push(`Baris ${i + 2}: Brand dan Model wajib diisi`);
                            errorCount++;
                            continue;
                        }

                        // Validate tier - handle variations
                        const tierValue = row["Tier"]?.toString().toLowerCase().trim();
                        let tier: "premium" | "mid" | "budget" = "mid";

                        if (tierValue?.includes("premium")) {
                            tier = "premium";
                        } else if (tierValue?.includes("mid")) {
                            tier = "mid"; // handles "mid", "mid-range", etc.
                        } else if (tierValue?.includes("budget") || tierValue?.includes("ekonomis")) {
                            tier = "budget";
                        }

                        // Validate type
                        const typeValue = row["Type"]?.toLowerCase() || "all-season";
                        const validTypes = ["performance", "all-season", "touring", "all-terrain", "rain"];
                        const type = validTypes.includes(typeValue) ? typeValue : "all-season";

                        // 1. Find or Create Brand
                        const cleanBrandName = brandName.trim();
                        let brandId = brands.find(b => b.name.toLowerCase().trim() === cleanBrandName.toLowerCase())?.id;

                        if (!brandId) {
                            console.log(`Creating brand: ${cleanBrandName}`);
                            try {
                                const newBrand = await tireService.createBrand({
                                    name: cleanBrandName,
                                    country: row["Country"] || "Unknown",
                                    logo: "🛞",
                                    tier: tier as "premium" | "mid" | "budget",
                                    description: `Imported ${cleanBrandName}`
                                });
                                brandId = newBrand.id;
                            } catch (brandError: any) {
                                // If brand creation fails due to duplicate, try to find it again
                                if (brandError.code === '23505') {
                                    const refreshedBrands = await tireService.getBrands();
                                    brandId = refreshedBrands.find(b => b.name.toLowerCase().trim() === cleanBrandName.toLowerCase())?.id;
                                    if (!brandId) throw brandError;
                                } else {
                                    throw brandError;
                                }
                            }
                        }

                        // 2. Find or Create/Update Product
                        const existingProduct = products.find(p =>
                            p.brandId === brandId && p.name.toLowerCase() === modelName.toLowerCase()
                        );

                        const sizes = row["Sizes (comma separated)"]
                            ? row["Sizes (comma separated)"].toString().split(',').map((s: string) => s.trim().toUpperCase())
                            : [];

                        if (sizes.length === 0) {
                            errors.push(`Baris ${i + 2}: ${brandName} ${modelName} - Ukuran ban wajib diisi`);
                            errorCount++;
                            continue;
                        }

                        const priceMin = Number(row["PriceMin"]) || 0;
                        const priceMax = Number(row["PriceMax"]) || 0;

                        if (existingProduct) {
                            // Update
                            console.log(`Updating product: ${modelName}`);

                            // Merge sizes unique
                            const combinedSizes = Array.from(new Set([...existingProduct.sizes, ...sizes]));

                            await tireService.updateProduct(existingProduct.id, {
                                sizes: combinedSizes,
                                priceRange: { min: priceMin || existingProduct.priceRange.min, max: priceMax || existingProduct.priceRange.max },
                                types: existingProduct.types.includes(type) ? existingProduct.types : [...existingProduct.types, type]
                            });
                        } else {
                            // Create
                            console.log(`Creating product: ${modelName}`);
                            await tireService.createProduct({
                                brandId: brandId,
                                name: modelName,
                                sizes: sizes,
                                types: [type],
                                priceRange: { min: priceMin, max: priceMax },
                                features: ["Imported"],
                                rating: 0,
                                warranty: "-"
                            });
                        }
                        successCount++;
                    } catch (err: any) {
                        const errorMsg = err?.message || "Unknown error";
                        errors.push(`Baris ${i + 2}: ${row["Brand"]} ${row["Model"]} - ${errorMsg}`);
                        console.error(`Error on row ${i + 2}:`, row, err);
                        errorCount++;
                    }
                }

                queryClient.invalidateQueries({ queryKey: ['tire-products'] });
                queryClient.invalidateQueries({ queryKey: ['tire-brands'] });

                let description = `Berhasil memproses ${successCount} data.`;
                if (errorCount > 0) {
                    description += ` Gagal: ${errorCount}`;
                }

                toast({
                    title: "Import Selesai",
                    description,
                    variant: errorCount > 0 ? "destructive" : "default",
                });

                // Show detailed errors if any
                if (errors.length > 0) {
                    console.error("Import errors:", errors);
                    // Show first 3 errors in console for debugging
                    errors.slice(0, 3).forEach(err => {
                        toast({
                            title: "Error Detail",
                            description: err,
                            variant: "destructive",
                        });
                    });
                }

            } catch (error: any) {
                console.error("Import Error", error);
                toast({ title: "Import Gagal", description: error.message, variant: "destructive" });
            } finally {
                setIsImporting(false);
                // Reset file input
                e.target.value = "";
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <div>
                    <h1 className="text-3xl font-display font-bold">Kelola Data Ban</h1>
                    <p className="text-muted-foreground">Tambah dan edit data merek dan produk ban.</p>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="products">Produk Ban</TabsTrigger>
                    <TabsTrigger value="brands">Merek Ban</TabsTrigger>
                    <TabsTrigger value="import">Import Data</TabsTrigger>
                </TabsList>

                {/* --- PRODUCTS TAB --- */}
                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Produk Baru</CardTitle>
                            <CardDescription>Masukkan detail produk ban baru.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Merek</Label>
                                        <Select
                                            value={newProduct.brandId}
                                            onValueChange={(val) => setNewProduct({ ...newProduct, brandId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Merek" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brands.map(brand => (
                                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nama Model</Label>
                                        <Input
                                            placeholder="Contoh: Potenza RE003"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Ukuran Tersedia (Pisahkan dengan koma)</Label>
                                        <Input
                                            placeholder="Contoh: 195/50R15, 205/55R16"
                                            value={newProduct.sizes}
                                            onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Harga Min (Rp)</Label>
                                        <Input
                                            type="number"
                                            value={newProduct.priceMin}
                                            onChange={(e) => setNewProduct({ ...newProduct, priceMin: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Harga Max (Rp)</Label>
                                        <Input
                                            type="number"
                                            value={newProduct.priceMax}
                                            onChange={(e) => setNewProduct({ ...newProduct, priceMax: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={createProductMutation.isPending}>
                                    {createProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Produk
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Produk ({products.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loadingProducts ? <Loader2 className="animate-spin" /> : products.map((prod) => (
                                    <div key={prod.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-semibold">{prod.brand.name} {prod.name}</h4>
                                            <p className="text-sm text-muted-foreground">{prod.sizes.length} ukuran tersedia</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => deleteProductMutation.mutate(prod.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- BRANDS TAB --- */}
                <TabsContent value="brands" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Merek Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateBrand} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nama Merek</Label>
                                        <Input
                                            value={newBrand.name}
                                            onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Negara Asal</Label>
                                        <Input
                                            value={newBrand.country}
                                            onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kategori (Tier)</Label>
                                        <Select
                                            value={newBrand.tier}
                                            onValueChange={(val: any) => setNewBrand({ ...newBrand, tier: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="premium">Premium</SelectItem>
                                                <SelectItem value="mid">Mid-Range</SelectItem>
                                                <SelectItem value="budget">Budget</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" disabled={createBrandMutation.isPending}>
                                    {createBrandMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Merek
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Merek ({brands.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {loadingBrands ? <Loader2 className="animate-spin" /> : brands.map((brand) => (
                                    <div key={brand.id} className="p-3 border rounded md:flex justify-between items-center">
                                        <span className="font-medium">{brand.name}</span>
                                        <span className="text-xs px-2 py-1 bg-secondary rounded">{brand.tier}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- IMPORT TAB --- */}
                <TabsContent value="import" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Data Ban</CardTitle>
                            <CardDescription>Upload file Excel (.xlsx) berisi data ban untuk update sekaligus.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span>Gunakan template berikut agar format sesuai:</span>
                                </div>
                                <Button variant="outline" onClick={downloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                            </div>

                            <div className="space-y-4 rounded-lg border border-dashed p-8 text-center hover:bg-muted/50 transition-colors">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div>
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <span className="font-semibold text-primary hover:underline">
                                            Klik untuk upload
                                        </span>
                                        {" "}atau drag and drop file di sini
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isImporting}
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">XLSX, XLS (Max 5MB)</p>
                                </div>
                                {isImporting && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sedang memproses data...
                                    </div>
                                )}
                            </div>

                            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-4">
                                <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-500 text-sm">Catatan Penting:</h4>
                                <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                                    <li>Data akan dicocokkan berdasarkan <strong>Brand</strong> dan <strong>Model</strong>.</li>
                                    <li>Jika Brand/Model sudah ada, data seperti Harga dan Ukuran akan <strong>di-update</strong>.</li>
                                    <li>Jika belum ada, Brand/Model baru akan <strong>dibuat otomatis</strong>.</li>
                                    <li>Pastikan nama Brand sama persis untuk menghindari duplikasi.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
