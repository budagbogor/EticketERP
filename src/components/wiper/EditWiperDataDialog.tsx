import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWiperSpecification } from "@/hooks/useWiperData";
import { TablesInsert } from "@/integrations/supabase/types";
import type { VehicleWiperSpec } from "@/data/wiperData";

type WiperSizeInsert = Omit<TablesInsert<"wiper_sizes">, "specification_id">;

interface EditWiperDataDialogProps {
    data: VehicleWiperSpec | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditWiperDataDialog({ data, open, onOpenChange }: EditWiperDataDialogProps) {
    const updateMutation = useUpdateWiperSpecification();

    // Specification fields
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [yearStart, setYearStart] = useState("");
    const [yearEnd, setYearEnd] = useState("");
    const [notes, setNotes] = useState("");

    // Wiper sizes (simplified - only size in inches)
    const [leftSize, setLeftSize] = useState("");
    const [rightSize, setRightSize] = useState("");
    const [rearSize, setRearSize] = useState("");

    // Load data when dialog opens
    useEffect(() => {
        if (data && open) {
            setBrand(data.merek);
            setModel(data.model);
            setYearStart(String(data.tahunMulai));
            setYearEnd(data.tahunSelesai ? String(data.tahunSelesai) : "");
            setNotes(data.catatan || "");

            const kiri = data.wipers.find((w) => w.posisi === "kiri");
            const kanan = data.wipers.find((w) => w.posisi === "kanan");
            const belakang = data.wipers.find((w) => w.posisi === "belakang");

            setLeftSize(kiri ? String(kiri.ukuranInch) : "");
            setRightSize(kanan ? String(kanan.ukuranInch) : "");
            setRearSize(belakang ? String(belakang.ukuranInch) : "");
        }
    }, [data, open]);

    const handleSubmit = () => {
        if (!data || !brand || !model || !yearStart || !leftSize || !rightSize) {
            return;
        }

        const specification: Partial<TablesInsert<"wiper_specifications">> = {
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
                blade_brand: null,
                part_code: null,
                stock: null,
                price: null,
            },
            {
                position: "kanan",
                size_inch: parseInt(rightSize),
                blade_brand: null,
                part_code: null,
                stock: null,
                price: null,
            },
        ];

        if (rearSize) {
            sizes.push({
                position: "belakang",
                size_inch: parseInt(rearSize),
                blade_brand: null,
                part_code: null,
                stock: null,
                price: null,
            });
        }

        updateMutation.mutate(
            { id: data.id, specification, sizes },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Data Wiper</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand">Merek *</Label>
                            <Input
                                id="edit-brand"
                                placeholder="Toyota"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model">Model *</Label>
                            <Input
                                id="edit-model"
                                placeholder="Avanza"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-yearStart">Tahun Mulai *</Label>
                            <Input
                                id="edit-yearStart"
                                type="number"
                                placeholder="2012"
                                value={yearStart}
                                onChange={(e) => setYearStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-yearEnd">Tahun Selesai</Label>
                            <Input
                                id="edit-yearEnd"
                                type="number"
                                placeholder="2018"
                                value={yearEnd}
                                onChange={(e) => setYearEnd(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-leftSize">Ukuran Wiper Kiri (inch) *</Label>
                            <Input
                                id="edit-leftSize"
                                type="number"
                                placeholder="24"
                                value={leftSize}
                                onChange={(e) => setLeftSize(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-rightSize">Ukuran Wiper Kanan (inch) *</Label>
                            <Input
                                id="edit-rightSize"
                                type="number"
                                placeholder="14"
                                value={rightSize}
                                onChange={(e) => setRightSize(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-rearSize">Ukuran Wiper Belakang (inch)</Label>
                            <Input
                                id="edit-rearSize"
                                type="number"
                                placeholder="12"
                                value={rearSize}
                                onChange={(e) => setRearSize(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Catatan</Label>
                        <Textarea
                            id="edit-notes"
                            placeholder="Catatan tambahan (opsional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!brand || !model || !yearStart || !leftSize || !rightSize || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
