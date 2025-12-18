import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { read, utils } from "xlsx";
import { downloadExcel } from "@/lib/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useImportWiperData } from "@/hooks/useWiperData";
import { TablesInsert } from "@/integrations/supabase/types";

interface ImportRow {
    status: "valid" | "error";
    message?: string;
    data?: {
        specification: TablesInsert<"wiper_specifications">;
        sizes: Omit<TablesInsert<"wiper_sizes">, "specification_id">[];
    };
    raw: any;
}

const TEMPLATE_COLUMNS = [
    "Merek", "Model", "Tahun Mulai", "Tahun Selesai",
    "Ukuran Wiper Kiri (inch)", "Ukuran Wiper Kanan (inch)", "Ukuran Wiper Belakang (inch)",
    "Catatan"
];

export function ImportWiperDataDialog() {
    const [open, setOpen] = useState(false);
    const [previewData, setPreviewData] = useState<ImportRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const importMutation = useImportWiperData();

    const handleDownloadTemplate = () => {
        const wb = utils.book_new();
        const ws = utils.aoa_to_sheet([
            TEMPLATE_COLUMNS,
            ["Toyota", "Avanza", 2012, 2018, 24, 14, 12, "Termasuk Veloz generasi awal"]
        ]);
        utils.book_append_sheet(wb, ws, "Template Wiper");

        toast({
            title: "Mengunduh Template",
            description: "Template Wiper sedang disiapkan...",
        });
        downloadExcel(wb, "Template_Import_Wiper.xlsx");
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
                    if (!row["Merek"] || !row["Model"] || !row["Tahun Mulai"]) {
                        return { status: "error", message: "Merek, Model, dan Tahun Mulai wajib diisi", raw: row };
                    }

                    // Validate wiper sizes
                    const wiperKiri = row["Ukuran Wiper Kiri (inch)"];
                    const wiperKanan = row["Ukuran Wiper Kanan (inch)"];

                    const kiriNum = Number(wiperKiri);
                    const kananNum = Number(wiperKanan);

                    if (!wiperKiri || isNaN(kiriNum) || kiriNum <= 0) {
                        return { status: "error", message: "Ukuran Wiper Kiri wajib diisi dan harus berupa angka lebih dari 0", raw: row };
                    }

                    if (!wiperKanan || isNaN(kananNum) || kananNum <= 0) {
                        return { status: "error", message: "Ukuran Wiper Kanan wajib diisi dan harus berupa angka lebih dari 0", raw: row };
                    }

                    const specification: TablesInsert<"wiper_specifications"> = {
                        brand: row["Merek"],
                        model: row["Model"],
                        year_start: Number(row["Tahun Mulai"]),
                        year_end: row["Tahun Selesai"] ? Number(row["Tahun Selesai"]) : null,
                        notes: row["Catatan"] || null,
                    };

                    const sizes: Omit<TablesInsert<"wiper_sizes">, "specification_id">[] = [
                        {
                            position: "kiri",
                            size_inch: kiriNum,
                            blade_brand: null,
                            part_code: null,
                            stock: null,
                            price: null,
                        },
                        {
                            position: "kanan",
                            size_inch: kananNum,
                            blade_brand: null,
                            part_code: null,
                            stock: null,
                            price: null,
                        },
                    ];

                    const wiperBelakang = row["Ukuran Wiper Belakang (inch)"];
                    if (wiperBelakang) {
                        const belakangNum = Number(wiperBelakang);
                        if (!isNaN(belakangNum) && belakangNum > 0) {
                            sizes.push({
                                position: "belakang",
                                size_inch: belakangNum,
                                blade_brand: null,
                                part_code: null,
                                stock: null,
                                price: null,
                            });
                        }
                    }

                    return {
                        status: "valid",
                        data: { specification, sizes },
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

        importMutation.mutate(validData, {
            onSuccess: () => {
                setOpen(false);
                setPreviewData([]);
            },
        });
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
                    <DialogTitle>Import Data Wiper</DialogTitle>
                    <DialogDescription>
                        Import data wiper dari file Excel. Gunakan template yang disediakan.
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
                    <Button onClick={handleImport} disabled={previewData.filter(d => d.status === "valid").length === 0 || importMutation.isPending}>
                        {importMutation.isPending ? "Mengimport..." : `Import ${previewData.filter(d => d.status === "valid").length} Data`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
