import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useAddWiperSpecification } from "@/hooks/useWiperData";
import { TablesInsert } from "@/integrations/supabase/types";

type WiperSizeInsert = Omit<TablesInsert<"wiper_sizes">, "specification_id">;

export function AddWiperDataDialog() {
    const [open, setOpen] = useState(false);
    const addMutation = useAddWiperSpecification();

    // Specification fields
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [yearStart, setYearStart] = useState("");
    const [yearEnd, setYearEnd] = useState("");
    const [notes, setNotes] = useState("");

    // Wiper sizes
    const [leftSize, setLeftSize] = useState("");
    const [leftBrand, setLeftBrand] = useState("");
    const [leftPartCode, setLeftPartCode] = useState("");
    const [leftStock, setLeftStock] = useState("");
    const [leftPrice, setLeftPrice] = useState("");

    const [rightSize, setRightSize] = useState("");
    const [rightBrand, setRightBrand] = useState("");
    const [rightPartCode, setRightPartCode] = useState("");
    const [rightStock, setRightStock] = useState("");
    const [rightPrice, setRightPrice] = useState("");

    const [rearSize, setRearSize] = useState("");
    const [rearBrand, setRearBrand] = useState("");
    const [rearPartCode, setRearPartCode] = useState("");
    const [rearStock, setRearStock] = useState("");
    const [rearPrice, setRearPrice] = useState("");

    const resetForm = () => {
        setBrand("");
        setModel("");
        setYearStart("");
        setYearEnd("");
        setNotes("");
        setLeftSize("");
        setLeftBrand("");
        setLeftPartCode("");
        setLeftStock("");
        setLeftPrice("");
        setRightSize("");
        setRightBrand("");
        setRightPartCode("");
        setRightStock("");
        setRightPrice("");
        setRearSize("");
        setRearBrand("");
        setRearPartCode("");
        setRearStock("");
        setRearPrice("");
    };

    const handleSubmit = () => {
        if (!brand || !model || !yearStart || !leftSize || !rightSize) {
            return;
        }

        const specification: TablesInsert<"wiper_specifications"> = {
            brand,
            model,
            year_start: parseInt(yearStart),
            year_end: yearEnd ? parseInt(yearEnd) : null,
            notes: notes || null,
        };

        const sizes: WiperSizeInsert[] = [
            {
                position: "kiri",
                size_inch: parseInt(leftSize),
                blade_brand: leftBrand || null,
                part_code: leftPartCode || null,
                stock: leftStock ? parseInt(leftStock) : null,
                price: leftPrice ? parseFloat(leftPrice) : null,
            },
            {
                position: "kanan",
                size_inch: parseInt(rightSize),
                blade_brand: rightBrand || null,
                part_code: rightPartCode || null,
                stock: rightStock ? parseInt(rightStock) : null,
                price: rightPrice ? parseFloat(rightPrice) : null,
            },
        ];

        if (rearSize) {
            sizes.push({
                position: "belakang",
                size_inch: parseInt(rearSize),
                blade_brand: rearBrand || null,
                part_code: rearPartCode || null,
                stock: rearStock ? parseInt(rearStock) : null,
                price: rearPrice ? parseFloat(rearPrice) : null,
            });
        }

        addMutation.mutate(
            { specification, sizes },
            {
                onSuccess: () => {
                    setOpen(false);
                    resetForm();
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Data Wiper</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Merek *</Label>
                            <Input
                                id="brand"
                                placeholder="Toyota"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model *</Label>
                            <Input
                                id="model"
                                placeholder="Avanza"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="yearStart">Tahun Mulai *</Label>
                            <Input
                                id="yearStart"
                                type="number"
                                placeholder="2012"
                                value={yearStart}
                                onChange={(e) => setYearStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="yearEnd">Tahun Selesai</Label>
                            <Input
                                id="yearEnd"
                                type="number"
                                placeholder="2018 (Kosongkan jika masih produksi)"
                                value={yearEnd}
                                onChange={(e) => setYearEnd(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea
                            id="notes"
                            placeholder="Catatan tambahan (opsional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-4">Wiper Kiri (Penumpang) *</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ukuran (inch) *</Label>
                                <Input
                                    type="number"
                                    placeholder="24"
                                    value={leftSize}
                                    onChange={(e) => setLeftSize(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Merek Blade</Label>
                                <Input
                                    placeholder="Premium"
                                    value={leftBrand}
                                    onChange={(e) => setLeftBrand(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kode Barang</Label>
                                <Input
                                    placeholder="WB-001"
                                    value={leftPartCode}
                                    onChange={(e) => setLeftPartCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stok</Label>
                                <Input
                                    type="number"
                                    placeholder="5"
                                    value={leftStock}
                                    onChange={(e) => setLeftStock(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Harga (Rp)</Label>
                                <Input
                                    type="number"
                                    placeholder="85000"
                                    value={leftPrice}
                                    onChange={(e) => setLeftPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-4">Wiper Kanan (Pengemudi) *</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ukuran (inch) *</Label>
                                <Input
                                    type="number"
                                    placeholder="14"
                                    value={rightSize}
                                    onChange={(e) => setRightSize(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Merek Blade</Label>
                                <Input
                                    placeholder="Premium"
                                    value={rightBrand}
                                    onChange={(e) => setRightBrand(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kode Barang</Label>
                                <Input
                                    placeholder="WB-002"
                                    value={rightPartCode}
                                    onChange={(e) => setRightPartCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stok</Label>
                                <Input
                                    type="number"
                                    placeholder="5"
                                    value={rightStock}
                                    onChange={(e) => setRightStock(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Harga (Rp)</Label>
                                <Input
                                    type="number"
                                    placeholder="80000"
                                    value={rightPrice}
                                    onChange={(e) => setRightPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-4">Wiper Belakang (Opsional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ukuran (inch)</Label>
                                <Input
                                    type="number"
                                    placeholder="12"
                                    value={rearSize}
                                    onChange={(e) => setRearSize(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Merek Blade</Label>
                                <Input
                                    placeholder="Universal"
                                    value={rearBrand}
                                    onChange={(e) => setRearBrand(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kode Barang</Label>
                                <Input
                                    placeholder="WB-003"
                                    value={rearPartCode}
                                    onChange={(e) => setRearPartCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stok</Label>
                                <Input
                                    type="number"
                                    placeholder="3"
                                    value={rearStock}
                                    onChange={(e) => setRearStock(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Harga (Rp)</Label>
                                <Input
                                    type="number"
                                    placeholder="60000"
                                    value={rearPrice}
                                    onChange={(e) => setRearPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!brand || !model || !yearStart || !leftSize || !rightSize || addMutation.isPending}
                    >
                        {addMutation.isPending ? "Menyimpan..." : "Simpan Data"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
