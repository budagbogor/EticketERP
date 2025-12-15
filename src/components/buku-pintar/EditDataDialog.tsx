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
    const [transOilBrands, setTransOilBrands] = useState("");

    // Differential Oil
    const [diffOilType, setDiffOilType] = useState("");
    const [diffOilCapacity, setDiffOilCapacity] = useState("");
    const [diffOilBrands, setDiffOilBrands] = useState("");

    // Parts
    const [partOilFilter, setPartOilFilter] = useState("");
    const [partOilFilterBrands, setPartOilFilterBrands] = useState("");
    const [partOilFilterInterval, setPartOilFilterInterval] = useState("");
    const [partAirFilter, setPartAirFilter] = useState("");
    const [partAirFilterBrands, setPartAirFilterBrands] = useState("");
    const [partAirFilterInterval, setPartAirFilterInterval] = useState("");
    const [partCabinFilter, setPartCabinFilter] = useState("");
    const [partCabinFilterBrands, setPartCabinFilterBrands] = useState("");
    const [partCabinFilterInterval, setPartCabinFilterInterval] = useState("");
    const [partSparkPlug, setPartSparkPlug] = useState("");
    const [partSparkPlugBrands, setPartSparkPlugBrands] = useState("");
    const [partSparkPlugInterval, setPartSparkPlugInterval] = useState("");
    const [partSolarFilter, setPartSolarFilter] = useState("");
    const [partSolarFilterBrands, setPartSolarFilterBrands] = useState("");
    const [partSolarFilterInterval, setPartSolarFilterInterval] = useState("");
    const [partBensinFilter, setPartBensinFilter] = useState("");
    const [partBensinFilterBrands, setPartBensinFilterBrands] = useState("");
    const [partBensinFilterInterval, setPartBensinFilterInterval] = useState("");

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
    const [brakeFrontBrands, setBrakeFrontBrands] = useState("");
    const [brakeRearBrands, setBrakeRearBrands] = useState("");

    // Suspension Specs
    const [shockFront, setShockFront] = useState("");
    const [shockFrontBrands, setShockFrontBrands] = useState("");
    const [shockRear, setShockRear] = useState("");
    const [shockRearBrands, setShockRearBrands] = useState("");
    const [rackEnd, setRackEnd] = useState("");
    const [rackEndBrands, setRackEndBrands] = useState("");
    const [tieRod, setTieRod] = useState("");
    const [tieRodBrands, setTieRodBrands] = useState("");
    const [linkStabilizer, setLinkStabilizer] = useState("");
    const [linkStabilizerBrands, setLinkStabilizerBrands] = useState("");
    const [lowerArm, setLowerArm] = useState("");
    const [lowerArmBrands, setLowerArmBrands] = useState("");
    const [upperArm, setUpperArm] = useState("");
    const [upperArmBrands, setUpperArmBrands] = useState("");
    const [upperSupport, setUpperSupport] = useState("");
    const [upperSupportBrands, setUpperSupportBrands] = useState("");

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
        // Transmission Oil
        setTransOilType(variant.specifications.transmission_oil.type);
        setTransOilCapacity(variant.specifications.transmission_oil.capacity_liter.toString());
        setTransOilBrands(variant.specifications.transmission_oil.recommended_brands?.join(", ") || "");

        // Differential Oil
        if (variant.specifications.differential_oil) {
            setDiffOilType(variant.specifications.differential_oil.type);
            setDiffOilCapacity(variant.specifications.differential_oil.capacity_liter.toString());
            setDiffOilBrands(variant.specifications.differential_oil.recommended_brands?.join(", ") || "");
        } else {
            setDiffOilType("");
            setDiffOilCapacity("");
            setDiffOilBrands("");
        }

        // Parts
        const oilFilterPart = variant.specifications.parts.find(p => p.category === "Filter Oli");
        const airFilterPart = variant.specifications.parts.find(p => p.category === "Filter Udara");
        const cabinFilterPart = variant.specifications.parts.find(p => p.category === "Filter Kabin");
        const sparkPlugPart = variant.specifications.parts.find(p => p.category === "Busi");
        const solarFilterPart = variant.specifications.parts.find(p => p.category === "Filter Solar");
        const bensinFilterPart = variant.specifications.parts.find(p => p.category === "Filter Bensin");

        setPartOilFilter(oilFilterPart?.part_number || "");
        setPartOilFilterBrands(oilFilterPart?.compatible_brands?.join(", ") || "");
        setPartOilFilterInterval(oilFilterPart?.replacement_interval_km?.toString() || "");
        setPartAirFilter(airFilterPart?.part_number || "");
        setPartAirFilterBrands(airFilterPart?.compatible_brands?.join(", ") || "");
        setPartAirFilterInterval(airFilterPart?.replacement_interval_km?.toString() || "");
        setPartCabinFilter(cabinFilterPart?.part_number || "");
        setPartCabinFilterBrands(cabinFilterPart?.compatible_brands?.join(", ") || "");
        setPartCabinFilterInterval(cabinFilterPart?.replacement_interval_km?.toString() || "");
        setPartSparkPlug(sparkPlugPart?.part_number || "");
        setPartSparkPlugBrands(sparkPlugPart?.compatible_brands?.join(", ") || "");
        setPartSparkPlugInterval(sparkPlugPart?.replacement_interval_km?.toString() || "");
        setPartSolarFilter(solarFilterPart?.part_number || "");
        setPartSolarFilterBrands(solarFilterPart?.compatible_brands?.join(", ") || "");
        setPartSolarFilterInterval(solarFilterPart?.replacement_interval_km?.toString() || "");
        setPartBensinFilter(bensinFilterPart?.part_number || "");
        setPartBensinFilterBrands(bensinFilterPart?.compatible_brands?.join(", ") || "");
        setPartBensinFilterInterval(bensinFilterPart?.replacement_interval_km?.toString() || "");

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
            setBrakeFrontBrands(variant.specifications.brakes.recommended_brands_front?.join(", ") || "");
            setBrakeRearBrands(variant.specifications.brakes.recommended_brands_rear?.join(", ") || "");
        }

        // Suspension
        // Suspension
        if (variant.specifications.suspension) {
            setShockFront(variant.specifications.suspension.shock_absorber_front || "");
            setShockFrontBrands(variant.specifications.suspension.shock_absorber_front_brands?.join(", ") || "");
            setShockRear(variant.specifications.suspension.shock_absorber_rear || "");
            setShockRearBrands(variant.specifications.suspension.shock_absorber_rear_brands?.join(", ") || "");
            setRackEnd(variant.specifications.suspension.rack_end || "");
            setRackEndBrands(variant.specifications.suspension.rack_end_brands?.join(", ") || "");
            setTieRod(variant.specifications.suspension.tie_rod_end || "");
            setTieRodBrands(variant.specifications.suspension.tie_rod_end_brands?.join(", ") || "");
            setLinkStabilizer(variant.specifications.suspension.link_stabilizer || "");
            setLinkStabilizerBrands(variant.specifications.suspension.link_stabilizer_brands?.join(", ") || "");
            setLowerArm(variant.specifications.suspension.lower_arm || "");
            setLowerArmBrands(variant.specifications.suspension.lower_arm_brands?.join(", ") || "");
            setUpperArm(variant.specifications.suspension.upper_arm || "");
            setUpperArmBrands(variant.specifications.suspension.upper_arm_brands?.join(", ") || "");
            setUpperSupport(variant.specifications.suspension.upper_support || "");
            setUpperSupportBrands(variant.specifications.suspension.upper_support_brands?.join(", ") || "");
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
                    capacity_liter: Number(transOilCapacity) || 4,
                    recommended_brands: transOilBrands ? transOilBrands.split(",").map(b => b.trim()) : undefined
                },
                differential_oil: diffOilType ? {
                    type: diffOilType,
                    capacity_liter: Number(diffOilCapacity) || 0,
                    recommended_brands: diffOilBrands ? diffOilBrands.split(",").map(b => b.trim()) : undefined
                } : undefined,
                parts: [
                    ...(partOilFilter ? [{ category: "Filter Oli" as const, name: "Oil Filter", part_number: partOilFilter, compatible_brands: partOilFilterBrands ? partOilFilterBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partOilFilterInterval) || undefined }] : []),
                    ...(partAirFilter ? [{ category: "Filter Udara" as const, name: "Air Filter", part_number: partAirFilter, compatible_brands: partAirFilterBrands ? partAirFilterBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partAirFilterInterval) || undefined }] : []),
                    ...(partCabinFilter ? [{ category: "Filter Kabin" as const, name: "Cabin Filter", part_number: partCabinFilter, compatible_brands: partCabinFilterBrands ? partCabinFilterBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partCabinFilterInterval) || undefined }] : []),
                    ...(partSparkPlug ? [{ category: "Busi" as const, name: "Spark Plug", part_number: partSparkPlug, compatible_brands: partSparkPlugBrands ? partSparkPlugBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partSparkPlugInterval) || undefined }] : []),
                    ...(partSolarFilter ? [{ category: "Filter Solar" as const, name: "Fuel Filter (Solar)", part_number: partSolarFilter, compatible_brands: partSolarFilterBrands ? partSolarFilterBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partSolarFilterInterval) || undefined }] : []),
                    ...(partBensinFilter ? [{ category: "Filter Bensin" as const, name: "Fuel Filter (Bensin)", part_number: partBensinFilter, compatible_brands: partBensinFilterBrands ? partBensinFilterBrands.split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(partBensinFilterInterval) || undefined }] : []),
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
                    shoe_part_number_rear: brakeShoeRear,
                    recommended_brands_front: brakeFrontBrands ? brakeFrontBrands.split(",").map(b => b.trim()) : undefined,
                    recommended_brands_rear: brakeRearBrands ? brakeRearBrands.split(",").map(b => b.trim()) : undefined
                } : undefined,
                suspension: shockFront ? {
                    shock_absorber_front: shockFront,
                    shock_absorber_front_brands: shockFrontBrands ? shockFrontBrands.split(",").map(b => b.trim()) : undefined,
                    shock_absorber_rear: shockRear,
                    shock_absorber_rear_brands: shockRearBrands ? shockRearBrands.split(",").map(b => b.trim()) : undefined,
                    rack_end: rackEnd,
                    rack_end_brands: rackEndBrands ? rackEndBrands.split(",").map(b => b.trim()) : undefined,
                    tie_rod_end: tieRod,
                    tie_rod_end_brands: tieRodBrands ? tieRodBrands.split(",").map(b => b.trim()) : undefined,
                    link_stabilizer: linkStabilizer,
                    link_stabilizer_brands: linkStabilizerBrands ? linkStabilizerBrands.split(",").map(b => b.trim()) : undefined,
                    lower_arm: lowerArm,
                    lower_arm_brands: lowerArmBrands ? lowerArmBrands.split(",").map(b => b.trim()) : undefined,
                    upper_arm: upperArm,
                    upper_arm_brands: upperArmBrands ? upperArmBrands.split(",").map(b => b.trim()) : undefined,
                    upper_support: upperSupport,
                    upper_support_brands: upperSupportBrands ? upperSupportBrands.split(",").map(b => b.trim()) : undefined
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
                                <div className="space-y-2 col-span-2">
                                    <Label>Merek Rekomendasi (Opsional)</Label>
                                    <Input placeholder="Pisahkan dengan koma" value={transOilBrands} onChange={e => setTransOilBrands(e.target.value)} />
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold mt-4 mb-2">Oli Differential (Gardan)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipe Oli Differential</Label>
                                    <Input placeholder="GL-5 80W-90" value={diffOilType} onChange={e => setDiffOilType(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kapasitas (L)</Label>
                                    <Input type="number" placeholder="2.5" value={diffOilCapacity} onChange={e => setDiffOilCapacity(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Merek Rekomendasi (Opsional)</Label>
                                    <Input placeholder="Pisahkan dengan koma" value={diffOilBrands} onChange={e => setDiffOilBrands(e.target.value)} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="parts" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Filter Oli</Label>
                                    <Input placeholder="Part Number" value={partOilFilter} onChange={e => setPartOilFilter(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partOilFilterBrands} onChange={e => setPartOilFilterBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partOilFilterInterval} onChange={e => setPartOilFilterInterval(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Udara</Label>
                                    <Input placeholder="Part Number" value={partAirFilter} onChange={e => setPartAirFilter(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partAirFilterBrands} onChange={e => setPartAirFilterBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partAirFilterInterval} onChange={e => setPartAirFilterInterval(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Kabin / AC</Label>
                                    <Input placeholder="Part Number" value={partCabinFilter} onChange={e => setPartCabinFilter(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partCabinFilterBrands} onChange={e => setPartCabinFilterBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partCabinFilterInterval} onChange={e => setPartCabinFilterInterval(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Busi</Label>
                                    <Input placeholder="Part Number" value={partSparkPlug} onChange={e => setPartSparkPlug(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partSparkPlugBrands} onChange={e => setPartSparkPlugBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partSparkPlugInterval} onChange={e => setPartSparkPlugInterval(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Solar (Diesel)</Label>
                                    <Input placeholder="Part Number" value={partSolarFilter} onChange={e => setPartSolarFilter(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partSolarFilterBrands} onChange={e => setPartSolarFilterBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partSolarFilterInterval} onChange={e => setPartSolarFilterInterval(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Filter Bensin</Label>
                                    <Input placeholder="Part Number" value={partBensinFilter} onChange={e => setPartBensinFilter(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Merek (koma)" className="text-xs h-8" value={partBensinFilterBrands} onChange={e => setPartBensinFilterBrands(e.target.value)} />
                                        <Input type="number" placeholder="KM Ganti" className="text-xs h-8" value={partBensinFilterInterval} onChange={e => setPartBensinFilterInterval(e.target.value)} />
                                    </div>
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
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={brakeFrontBrands} onChange={e => setBrakeFrontBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rem Belakang</Label>
                                    <Input placeholder="Tromol" value={brakeRear} onChange={e => setBrakeRear(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Part No. Kampas Belakang</Label>
                                    <Input placeholder="04495-xxxxx" value={brakeShoeRear} onChange={e => setBrakeShoeRear(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={brakeRearBrands} onChange={e => setBrakeRearBrands(e.target.value)} />
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
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={shockFrontBrands} onChange={e => setShockFrontBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shock Belakang</Label>
                                    <Input placeholder="Kode Part / Tipe" value={shockRear} onChange={e => setShockRear(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={shockRearBrands} onChange={e => setShockRearBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rack End</Label>
                                    <Input placeholder="Kode Part" value={rackEnd} onChange={e => setRackEnd(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={rackEndBrands} onChange={e => setRackEndBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tie Rod</Label>
                                    <Input placeholder="Kode Part" value={tieRod} onChange={e => setTieRod(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={tieRodBrands} onChange={e => setTieRodBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Stabilizer</Label>
                                    <Input placeholder="Kode Part" value={linkStabilizer} onChange={e => setLinkStabilizer(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={linkStabilizerBrands} onChange={e => setLinkStabilizerBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lower Arm</Label>
                                    <Input placeholder="Kode Part" value={lowerArm} onChange={e => setLowerArm(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={lowerArmBrands} onChange={e => setLowerArmBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Upper Arm (Optional)</Label>
                                    <Input placeholder="Kode Part" value={upperArm} onChange={e => setUpperArm(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={upperArmBrands} onChange={e => setUpperArmBrands(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Upper Support (Optional)</Label>
                                    <Input placeholder="Kode Part" value={upperSupport} onChange={e => setUpperSupport(e.target.value)} />
                                    <Input placeholder="Merek Rekomendasi (koma)" className="text-xs h-8 mt-2" value={upperSupportBrands} onChange={e => setUpperSupportBrands(e.target.value)} />
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
