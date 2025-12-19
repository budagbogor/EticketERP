import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, Droplet, Wrench, CircleDot, Info, Activity, Zap, Disc, Download, Table as TableIcon, Search as SearchIcon } from "lucide-react";
import { exportToCSV } from "@/lib/export-utils";
import { VehicleSelector } from "@/components/buku-pintar/VehicleSelector";
import { VehicleDatabaseTable } from "@/components/buku-pintar/VehicleDatabaseTable";
import { OilSection } from "@/components/buku-pintar/OilSection";
import { PartSection } from "@/components/buku-pintar/PartSection";
import { TireSection } from "@/components/buku-pintar/TireSection";
import { SuspensionSection } from "@/components/buku-pintar/SuspensionSection";
import { BatterySection } from "@/components/buku-pintar/BatterySection";
import { BrakeSection } from "@/components/buku-pintar/BrakeSection";
import { Vehicle, VehicleVariant, RecommendedPart, TireSpec, BrakeSpec } from "@/types/buku-pintar";
import { AddDataDialog } from "@/components/buku-pintar/AddDataDialog";
import { EditDataDialog } from "@/components/buku-pintar/EditDataDialog";
import { ImportDataDialog } from "@/components/buku-pintar/ImportDataDialog";
import { useBukuPintar } from "@/hooks/use-buku-pintar";

