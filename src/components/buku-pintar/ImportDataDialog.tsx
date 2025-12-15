import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { read, utils, writeFile } from "xlsx";
import { VehicleVariant } from "@/types/buku-pintar";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ImportDataDialogProps {
    onImport: (data: { brand: string; model: string; variant: VehicleVariant }[]) => void;
}

interface ImportRow {
    status: "valid" | "error";
    message?: string;
    data?: {
        brand: string;
        model: string;
        variant: VehicleVariant;
    };
    raw: any;
}

const TEMPLATE_COLUMNS = [
    "Merek", "Model", "Varian", "Tahun Mulai", "Tahun Selesai", "Kode Mesin", "Transmisi", "Type Mesin",
    "Oli - Viskositas", "Oli - Kapasitas (L)", "Oli - Standar (API)", "Oli - Merek Rekomendasi",
    "Oli Transmisi - Tipe", "Oli Transmisi - Kapasitas (L)", "Oli Transmisi - Merek Rekomendasi",
    "Oli Differential - Tipe", "Oli Differential - Kapasitas (L)", "Oli Differential - Merek Rekomendasi",
    "Part - Filter Oli", "Part - Filter Oli Merek", "Part - Filter Oli Ganti (KM)",
    "Part - Filter Udara", "Part - Filter Udara Merek", "Part - Filter Udara Ganti (KM)",
    "Part - Filter Kabin", "Part - Filter Kabin Merek", "Part - Filter Kabin Ganti (KM)",
    "Part - Busi", "Part - Busi Merek", "Part - Busi Ganti (KM)",
    "Part - Filter Solar", "Part - Filter Solar Merek", "Part - Filter Solar Ganti (KM)",
    "Part - Filter Bensin", "Part - Filter Bensin Merek", "Part - Filter Bensin Ganti (KM)",
    "Ban - Ukuran", "Ban - Tekanan Depan (PSI)", "Ban - Tekanan Belakang (PSI)", "Ban - Merek",
    "Aki - Tipe", "Aki - Model", "Aki - Ampere", "Aki - Voltage", "Aki - Dimensi",
    "Rem - Tipe Depan", "Rem - Kampas Depan (Part No)", "Rem - Merek Depan",
    "Rem - Tipe Belakang", "Rem - Kampas Belakang (Part No)", "Rem - Merek Belakang", "Rem - Minyak",
    "Kaki - Shock Depan", "Kaki - Shock Depan Merek", "Kaki - Shock Belakang", "Kaki - Shock Belakang Merek",
    "Kaki - Rack End", "Kaki - Rack End Merek", "Kaki - Tie Rod", "Kaki - Tie Rod Merek",
    "Kaki - Link Stabilizer", "Kaki - Link Stabilizer Merek", "Kaki - Lower Arm", "Kaki - Lower Arm Merek",
    "Kaki - Upper Arm", "Kaki - Upper Arm Merek", "Kaki - Upper Support", "Kaki - Upper Support Merek"
];

