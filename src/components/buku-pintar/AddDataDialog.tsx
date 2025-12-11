import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarBrand } from "@/hooks/use-vehicles";
import { VehicleVariant } from "@/types/buku-pintar";
import { Plus, ScrollText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddDataDialogProps {
    brands: CarBrand[];
    onAdd: (brand: string, model: string, variant: VehicleVariant) => void;
}

export function AddDataDialog({ brands, onAdd }: AddDataDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [variantName, setVariantName] = useState("");
    const [yearStart, setYearStart] = useState("");
    const [yearEnd, setYearEnd] = useState("");
    const [engineCode, setEngineCode] = useState("");
    const [transmission, setTransmission] = useState("");
    const [engineType, setEngineType] = useState("");
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewModel, setIsNewModel] = useState(false);

    // Oil Specs
    const [oilViscosity, setOilViscosity] = useState("");
    const [oilCapacity, setOilCapacity] = useState("");
    const [oilQuality, setOilQuality] = useState("");
    const [oilBrands, setOilBrands] = useState("");

    // Transmission Oil
    const [transOilType, setTransOilType] = useState("");
    const [transOilCapacity, setTransOilCapacity] = useState("");

    // Parts
    const [partOilFilter, setPartOilFilter] = useState("");
    const [partAirFilter, setPartAirFilter] = useState("");
    const [partCabinFilter, setPartCabinFilter] = useState("");
    const [partSparkPlug, setPartSparkPlug] = useState("");

    // Battery Specs
    const [batteryType, setBatteryType] = useState("");
    const [batteryModel, setBatteryModel] = useState("");
    const [batteryAmpere, setBatteryAmpere] = useState("");
    const [batteryVoltage, setBatteryVoltage] = useState("");
    const [batteryDimensions, setBatteryDimensions] = useState("");

    // Brake Specs
    const [brakeFront, setBrakeFront] = useState("");
    const [brakeRear, setBrakeRear] = useState("");
    const [brakeFluid, setBrakeFluid] = useState("");
    const [brakePadFront, setBrakePadFront] = useState("");
    const [brakeShoeRear, setBrakeShoeRear] = useState("");

    // Suspension Specs (Simplified for input, just main parts)
    const [shockFront, setShockFront] = useState("");
    const [shockRear, setShockRear] = useState("");
    const [rackEnd, setRackEnd] = useState("");
    const [tieRod, setTieRod] = useState("");
    const [linkStabilizer, setLinkStabilizer] = useState("");
    const [lowerArm, setLowerArm] = useState("");
    const [upperArm, setUpperArm] = useState("");

    // Tire Specs
    const [tireLocation, setTireLocation] = useState("Depan & Belakang");
    const [tireSize, setTireSize] = useState("");
    const [tirePressureFront, setTirePressureFront] = useState("");
    const [tirePressureRear, setTirePressureRear] = useState("");
    const [tireLoadSpeed, setTireLoadSpeed] = useState("");
    const [tireBrands, setTireBrands] = useState("");

    const { toast } = useToast();

    const handleAdd = () => {
        if (!selectedBrand || !selectedModel || !variantName) {
            toast({ title: "Error", description: "Mohon lengkapi data utama (Merek, Model, Varian)", variant: "destructive" });
            return;
        }

        const newVariant: VehicleVariant = {
            id: crypto.randomUUID(),
            name: variantName,
            transmission: (transmission as "AT" | "MT" | "CVT" | "DCT" | "Manual" | "Automatic") || "AT",
            engine_type: engineType as any,
            year_start: yearStart ? Number(yearStart) : undefined,
            year_end: yearEnd ? Number(yearEnd) : undefined,
            engine_code: engineCode || "N/A",
            specifications: {
                engine_oil: {
                    viscosity_options: [oilViscosity || "5W-30"],
                    capacity_liter: Number(oilCapacity) || 4,
                    capacity_with_filter_liter: (Number(oilCapacity) || 4) + 0.2,
                    quality_standard: oilQuality || "API SP",
                    recommended_brands: oilBrands ? oilBrands.split(",").map(b => b.trim()) : undefined
                },
                transmission_oil: {
                    type: transOilType || "Standard",
                    capacity_liter: Number(transOilCapacity) || 4
                },
                parts: [
                    ...(partOilFilter ? [{ category: "Filter Oli" as const, name: "Oil Filter", part_number: partOilFilter }] : []),
                    ...(partAirFilter ? [{ category: "Filter Udara" as const, name: "Air Filter", part_number: partAirFilter }] : []),
                    ...(partCabinFilter ? [{ category: "Filter Kabin" as const, name: "Cabin Filter", part_number: partCabinFilter }] : []),
                    ...(partSparkPlug ? [{ category: "Busi" as const, name: "Spark Plug", part_number: partSparkPlug }] : []),
                ],
                tires: tireSize ? [{
                    location: tireLocation as any,
                    size: tireSize,
                    pressure_psi_front: Number(tirePressureFront) || 32,
                    pressure_psi_rear: Number(tirePressureRear) || 32,
                    load_speed_index: tireLoadSpeed || undefined,
                    recommended_brands: tireBrands ? tireBrands.split(",").map(b => b.trim()) : undefined
                }] : [],
                battery: batteryType ? {
                    type: batteryType,
                    model: batteryModel,
                    ampere: Number(batteryAmpere) || 45,
                    voltage: Number(batteryVoltage) || 12,
                    dimensions: batteryDimensions
                } : undefined,
                brakes: brakeFront ? {
                    front_type: brakeFront,
                    rear_type: brakeRear,
                    fluid_type: brakeFluid,
                    pad_part_number_front: brakePadFront,
                    shoe_part_number_rear: brakeShoeRear
                } : undefined,
                suspension: shockFront ? {
                    shock_absorber_front: shockFront,
                    shock_absorber_rear: shockRear,
                    rack_end: rackEnd,
                    tie_rod_end: tieRod,
                    link_stabilizer: linkStabilizer,
                    lower_arm: lowerArm,
                    upper_arm: upperArm
                } : undefined
            }
        };

        onAdd(selectedBrand, selectedModel, newVariant);
        toast({ title: "Sukses", description: "Data berhasil ditambahkan ke database lokal" });
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedBrand("");
        setSelectedModel("");
        setIsNewBrand(false);
        setIsNewModel(false);
        setVariantName("");
        setYearStart("");
        setYearEnd("");
        setEngineCode("");
        setTransmission("");
        setEngineType("");
        setOilViscosity("");
        setOilCapacity("");
        setOilQuality("");
        setOilBrands("");
        setTransOilType("");
        setTransOilCapacity("");
        setPartOilFilter("");
        setPartAirFilter("");
        setPartCabinFilter("");
        setPartSparkPlug("");
        setBatteryType("");
        setBatteryModel("");
        setBatteryType("");
        setBatteryModel("");
        setBatteryDimensions("");
        setBrakeFront("");
        setBrakeRear("");
        setBrakePadFront("");
        setBrakeShoeRear("");
        setBrakeFluid("");
        setShockFront("");
        setShockRear("");
        setRackEnd("");
        setTieRod("");
        setLinkStabilizer("");
        setLowerArm("");
        setUpperArm("");
        setTireLocation("Depan & Belakang");
        setTireSize("");
        setTirePressureFront("");
        setTirePressureRear("");
        setTireLoadSpeed("");
        setTireBrands("");
    };

    const currentModels = brands.find(b => b.name === selectedBrand)?.models || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Database
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Data Buku Pintar</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Merek</Label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="new-brand"
                                        className="rounded border-gray-300"
                                        checked={isNewBrand}
                                        onChange={(e) => {
                                            setIsNewBrand(e.target.checked);
                                            setSelectedBrand("");
                                            setSelectedModel("");
                                            if (e.target.checked) setIsNewModel(true);
                                            else setIsNewModel(false);
                                        }}
                                    />
                                    <Label htmlFor="new-brand" className="text-xs font-normal cursor-pointer text-muted-foreground">Merek Baru?</Label>
                                </div>
                            </div>

                            {isNewBrand ? (
                                <Input
                                    placeholder="Nama Merek Baru"
                                    value={selectedBrand}
                                    onChange={e => setSelectedBrand(e.target.value)}
                                />
                            ) : (
                                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Merek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map(b => (
                                            <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Model</Label>
                                {!isNewBrand && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="new-model"
                                            className="rounded border-gray-300"
                                            checked={isNewModel}
                                            onChange={(e) => {
                                                setIsNewModel(e.target.checked);
                                                setSelectedModel("");
                                            }}
                                        />
                                        <Label htmlFor="new-model" className="text-xs font-normal cursor-pointer text-muted-foreground">Model Baru?</Label>
                                    </div>
                                )}
                            </div>

                            {isNewModel || isNewBrand ? (
                                <Input
                                    placeholder="Nama Model Baru"
                                    value={selectedModel}
                                    onChange={e => setSelectedModel(e.target.value)}
                                    disabled={!isNewBrand && !selectedBrand}
                                />
                            ) : (
                                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentModels.map(m => (
                                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nama Varian</Label>
                            <Input placeholder="Contoh: 1.5 G CVT" value={variantName} onChange={e => setVariantName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Mesin</Label>
                            <Input placeholder="Contoh: 2NR-VE" value={engineCode} onChange={e => setEngineCode(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tahun Mulai</Label>
                            <Input type="number" placeholder="2015" value={yearStart} onChange={e => setYearStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun Selesai</Label>
                            <Input type="number" placeholder="2022 (Kosongkan jika masih produksi)" value={yearEnd} onChange={e => setYearEnd(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Transmisi</Label>
                        <Select value={transmission} onValueChange={setTransmission}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Transmisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AT">Automatic (AT)</SelectItem>
                                <SelectItem value="MT">Manual (MT)</SelectItem>
                                <SelectItem value="CVT">CVT</SelectItem>
                                <SelectItem value="DCT">DCT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Type Mesin</Label>
                        <Select value={engineType} onValueChange={setEngineType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Type Mesin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bensin">Bensin</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Listrik">Listrik</SelectItem>
                                <SelectItem value="Gas">Gas</SelectItem>
                                <SelectItem value="Bensin Turbo">Bensin Turbo</SelectItem>
                                <SelectItem value="Diesel Turbo">Diesel Turbo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue="oil" className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="oil">Oli</TabsTrigger>
                            <TabsTrigger value="parts">Part</TabsTrigger>
                            <TabsTrigger value="tires">Ban</TabsTrigger>
                            <TabsTrigger value="battery">Aki</TabsTrigger>
                            <TabsTrigger value="brakes">Rem</TabsTrigger>
                            <TabsTrigger value="suspension">Kaki-kaki</TabsTrigger>
                        </TabsList>

                        <TabsContent value="oil" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Viskositas Oli</Label>
                                    <Input placeholder="0W-20" value={oilViscosity} onChange={e => setOilViscosity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kapasitas (L)</Label>
                                    <Input type="number" placeholder="4.0" value={oilCapacity} onChange={e => setOilCapacity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Standar Kualitas (API)</Label>
                                    <Input placeholder="API SP / ILSAC GF-6A" value={oilQuality} onChange={e => setOilQuality(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Merek Rekomendasi</Label>
                                    <Input placeholder="Pisahkan dengan koma (TMO, Shell)" value={oilBrands} onChange={e => setOilBrands(e.target.value)} />
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold mt-4 mb-2">Oli Transmisi</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipe Oli Transmisi</Label>
                                    <Input placeholder="CVT Fluid FE / ATF WS" value={transOilType} onChange={e => setTransOilType(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kapasitas (L)</Label>
                                    <Input type="number" placeholder="3.5" value={transOilCapacity} onChange={e => setTransOilCapacity(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="parts" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Filter Oli</Label>
                                    <Input placeholder="Part Number" value={partOilFilter} onChange={e => setPartOilFilter(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Udara</Label>
                                    <Input placeholder="Part Number" value={partAirFilter} onChange={e => setPartAirFilter(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Kabin / AC</Label>
                                    <Input placeholder="Part Number" value={partCabinFilter} onChange={e => setPartCabinFilter(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Busi</Label>
                                    <Input placeholder="Part Number" value={partSparkPlug} onChange={e => setPartSparkPlug(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tires" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Lokasi Ban</Label>
                                    <Select value={tireLocation} onValueChange={setTireLocation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Lokasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Depan & Belakang">Depan & Belakang</SelectItem>
                                            <SelectItem value="Depan">Depan</SelectItem>
                                            <SelectItem value="Belakang">Belakang</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ukuran Ban</Label>
                                    <Input placeholder="Contoh: 185/65 R15" value={tireSize} onChange={e => setTireSize(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tekanan Depan (PSI)</Label>
                                    <Input type="number" placeholder="32" value={tirePressureFront} onChange={e => setTirePressureFront(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tekanan Belakang (PSI)</Label>
                                    <Input type="number" placeholder="32" value={tirePressureRear} onChange={e => setTirePressureRear(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Load & Speed Index (Opsional)</Label>
                                    <Input placeholder="Contoh: 88H" value={tireLoadSpeed} onChange={e => setTireLoadSpeed(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Merek Rekomendasi</Label>
                                    <Input placeholder="Pisahkan dengan koma" value={tireBrands} onChange={e => setTireBrands(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="battery" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipe Aki</Label>
                                    <Input placeholder="Kering / Basah" value={batteryType} onChange={e => setBatteryType(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kode Model</Label>
                                    <Input placeholder="NS40ZL" value={batteryModel} onChange={e => setBatteryModel(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ampere (Ah)</Label>
                                    <Input type="number" placeholder="35" value={batteryAmpere} onChange={e => setBatteryAmpere(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Voltage (V)</Label>
                                    <Input type="number" placeholder="12" value={batteryVoltage} onChange={e => setBatteryVoltage(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Dimensi (P x L x T)</Label>
                                    <Input placeholder="Contoh: 187 x 127 x 203 mm" value={batteryDimensions} onChange={e => setBatteryDimensions(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="brakes" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rem Depan</Label>
                                    <Input placeholder="Cakram Ventilasi" value={brakeFront} onChange={e => setBrakeFront(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Part No. Kampas Depan</Label>
                                    <Input placeholder="04465-xxxxx" value={brakePadFront} onChange={e => setBrakePadFront(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rem Belakang</Label>
                                    <Input placeholder="Tromol" value={brakeRear} onChange={e => setBrakeRear(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Part No. Kampas Belakang</Label>
                                    <Input placeholder="04495-xxxxx" value={brakeShoeRear} onChange={e => setBrakeShoeRear(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Minyak Rem</Label>
                                    <Input placeholder="DOT 3 / DOT 4" value={brakeFluid} onChange={e => setBrakeFluid(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="suspension" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Shock Depan</Label>
                                    <Input placeholder="Kode Part / Tipe" value={shockFront} onChange={e => setShockFront(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shock Belakang</Label>
                                    <Input placeholder="Kode Part / Tipe" value={shockRear} onChange={e => setShockRear(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rack End</Label>
                                    <Input placeholder="Kode Part" value={rackEnd} onChange={e => setRackEnd(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tie Rod</Label>
                                    <Input placeholder="Kode Part" value={tieRod} onChange={e => setTieRod(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Stabilizer</Label>
                                    <Input placeholder="Kode Part" value={linkStabilizer} onChange={e => setLinkStabilizer(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lower Arm</Label>
                                    <Input placeholder="Kode Part" value={lowerArm} onChange={e => setLowerArm(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Upper Arm (Optional)</Label>
                                    <Input placeholder="Kode Part" value={upperArm} onChange={e => setUpperArm(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button onClick={handleAdd}>Simpan Data</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
