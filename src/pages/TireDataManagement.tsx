import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { downloadExcel } from "@/lib/excelUtils";
import { tireService } from "@/services/tireService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Upload, Download, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddBrandDialog } from "@/components/tire-data/AddBrandDialog";
import { AddProductDialog } from "@/components/tire-data/AddProductDialog";
import { EditBrandDialog } from "@/components/tire-data/EditBrandDialog";
import { EditProductDialog } from "@/components/tire-data/EditProductDialog";
import { ImportTireDataDialog } from "@/components/tire-data/ImportTireDataDialog";
import { TireBrand, TireProduct } from "@/lib/tireBrands";
import { formatPrice } from "@/lib/tireBrands";

interface TireDataManagementProps {
    isEmbedded?: boolean;
}

export default function TireDataManagement({ isEmbedded = false }: TireDataManagementProps) {

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchBrand, setSearchBrand] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [showAddBrand, setShowAddBrand] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editingBrand, setEditingBrand] = useState<TireBrand | null>(null);
    const [editingProduct, setEditingProduct] = useState<(TireProduct & { brand: TireBrand }) | null>(null);
    const [deletingBrand, setDeletingBrand] = useState<TireBrand | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<(TireProduct & { brand: TireBrand }) | null>(null);

    // Fetch brands and products
    const { data: brands = [], isLoading: loadingBrands } = useQuery({
        queryKey: ["tire-brands"],
        queryFn: tireService.getBrands,
    });

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ["tire-products"],
        queryFn: tireService.getProducts,
    });

    // Delete mutations
    const deleteBrandMutation = useMutation({
        mutationFn: tireService.deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-brands"] });
            queryClient.invalidateQueries({ queryKey: ["tire-products"] });
            toast({
                title: "Berhasil",
                description: "Merek ban berhasil dihapus",
            });
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal menghapus merek ban",
                variant: "destructive",
            });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: tireService.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-products"] });
            toast({
                title: "Berhasil",
                description: "Produk ban berhasil dihapus",
            });
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal menghapus produk ban",
                variant: "destructive",
            });
        },
    });

    // Filter data
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchBrand.toLowerCase())
    );

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.brand.name.toLowerCase().includes(searchProduct.toLowerCase())
    );

    // Export to Excel
    const handleExportProducts = () => {
        const exportData = products.map((p) => ({
            "Merek": p.brand.name,
            "Negara": p.brand.country || "",
            "Tier": p.brand.tier,
            "Nama Produk": p.name,
            "Ukuran": p.sizes.join("; "),
            "Tipe": p.types.join("; "),
            "Harga Min": p.priceRange.min,
            "Harga Max": p.priceRange.max,
            "Fitur": p.features.join("; "),
            "Rating": p.rating,
            "Garansi": p.warranty,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Ban");

        toast({
            title: "Mengekspor Data",
            description: "File Excel sedang disiapkan...",
        });
        downloadExcel(wb, `tire-products-export-${new Date().toISOString().split("T")[0]}.xlsx`);

        toast({
            title: "Berhasil",
            description: "Data produk ban berhasil diekspor ke Excel",
        });
    };

    const getTierBadge = (tier: string) => {
        const colors = {
            premium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            mid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            budget: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
        return colors[tier as keyof typeof colors] || colors.mid;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            {!isEmbedded && (
                <div>
                    <h1 className="text-3xl font-bold">Data Ban</h1>
                    <p className="text-muted-foreground">
                        Kelola data merek dan produk ban untuk kalkulator upgrade ban
                    </p>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="brands" className="w-full">
                <TabsList>
                    <TabsTrigger value="brands">Merek Ban</TabsTrigger>
                    <TabsTrigger value="products">Produk Ban</TabsTrigger>
                </TabsList>

                {/* Brands Tab */}
                <TabsContent value="brands" className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-sm">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari merek..."
                                    value={searchBrand}
                                    onChange={(e) => setSearchBrand(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button onClick={() => setShowAddBrand(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Merek
                        </Button>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Logo</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Negara</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingBrands ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBrands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Tidak ada data
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBrands.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell className="text-2xl">{brand.logo}</TableCell>
                                            <TableCell className="font-medium">{brand.name}</TableCell>
                                            <TableCell>{brand.country}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadge(
                                                        brand.tier
                                                    )}`}
                                                >
                                                    {brand.tier}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {brand.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingBrand(brand)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeletingBrand(brand)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-sm">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari produk..."
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowImport(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Import Excel
                            </Button>
                            <Button variant="outline" onClick={handleExportProducts}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button onClick={() => setShowAddProduct(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Produk
                            </Button>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Merek</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead>Ukuran</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingProducts ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            Tidak ada data
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.brand.logo} {product.brand.name}
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate">
                                                    {product.sizes.slice(0, 3).join(", ")}
                                                    {product.sizes.length > 3 && "..."}
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.types.join(", ")}</TableCell>
                                            <TableCell>
                                                {formatPrice(product.priceRange.min)} -{" "}
                                                {formatPrice(product.priceRange.max)}
                                            </TableCell>
                                            <TableCell>⭐ {product.rating}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingProduct(product)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeletingProduct(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AddBrandDialog open={showAddBrand} onOpenChange={setShowAddBrand} />
            <AddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} brands={brands} />
            <ImportTireDataDialog open={showImport} onOpenChange={setShowImport} brands={brands} products={products} />
            {editingBrand && (
                <EditBrandDialog
                    open={!!editingBrand}
                    onOpenChange={(open) => !open && setEditingBrand(null)}
                    brand={editingBrand}
                />
            )}
            {editingProduct && (
                <EditProductDialog
                    open={!!editingProduct}
                    onOpenChange={(open) => !open && setEditingProduct(null)}
                    product={editingProduct}
                    brands={brands}
                />
            )}

            <AlertDialog open={!!deletingBrand} onOpenChange={(open) => !open && setDeletingBrand(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Merek Ban?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus merek <strong>{deletingBrand?.name}</strong>.
                            Tindakan ini akan menghapus semua produk yang terkait dengan merek ini.
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deletingBrand) {
                                    deleteBrandMutation.mutate(deletingBrand.id);
                                    setDeletingBrand(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk Ban?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus produk <strong>{deletingProduct?.name}</strong>.
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deletingProduct) {
                                    deleteProductMutation.mutate(deletingProduct.id);
                                    setDeletingProduct(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