export function ImportDataDialog({ onImport }: ImportDataDialogProps) {
    const [open, setOpen] = useState(false);
    const [previewData, setPreviewData] = useState<ImportRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleDownloadTemplate = () => {
        const wb = utils.book_new();
        const ws = utils.aoa_to_sheet([
            TEMPLATE_COLUMNS,
            ["Toyota", "Avanza", "1.5 G CVT", 2022, "", "2NR-VE", "CVT", "Bensin", "0W-20", 4, "API SP", "TMO", "CVT FE", 3.5, "TMO, Castrol", "GL-5 80W-90", 2.5, "TMO, Shell", "123-456", "Denso", 10000, "789-012", "Denso", 20000, "345-678", "Denso", 30000, "901-234", "NGK", 40000, "", "", 20000, "", "", 40000, "195/60 R16", 33, 33, "Dunlop", "MF", "34B19L", 35, 12, "", "Cakram", "04465-123", "Tromol", "04495-456", "DOT 3", "Part-001", "Part-002", "Part-003", "Part-004", "Part-005", "Part-006", "", ""]
        ]);

        // Auto-width columns
        const wscols = TEMPLATE_COLUMNS.map(c => ({ wch: c.length + 5 }));
        ws['!cols'] = wscols;

        utils.book_append_sheet(wb, ws, "Template Buku Pintar");
        writeFile(wb, "Template_Import_Buku_Pintar.xlsx");
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        try {
            const buffer = await file.arrayBuffer();
            const wb = read(buffer);
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = utils.sheet_to_json(ws, { defval: "" });

            const processed: ImportRow[] = jsonData.map((row: any) => {
                try {
                    // Validasi Dasar
                    if (!row["Merek"] || !row["Model"] || !row["Varian"]) {
                        return { status: "error", message: "Merek, Model, dan Varian wajib diisi", raw: row };
                    }

                    // Construct Variant Object
                    const variant: VehicleVariant = {
                        id: crypto.randomUUID(),
                        name: row["Varian"],
                        transmission: row["Transmisi"] || "AT",
                        engine_type: row["Type Mesin"] || "Bensin",
                        year_start: Number(row["Tahun Mulai"]) || new Date().getFullYear(),
                        year_end: row["Tahun Selesai"] ? Number(row["Tahun Selesai"]) : undefined,
                        engine_code: row["Kode Mesin"] || "-",
                        specifications: {
                            engine_oil: {
                                viscosity_options: [row["Oli - Viskositas"] || "5W-30"],
                                capacity_liter: Number(row["Oli - Kapasitas (L)"]) || 4,
                                capacity_with_filter_liter: (Number(row["Oli - Kapasitas (L)"]) || 4) + 0.2,
                                quality_standard: row["Oli - Standar (API)"] || "API SP",
                                recommended_brands: row["Oli - Merek Rekomendasi"] ? String(row["Oli - Merek Rekomendasi"]).split(",").map(s => s.trim()) : []
                            },
                            transmission_oil: {
                                type: row["Oli Transmisi - Tipe"] || "-",
                                capacity_liter: Number(row["Oli Transmisi - Kapasitas (L)"]) || 0,
                                recommended_brands: row["Oli Transmisi - Merek Rekomendasi"] ? String(row["Oli Transmisi - Merek Rekomendasi"]).split(",").map(b => b.trim()) : undefined
                            },
                            differential_oil: row["Oli Differential - Tipe"] ? {
                                type: row["Oli Differential - Tipe"],
                                capacity_liter: Number(row["Oli Differential - Kapasitas (L)"]) || 0,
                                recommended_brands: row["Oli Differential - Merek Rekomendasi"] ? String(row["Oli Differential - Merek Rekomendasi"]).split(",").map(b => b.trim()) : undefined
                            } : undefined,

                            parts: [
                                ...(row["Part - Filter Oli"] ? [{ category: "Filter Oli" as const, name: "Oil Filter", part_number: row["Part - Filter Oli"], compatible_brands: row["Part - Filter Oli Merek"] ? String(row["Part - Filter Oli Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Filter Oli Ganti (KM)"]) || undefined }] : []),
                                ...(row["Part - Filter Udara"] ? [{ category: "Filter Udara" as const, name: "Air Filter", part_number: row["Part - Filter Udara"], compatible_brands: row["Part - Filter Udara Merek"] ? String(row["Part - Filter Udara Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Filter Udara Ganti (KM)"]) || undefined }] : []),
                                ...(row["Part - Filter Kabin"] ? [{ category: "Filter Kabin" as const, name: "Cabin Filter", part_number: row["Part - Filter Kabin"], compatible_brands: row["Part - Filter Kabin Merek"] ? String(row["Part - Filter Kabin Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Filter Kabin Ganti (KM)"]) || undefined }] : []),
                                ...(row["Part - Busi"] ? [{ category: "Busi" as const, name: "Spark Plug", part_number: row["Part - Busi"], compatible_brands: row["Part - Busi Merek"] ? String(row["Part - Busi Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Busi Ganti (KM)"]) || undefined }] : []),
                                ...(row["Part - Filter Solar"] ? [{ category: "Filter Solar" as const, name: "Fuel Filter (Solar)", part_number: row["Part - Filter Solar"], compatible_brands: row["Part - Filter Solar Merek"] ? String(row["Part - Filter Solar Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Filter Solar Ganti (KM)"]) || undefined }] : []),
                                ...(row["Part - Filter Bensin"] ? [{ category: "Filter Bensin" as const, name: "Fuel Filter (Bensin)", part_number: row["Part - Filter Bensin"], compatible_brands: row["Part - Filter Bensin Merek"] ? String(row["Part - Filter Bensin Merek"]).split(",").map(b => b.trim()) : undefined, replacement_interval_km: Number(row["Part - Filter Bensin Ganti (KM)"]) || undefined }] : []),
                            ],
                            tires: row["Ban - Ukuran"] ? [{
                                location: "Depan & Belakang",
                                size: row["Ban - Ukuran"],
                                pressure_psi_front: Number(row["Ban - Tekanan Depan (PSI)"]) || 32,
                                pressure_psi_rear: Number(row["Ban - Tekanan Belakang (PSI)"]) || 32,
                                recommended_brands: row["Ban - Merek"] ? String(row["Ban - Merek"]).split(",").map(b => b.trim()) : []
                            }] : [],
                            battery: row["Aki - Tipe"] ? {
                                type: row["Aki - Tipe"],
                                model: row["Aki - Model"] || "",
                                ampere: Number(row["Aki - Ampere"]) || 45,
                                voltage: Number(row["Aki - Voltage"]) || 12,
                                dimensions: row["Aki - Dimensi"] || ""
                            } : undefined,
                            brakes: row["Rem - Tipe Depan"] ? {
                                front_type: row["Rem - Tipe Depan"],
                                rear_type: row["Rem - Tipe Belakang"] || "",
                                fluid_type: row["Rem - Minyak"] || "",
                                pad_part_number_front: row["Rem - Kampas Depan (Part No)"] || "",
                                shoe_part_number_rear: row["Rem - Kampas Belakang (Part No)"] || "",
                                recommended_brands_front: row["Rem - Merek Depan"] ? String(row["Rem - Merek Depan"]).split(",").map((b: string) => b.trim()) : undefined,
                                recommended_brands_rear: row["Rem - Merek Belakang"] ? String(row["Rem - Merek Belakang"]).split(",").map((b: string) => b.trim()) : undefined
                            } : undefined,
                            suspension: row["Kaki - Shock Depan"] ? {
                                shock_absorber_front: row["Kaki - Shock Depan"],
                                shock_absorber_front_brands: row["Kaki - Shock Depan Merek"] ? String(row["Kaki - Shock Depan Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                shock_absorber_rear: row["Kaki - Shock Belakang"] || "",
                                shock_absorber_rear_brands: row["Kaki - Shock Belakang Merek"] ? String(row["Kaki - Shock Belakang Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                rack_end: row["Kaki - Rack End"] || "",
                                rack_end_brands: row["Kaki - Rack End Merek"] ? String(row["Kaki - Rack End Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                tie_rod_end: row["Kaki - Tie Rod"] || "",
                                tie_rod_end_brands: row["Kaki - Tie Rod Merek"] ? String(row["Kaki - Tie Rod Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                link_stabilizer: row["Kaki - Link Stabilizer"] || "",
                                link_stabilizer_brands: row["Kaki - Link Stabilizer Merek"] ? String(row["Kaki - Link Stabilizer Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                lower_arm: row["Kaki - Lower Arm"] || "",
                                lower_arm_brands: row["Kaki - Lower Arm Merek"] ? String(row["Kaki - Lower Arm Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                upper_arm: row["Kaki - Upper Arm"] || "",
                                upper_arm_brands: row["Kaki - Upper Arm Merek"] ? String(row["Kaki - Upper Arm Merek"]).split(",").map((b: string) => b.trim()) : undefined,
                                upper_support: row["Kaki - Upper Support"] || "",
                                upper_support_brands: row["Kaki - Upper Support Merek"] ? String(row["Kaki - Upper Support Merek"]).split(",").map((b: string) => b.trim()) : undefined
                            } : undefined
                        }
                    };

                    return {
                        status: "valid",
                        data: {
                            brand: row["Merek"],
                            model: row["Model"],
                            variant
                        },
                        raw: row
                    };
                } catch (e) {
                    return { status: "error", message: "Gagal memproses baris", raw: row };
                }
            });

            setPreviewData(processed);
        } catch (e) {
            toast({ title: "Error", description: "Gagal membaca file Excel", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = () => {
        const validData = previewData
            .filter(r => r.status === "valid" && r.data)
            .map(r => r.data!);

        if (validData.length === 0) {
            toast({ title: "Warning", description: "Tidak ada data valid untuk diimport", variant: "destructive" });
            return;
        }

        onImport(validData);
        toast({ title: "Sukses", description: `Berhasil mengimport ${validData.length} data kendaraan` });
        setOpen(false);
        setPreviewData([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Import Data Buku Pintar</DialogTitle>
                    <DialogDescription>
                        Import data kendaraan dari file Excel. Gunakan template yang disediakan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={handleDownloadTemplate} size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                        </Button>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) processFile(file);
                                }}
                            />
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload File Excel
                            </Button>
                        </div>
                    </div>

                    {previewData.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Preview Data ({previewData.length} baris)</span>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {previewData.filter(d => d.status === "valid").length} Valid</span>
                                    <span className="text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {previewData.filter(d => d.status === "error").length} Error</span>
                                </div>
                            </div>

                            <ScrollArea className="h-[300px] border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Status</TableHead>
                                            <TableHead>Merek</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Varian</TableHead>
                                            <TableHead>Tahun</TableHead>
                                            <TableHead>Pesan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((row, idx) => (
                                            <TableRow key={idx} className={row.status === 'error' ? 'bg-red-50' : ''}>
                                                <TableCell>
                                                    {row.status === 'valid'
                                                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                                                        : <AlertCircle className="w-4 h-4 text-red-500" />
                                                    }
                                                </TableCell>
                                                <TableCell>{row.raw["Merek"]}</TableCell>
                                                <TableCell>{row.raw["Model"]}</TableCell>
                                                <TableCell>{row.raw["Varian"]}</TableCell>
                                                <TableCell>{row.raw["Tahun Mulai"]}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {row.message}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleImport} disabled={previewData.filter(d => d.status === "valid").length === 0}>
                        Import {previewData.filter(d => d.status === "valid").length} Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

