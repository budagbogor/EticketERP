import { useState, useMemo } from "react";
import { Vehicle, VehicleVariant } from "@/types/buku-pintar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBukuPintar } from "@/hooks/use-buku-pintar";
import { Loader2 } from "lucide-react";

interface VehicleSelectorProps {
    onSelect: (vehicle: Vehicle, variant: VehicleVariant) => void;
}

export function VehicleSelector({ onSelect }: VehicleSelectorProps) {
    const { vehicles: data, isSupabaseLoading } = useBukuPintar();
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedTransmission, setSelectedTransmission] = useState<string>(""); // New state
    const [selectedVariantId, setSelectedVariantId] = useState<string>("");

    const brands = useMemo(() => Array.from(new Set(data.map(v => v.brand))), [data]);

    const models = useMemo(() => {
        if (!selectedBrand) return [];
        return Array.from(new Set(data.filter(v => v.brand === selectedBrand).map(v => v.model)));
    }, [data, selectedBrand]);

    const years = useMemo(() => {
        if (!selectedBrand || !selectedModel) return [];
        const vehicle = data.find(v => v.brand === selectedBrand && v.model === selectedModel);
        if (!vehicle) return [];

        const start = vehicle.year_start;
        const end = vehicle.year_end || new Date().getFullYear();

        const yearList = [];
        for (let y = end; y >= start; y--) {
            yearList.push(y.toString());
        }
        return yearList;
    }, [data, selectedBrand, selectedModel]);

    const variants = useMemo(() => {
        if (!selectedBrand || !selectedModel) return [];
        const vehicle = data.find(v => v.brand === selectedBrand && v.model === selectedModel);
        if (!vehicle) return [];

        let filteredVariants = vehicle.variants;

        // Filter by Transmission if selected
        if (selectedTransmission && selectedTransmission !== "all") {
            filteredVariants = filteredVariants.filter(v => v.transmission === selectedTransmission);
        }

        return filteredVariants;
    }, [data, selectedBrand, selectedModel, selectedYear, selectedTransmission]);

    const handleSearch = () => {
        const vehicle = data.find(v => v.brand === selectedBrand && v.model === selectedModel);

        if (vehicle) {
            let variant = vehicle.variants.find(v => v.id === selectedVariantId);

            // Logic for "Semua" selection or empty selection: default to the first available variant in the filtered list
            if ((!selectedVariantId || selectedVariantId === "all") && variants.length > 0) {
                variant = variants[0];
            }

            if (variant) {
                onSelect(vehicle, variant);
            }
        }
    };

    if (isSupabaseLoading) {
        return (
            <div className="flex items-center justify-center p-8 bg-card rounded-lg border">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Memuat data kendaraan...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-card p-6 rounded-lg border shadow-sm">
            <div className="space-y-2">
                <Label>Merek</Label>
                <Select value={selectedBrand} onValueChange={(val) => {
                    setSelectedBrand(val);
                    setSelectedBrand(val);
                    setSelectedModel("");
                    setSelectedYear("");
                    setSelectedVariantId("");
                    setSelectedTransmission("");
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Merek" />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={(val) => {
                    setSelectedModel(val);
                    setSelectedModel(val);
                    setSelectedYear("");
                    setSelectedVariantId("");
                    setSelectedTransmission("");
                }} disabled={!selectedBrand}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {models.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Tahun</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!selectedModel}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Transmisi</Label>
                <Select value={selectedTransmission} onValueChange={setSelectedTransmission} disabled={!selectedModel}>
                    <SelectTrigger>
                        <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="AT">Automatic (AT)</SelectItem>
                        <SelectItem value="MT">Manual (MT)</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                        <SelectItem value="DCT">DCT</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Tipe / Varian</Label>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId} disabled={!selectedModel}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Varian" />
                    </SelectTrigger>
                    <SelectContent>
                        {variants.length > 0 && <SelectItem value="all">Semua</SelectItem>}
                        {variants.map(variant => (
                            <SelectItem key={variant.id} value={variant.id}>{variant.name}</SelectItem>
                        ))}
                        {variants.length === 0 && (
                            <SelectItem value="empty" disabled>Belum ada varian (Tambah Database)</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleSearch} disabled={!selectedModel || variants.length === 0} className="w-full">
                Cari Data
            </Button>
        </div>
    );
}