export default function BukuPintar() {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
    const [viewMode, setViewMode] = useState<"search" | "table">("search");
    const { vehicles, supabaseBrands, addVariantData, updateVariantData, deleteVariantData, importVehicleData, error } = useBukuPintar();

    // Update selectedVariant when vehicles data changes (e.g., after edit)
    useEffect(() => {
        if (selectedVehicle && selectedVariant) {
            const updatedVehicle = vehicles.find(
                v => v.brand === selectedVehicle.brand && v.model === selectedVehicle.model
            );
            if (updatedVehicle) {
                const updatedVariant = updatedVehicle.variants.find(
                    v => v.id === selectedVariant.id
                );
                if (updatedVariant) {
                    setSelectedVariant(updatedVariant);
                    setSelectedVehicle(updatedVehicle);
                }
            }
        }
    }, [vehicles]);

    const handleSelectVehicle = (vehicle: Vehicle, variant: VehicleVariant) => {
        setSelectedVehicle(vehicle);
        setSelectedVariant(variant);
    };

    // Transform data for components
    const getTransformedParts = (variant: VehicleVariant): RecommendedPart[] => {
        const parts: RecommendedPart[] = [];
        const specs = variant.specifications;

        if (specs.filters) {
            if (specs.filters.oil_filter) parts.push({ category: "Filter Oli", name: "Filter Oli", part_number: specs.filters.oil_filter });
            if (specs.filters.air_filter) parts.push({ category: "Filter Udara", name: "Filter Udara", part_number: specs.filters.air_filter });
            if (specs.filters.cabin_filter) parts.push({ category: "Filter Kabin", name: "Filter Kabin", part_number: specs.filters.cabin_filter });
            if (specs.filters.fuel_filter) parts.push({ category: "Filter Bensin", name: "Filter Bahan Bakar", part_number: specs.filters.fuel_filter });
            if (specs.filters.spark_plug) parts.push({ category: "Busi", name: "Busi", part_number: specs.filters.spark_plug });
        }

        if (specs.wiper) {
            if (specs.wiper.driver) parts.push({ category: "Wiper", name: "Wiper Depan (Kanan)", part_number: specs.wiper.driver });
            if (specs.wiper.passenger) parts.push({ category: "Wiper", name: "Wiper Depan (Kiri)", part_number: specs.wiper.passenger });
            if (specs.wiper.rear) parts.push({ category: "Wiper", name: "Wiper Belakang", part_number: specs.wiper.rear });
        }

        if (specs.parts) {
            parts.push(...specs.parts);
        }

        return parts;
    };

    const getTransformedTires = (variant: VehicleVariant): TireSpec[] => {
        const tires: TireSpec[] = [];
        const specs = variant.specifications;

        if (specs.tire) {
            // Front tire
            if (specs.tire.front_size) {
                tires.push({
                    location: "Depan",
                    size: specs.tire.front_size,
                    pressure_psi_front: parseInt(specs.tire.front_pressure || "0") || undefined,
                    recommended_brands: []
                });
            }
            // Rear tire
            if (specs.tire.rear_size) {
                tires.push({
                    location: "Belakang",
                    size: specs.tire.rear_size,
                    pressure_psi_rear: parseInt(specs.tire.rear_pressure || "0") || undefined,
                    recommended_brands: []
                });
            }
        }

        if (specs.tires) {
            tires.push(...specs.tires);
        }

        return tires;
    };

    const getTransformedBrakes = (variant: VehicleVariant): BrakeSpec => {
        const specs = variant.specifications;
        const brakes: BrakeSpec = {
            ...specs.brakes,
            pad_part_number_front: specs.brake_parts?.front_pad || specs.brakes?.pad_part_number_front,
            shoe_part_number_rear: specs.brake_parts?.rear_pad || specs.brakes?.shoe_part_number_rear,
            // Map legacy props if available, or current structure to legacy
        };
        // Ensure some fields are present so component doesn't look too empty
        if (specs.brake_parts?.front_pad && !brakes.front_type) brakes.front_type = "Disc"; // Assumption
        if (specs.brake_parts?.rear_pad && !brakes.rear_type) brakes.rear_type = "Disc/Drum"; // Assumption

        return brakes;
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Buku Pintar</h1>
                    <p className="text-muted-foreground">Database teknis, spesifikasi oli, part, kaki-kaki, dan ban kendaraan</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-muted p-1 rounded-lg mr-2">
                        <Button
                            variant={viewMode === "search" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("search")}
                            className="text-xs"
                        >
                            <SearchIcon className="w-3 h-3 mr-1" />
                            Pencarian
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className="text-xs"
                        >
                            <TableIcon className="w-3 h-3 mr-1" />
                            Tabel Data
                        </Button>
                    </div>

                    <Button variant="outline" onClick={() => exportToCSV(vehicles)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <AddDataDialog brands={supabaseBrands} onAdd={addVariantData} />
                    <ImportDataDialog onImport={importVehicleData} />
                </div>
            </div>

            {error && (
                <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Terjadi Kesalahan</p>
                        <p className="text-sm">
                            Gagal memuat data. Kemungkinan tabel database belum dibuat atau ada masalah koneksi.
                            Silakan hubungi administrator atau jalankan script migrasi.
                            <br />
                            Detail: {error instanceof Error ? error.message : JSON.stringify(error)}
                        </p>
                    </div>
                </div>
            )}

            {viewMode === "search" ? (
                <>
                    <VehicleSelector onSelect={(v, var_data) => {
                        handleSelectVehicle(v, var_data);
                        // No need to switch viewMode here as we are already in search mode
                    }} />

                    {selectedVehicle && selectedVariant ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-full">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-primary">
                                            {selectedVehicle.brand} {selectedVehicle.model} - {selectedVariant.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Tahun: {selectedVariant.year_start} - {selectedVariant.year_end || "Sekarang"} •
                                            Type Mesin: {selectedVariant.engine_type || "-"}
                                        </p>
                                    </div>
                                </div>
                                <EditDataDialog
                                    vehicle={selectedVehicle}
                                    variant={selectedVariant}
                                    onUpdate={updateVariantData}
                                />
                            </div>

                            <Tabs defaultValue="oil" className="w-full">
                                <TabsList className="flex flex-wrap h-auto gap-2">
                                    <TabsTrigger value="oil" className="flex gap-2">
                                        <Droplet className="w-4 h-4" /> Oli
                                    </TabsTrigger>
                                    <TabsTrigger value="parts" className="flex gap-2">
                                        <Wrench className="w-4 h-4" /> Part
                                    </TabsTrigger>
                                    <TabsTrigger value="suspension" className="flex gap-2">
                                        <Activity className="w-4 h-4" /> Kaki-kaki
                                    </TabsTrigger>
                                    <TabsTrigger value="brakes" className="flex gap-2">
                                        <Disc className="w-4 h-4" /> Rem
                                    </TabsTrigger>
                                    <TabsTrigger value="battery" className="flex gap-2">
                                        <Zap className="w-4 h-4" /> Aki
                                    </TabsTrigger>
                                    <TabsTrigger value="tires" className="flex gap-2">
                                        <CircleDot className="w-4 h-4" /> Ban
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="oil" className="mt-6">
                                    <OilSection
                                        engineOil={selectedVariant.specifications.engine_oil}
                                        transmissionOil={selectedVariant.specifications.transmission_oil}
                                        differentialOil={selectedVariant.specifications.differential_oil}
                                        brakeOil={selectedVariant.specifications.brake_oil}
                                        radiatorCoolant={selectedVariant.specifications.radiator_coolant}
                                        acFreon={selectedVariant.specifications.ac_freon}
                                    />
                                </TabsContent>

                                <TabsContent value="parts" className="mt-6">
                                    <PartSection
                                        parts={getTransformedParts(selectedVariant)}
                                    />
                                </TabsContent>

                                <TabsContent value="suspension" className="mt-6">
                                    <SuspensionSection suspension={selectedVariant.specifications.suspension} />
                                </TabsContent>

                                <TabsContent value="brakes" className="mt-6">
                                    <BrakeSection brakes={getTransformedBrakes(selectedVariant)} />
                                </TabsContent>

                                <TabsContent value="battery" className="mt-6">
                                    <BatterySection battery={selectedVariant.specifications.battery} />
                                </TabsContent>

                                <TabsContent value="tires" className="mt-6">
                                    <TireSection tires={getTransformedTires(selectedVariant)} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Info className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <CardTitle className="text-lg font-medium text-muted-foreground">Belum ada kendaraan dipilih</CardTitle>
                                <CardDescription>
                                    Silakan pilih merek, model, tahun, dan varian kendaraan di atas.
                                    <br />
                                    Jika data belum ada, gunakan tombol "Tambah Database".
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <VehicleDatabaseTable
                    vehicles={vehicles}
                    onSelect={(v, var_data) => {
                        handleSelectVehicle(v, var_data);
                        setViewMode("search");
                    }}
                    onDelete={deleteVariantData}
                />
            )}
        </div>
    );
}
