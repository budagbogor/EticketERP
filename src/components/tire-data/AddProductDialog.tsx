import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tireService } from "@/services/tireService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { TireBrand } from "@/lib/tireBrands";
import { X } from "lucide-react";

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brands: TireBrand[];
}

const TIRE_TYPES = [
    { id: "performance", label: "Performance" },
    { id: "all-season", label: "All-Season" },
    { id: "touring", label: "Touring" },
    { id: "all-terrain", label: "All-Terrain" },
    { id: "rain", label: "Rain" },
];

export function AddProductDialog({ open, onOpenChange, brands }: AddProductDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        brandId: "",
        name: "",
        sizes: [] as string[],
        types: [] as string[],
        priceMin: "",
        priceMax: "",
        features: [] as string[],
        rating: "",
        warranty: "",
    });
    const [sizeInput, setSizeInput] = useState("");
    const [featureInput, setFeatureInput] = useState("");

    const createMutation = useMutation({
        mutationFn: tireService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tire-products"] });
            toast({
                title: "Berhasil",
                description: "Produk ban berhasil ditambahkan",
            });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({
                title: "Gagal",
                description: "Gagal menambahkan produk ban",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            brandId: "",
            name: "",
            sizes: [],
            types: [],
            priceMin: "",
            priceMax: "",
            features: [],
            rating: "",
            warranty: "",
        });
        setSizeInput("");
        setFeatureInput("");
    };

    const handleAddSize = () => {
        if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
            setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
            setSizeInput("");
        }
    };

    const handleRemoveSize = (size: string) => {
        setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) });
    };

    const handleAddFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (feature: string) => {
        setFormData({ ...formData, features: formData.features.filter((f) => f !== feature) });
    };

    const handleTypeToggle = (typeId: string) => {
        setFormData({
            ...formData,
            types: formData.types.includes(typeId)
                ? formData.types.filter((t) => t !== typeId)
                : [...formData.types, typeId],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.brandId || !formData.name.trim() || formData.sizes.length === 0) {
            toast({
                title: "Error",
                description: "Merek, nama, dan minimal satu ukuran harus diisi",
                variant: "destructive",
            });
            return;
        }

        createMutation.mutate({
            brandId: formData.brandId,
            name: formData.name,
            sizes: formData.sizes,
            types: formData.types,
            priceRange: {
                min: parseFloat(formData.priceMin) || 0,
                max: parseFloat(formData.priceMax) || 0,
            },
            features: formData.features,
            rating: parseFloat(formData.rating) || 0,
            warranty: formData.warranty,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Produk Ban</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Merek *</Label>
                            <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih merek" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.logo} {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Turanza T005A"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ukuran Ban *</Label>
                        <div className="flex gap-2">
                            <Input
                                value={sizeInput}
                                onChange={(e) => setSizeInput(e.target.value)}
                                placeholder="Contoh: 205/55R16"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                            />
                            <Button type="button" onClick={handleAddSize}>
                                Tambah
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.sizes.map((size) => (
                                <div
                                    key={size}
                                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                                >
                                    {size}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSize(size)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Ban</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIRE_TYPES.map((type) => (
                                <div key={type.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={type.id}
                                        checked={formData.types.includes(type.id)}
                                        onCheckedChange={() => handleTypeToggle(type.id)}
                                    />
                                    <label htmlFor={type.id} className="text-sm cursor-pointer">
                                        {type.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priceMin">Harga Minimum (Rp)</Label>
                            <Input
                                id="priceMin"
                                type="number"
                                value={formData.priceMin}
                                onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                                placeholder="500000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priceMax">Harga Maximum (Rp)</Label>
                            <Input
                                id="priceMax"
                                type="number"
                                value={formData.priceMax}
                                onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                                placeholder="1000000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Fitur</Label>
                        <div className="flex gap-2">
                            <Input
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                placeholder="Contoh: Noise reduction"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                            />
                            <Button type="button" onClick={handleAddFeature}>
                                Tambah
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.features.map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                                >
                                    {feature}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(feature)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating (0-5)</Label>
                            <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                placeholder="4.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warranty">Garansi</Label>
                            <Input
                                id="warranty"
                                value={formData.warranty}
                                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                placeholder="5 tahun"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
