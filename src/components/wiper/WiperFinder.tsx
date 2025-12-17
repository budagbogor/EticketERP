import { useMemo, useState } from "react";
import { Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useWiperData } from "@/contexts/WiperDataContext";
import { useDeleteWiperSpecification } from "@/hooks/useWiperData";
import { EditWiperDataDialog } from "@/components/wiper/EditWiperDataDialog";
import type { VehicleWiperSpec } from "@/data/wiperData";

interface SelectionState {
    brand: string;
    model: string;
    year: string;
}

const initialSelection: SelectionState = {
    brand: "",
    model: "",
    year: "",
};

export const WiperFinder = () => {
    const [selection, setSelection] = useState<SelectionState>(initialSelection);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editData, setEditData] = useState<VehicleWiperSpec | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const { data, getBrands, getModelsByBrand, getYearsForBrandModel, findWiperSpec } = useWiperData();
    const deleteMutation = useDeleteWiperSpecification();

    const brands = useMemo(() => getBrands(), [getBrands]);
    const models = useMemo(() => (selection.brand ? getModelsByBrand(selection.brand) : []), [selection.brand, getModelsByBrand]);
    const years = useMemo(
        () => (selection.brand && selection.model ? getYearsForBrandModel(selection.brand, selection.model) : []),
        [selection.brand, selection.model, getYearsForBrandModel],
    );

    const selectedSpec: VehicleWiperSpec | undefined = useMemo(() => {
        if (!selection.brand || !selection.model || !selection.year) return undefined;
        return findWiperSpec(selection.brand, selection.model, Number(selection.year));
    }, [selection.brand, selection.model, selection.year, findWiperSpec]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return data;
        const term = search.toLowerCase();
        return data.filter((item) =>
            [item.merek, item.model, String(item.tahunMulai), String(item.tahunSelesai ?? "")]
                .join(" ")
                .toLowerCase()
                .includes(term),
        );
    }, [search, data]);

    const handleReset = () => {
        setSelection(initialSelection);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSuccess: () => {
                    setDeleteId(null);
                },
            });
        }
    };

    return (
        <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-6 md:px-6">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)] items-start">
                <Card className="bg-gradient-to-b from-primary/5 to-background border-border/80 shadow-sm">
                    <CardHeader className="space-y-1">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground/90">
                            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <Search className="size-3.5" />
                            </span>
                            Pilih mobil, kami hitungkan ukuran wiper.
                        </div>
                        <CardTitle className="mt-4 text-lg">
                            Pilih kendaraan untuk melihat ukuran wiper yang direkomendasikan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Merek</Label>
                                <Select
                                    value={selection.brand}
                                    onValueChange={(value) =>
                                        setSelection({ brand: value, model: "", year: "" })
                                    }
                                >
                                    <SelectTrigger id="brand">
                                        <SelectValue placeholder="Pilih merek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand} value={brand}>
                                                {brand}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Select
                                    value={selection.model}
                                    onValueChange={(value) => setSelection((prev) => ({ ...prev, model: value, year: "" }))}
                                    disabled={!selection.brand}
                                >
                                    <SelectTrigger id="model">
                                        <SelectValue placeholder={selection.brand ? "Pilih model" : "Pilih merek dulu"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((model) => (
                                            <SelectItem key={model} value={model}>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Tahun</Label>
                                <Select
                                    value={selection.year}
                                    onValueChange={(value) => setSelection((prev) => ({ ...prev, year: value }))}
                                    disabled={!selection.brand || !selection.model}
                                >
                                    <SelectTrigger id="year">
                                        <SelectValue placeholder={selection.model ? "Pilih tahun" : "Pilih model dulu"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={String(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="default" size="lg" disabled={!selectedSpec} className="px-6">
                                {selectedSpec ? "Ukuran wiper ditemukan" : "Lengkapi pilihan untuk melihat ukuran"}
                            </Button>

                            <Button variant="ghost" size="sm" type="button" onClick={handleReset}>
                                Reset pilihan
                            </Button>

                        </div>

                        <div className="mt-2 rounded-xl border border-dashed border-border/70 bg-secondary/40 p-4 text-sm text-muted-foreground">
                            {!selectedSpec && <p>Pilih merek, model, dan tahun kendaraan untuk melihat rekomendasi ukuran wiper.</p>}
                            {selectedSpec && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spesifikasi</span>
                                        <Badge variant="outline" className="border-primary/60 text-primary">
                                            {selectedSpec.merek} {selectedSpec.model}
                                        </Badge>
                                        <Badge variant="secondary">
                                            Tahun {selection.year}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {selectedSpec.wipers.map((wiper) => (
                                            <div
                                                key={wiper.posisi}
                                                className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-primary/5 to-card px-4 py-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/70"
                                            >
                                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                                                    {wiper.posisi === "kiri" && "Wiper kiri (penumpang)"}
                                                    {wiper.posisi === "kanan" && "Wiper kanan (pengemudi)"}
                                                    {wiper.posisi === "belakang" && "Wiper kaca belakang"}
                                                </p>
                                                <p className="mt-1 flex items-baseline gap-1 text-2xl font-semibold">
                                                    {wiper.ukuranInch}
                                                    <span className="text-xs font-normal text-muted-foreground">inci</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedSpec.catatan && (
                                        <p className="text-xs text-muted-foreground/80">Catatan: {selectedSpec.catatan}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/80 bg-gradient-to-b from-primary/5 to-background">
                    <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center justify-between text-lg">
                            <span>Database cepat di bengkel</span>
                            <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-[0.18em]">
                                Mode tabel
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan merek / model / tahun"
                                className="pl-9"
                            />
                        </div>

                        <div className="max-h-[340px] overflow-y-auto rounded-xl border border-border/70 bg-card/80">
                            <table className="min-w-full text-left text-xs">
                                <thead className="sticky top-0 bg-secondary/90 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                    <tr>
                                        <th className="px-3 py-2">Merek &amp; model</th>
                                        <th className="px-3 py-2">Tahun</th>
                                        <th className="px-3 py-2">Depan (kiri/kanan)</th>
                                        <th className="px-3 py-2">Belakang</th>
                                        <th className="px-3 py-2 w-[60px]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row) => {
                                        const tahunLabel = row.tahunSelesai
                                            ? `${row.tahunMulai}–${row.tahunSelesai}`
                                            : `${row.tahunMulai}→`;
                                        const kiri = row.wipers.find((w) => w.posisi === "kiri");
                                        const kanan = row.wipers.find((w) => w.posisi === "kanan");
                                        const belakang = row.wipers.find((w) => w.posisi === "belakang");

                                        return (
                                            <tr key={row.id} className="border-t border-border/60 text-[13px]">
                                                <td className="px-3 py-2 align-top">
                                                    <div className="font-medium">
                                                        {row.merek} {row.model}
                                                    </div>
                                                    {row.catatan && (
                                                        <div className="mt-0.5 text-[11px] text-muted-foreground/80">{row.catatan}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 align-top text-muted-foreground">{tahunLabel}</td>
                                                <td className="px-3 py-2 align-top">
                                                    {kiri || kanan ? (
                                                        <span>
                                                            {kiri?.ukuranInch ?? "-"}
                                                            <span className="text-[11px] text-muted-foreground">"</span> / {kanan?.ukuranInch ?? "-"}
                                                            <span className="text-[11px] text-muted-foreground">"</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/70">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 align-top">
                                                    {belakang ? (
                                                        <span>
                                                            {belakang.ukuranInch}
                                                            <span className="text-[11px] text-muted-foreground">"</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/70">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 align-top">
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                                            onClick={() => {
                                                                setEditData(row);
                                                                setEditOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteId(row.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-10 text-center text-xs text-muted-foreground/80"
                                            >
                                                Belum ada data yang cocok dengan kata kunci tersebut. Coba kata kunci lain atau tambah data di
                                                backend nanti.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditWiperDataDialog data={editData} open={editOpen} onOpenChange={setEditOpen} />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Wiper?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data wiper ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
};
