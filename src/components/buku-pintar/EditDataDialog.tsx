import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle, VehicleVariant } from "@/types/buku-pintar";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditDataDialogProps {
    vehicle: Vehicle;
    variant: VehicleVariant;
    onUpdate: (brand: string, model: string, variant: VehicleVariant) => void;
}

export function EditDataDialog({ vehicle, variant, onUpdate }: EditDataDialogProps) {
    const [open, setOpen] = useState(false);
    const [variantName, setVariantName] = useState("");
    const [yearStart, setYearStart] = useState("");
    const [yearEnd, setYearEnd] = useState("");
    const [engineCode, setEngineCode] = useState("");
    const [transmission, setTransmission] = useState("");

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

    // Suspension Specs
    const [shockFront, setShockFront] = useState("");
    const [shockRear, setShockRear] = useState("");
    const [rackEnd, setRackEnd] = useState("");
    const [tieRod, setTieRod] = useState("");
    const [linkStabilizer, setLinkStabilizer] = useState("");
    const [lowerArm, setLowerArm] = useState("");
    const [upperArm, setUpperArm] = useState("");

    const { toast } = useToast();

    // Load data when dialog opens
    useEffect(() => {
        if (open && variant) {
            loadVariantData();
        }
    }, [open, variant]);

    const loadVariantData = () => {
        setVariantName(variant.name);
        setYearStart(variant.year_start?.toString() || "");
        setYearEnd(variant.year_end?.toString() || "");
        setEngineCode(variant.engine_code);
        setTransmission(variant.transmission);

        // Oil
        setOilViscosity(variant.specifications.engine_oil.viscosity_options[0] || "");
        setOilCapacity(variant.specifications.engine_oil.capacity_liter.toString());
        setOilQuality(variant.specifications.engine_oil.quality_standard || "");
        setOilBrands(variant.specifications.engine_oil.recommended_brands?.join(", ") || "");

        // Transmission Oil
        setTransOilType(variant.specifications.transmission_oil.type);
        setTransOilCapacity(variant.specifications.transmission_oil.capacity_liter.toString());

        // Parts
        const oilFilterPart = variant.specifications.parts.find(p => p.category === "Filter Oli");
        const airFilterPart = variant.specifications.parts.find(p => p.category === "Filter Udara");
        const cabinFilterPart = variant.specifications.parts.find(p => p.category === "Filter Kabin");
        const sparkPlugPart = variant.specifications.parts.find(p => p.category === "Busi");

        setPartOilFilter(oilFilterPart?.part_number || "");
        setPartAirFilter(airFilterPart?.part_number || "");
        setPartCabinFilter(cabinFilterPart?.part_number || "");
        setPartSparkPlug(sparkPlugPart?.part_number || "");

        // Battery
        if (variant.specifications.battery) {
            setBatteryType(variant.specifications.battery.type || "");
            setBatteryModel(variant.specifications.battery.model || "");
            setBatteryAmpere(variant.specifications.battery.ampere?.toString() || "");
            setBatteryVoltage(variant.specifications.battery.voltage?.toString() || "");
            setBatteryDimensions(variant.specifications.battery.dimensions || "");
        }

        // Brakes
        if (variant.specifications.brakes) {
            setBrakeFront(variant.specifications.brakes.front_type || "");
            setBrakeRear(variant.specifications.brakes.rear_type || "");
            setBrakeFluid(variant.specifications.brakes.fluid_type || "");
            setBrakePadFront(variant.specifications.brakes.pad_part_number_front || "");
            setBrakeShoeRear(variant.specifications.brakes.shoe_part_number_rear || "");
        }

        // Suspension
        if (variant.specifications.suspension) {
            setShockFront(variant.specifications.suspension.shock_absorber_front || "");
            setShockRear(variant.specifications.suspension.shock_absorber_rear || "");
            setRackEnd(variant.specifications.suspension.rack_end || "");
            setTieRod(variant.specifications.suspension.tie_rod_end || "");
            setLinkStabilizer(variant.specifications.suspension.link_stabilizer || "");
            setLowerArm(variant.specifications.suspension.lower_arm || "");
            setUpperArm(variant.specifications.suspension.upper_arm || "");
        }
    };

    const handleUpdate = () => {
        if (!variantName) {
            toast({ title: "Error", description: "Nama varian harus diisi", variant: "destructive" });
            return;
        }

        const updatedVariant: VehicleVariant = {
            ...variant,
            name: variantName,
            transmission: (transmission as "AT" | "MT" | "CVT" | "DCT" | "Manual" | "Automatic") || variant.transmission,
            year_start: yearStart ? Number(yearStart) : variant.year_start,
            year_end: yearEnd ? Number(yearEnd) : variant.year_end,
            engine_code: engineCode || variant.engine_code,
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
                tires: variant.specifications.tires,
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

        onUpdate(vehicle.brand, vehicle.model, updatedVariant);
        toast({ title: "Sukses", description: "Data berhasil diperbarui" });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Data Kendaraan</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
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

                    <Tabs defaultValue="oil" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="oil">Oli</TabsTrigger>
                            <TabsTrigger value="parts">Part</TabsTrigger>
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
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleUpdate}>Simpan Perubahan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
