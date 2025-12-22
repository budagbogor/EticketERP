import { RecommendedPart } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface PartSectionProps {
    parts?: RecommendedPart[];
    // Legacy support (optional, can be removed if strictly migrating)
    wiper?: any;
    filters?: any;
}

export function PartSection({ parts, wiper, filters }: PartSectionProps) {
    // Merge legacy props into parts array if parts is missing/empty but legacy exists
    let displayParts: (RecommendedPart & { value?: string })[] = parts || [];

    if (displayParts.length === 0 && (wiper || filters)) {
        displayParts = [
            ...(wiper?.driver ? [{ category: "Wiper" as const, name: "Wiper Depan (Driver)", part_number: wiper.driver }] : []),
            ...(wiper?.passenger ? [{ category: "Wiper" as const, name: "Wiper Depan (Penumpang)", part_number: wiper.passenger }] : []),
            ...(wiper?.rear ? [{ category: "Wiper" as const, name: "Wiper Belakang", part_number: wiper.rear }] : []),
            ...(filters?.oil_filter ? [{ category: "Filter Oli" as const, name: "Filter Oli", part_number: filters.oil_filter }] : []),
            ...(filters?.air_filter ? [{ category: "Filter Udara" as const, name: "Filter Udara", part_number: filters.air_filter }] : []),
            ...(filters?.cabin_filter ? [{ category: "Filter Kabin" as const, name: "Filter Kabin (AC)", part_number: filters.cabin_filter }] : []),
            ...(filters?.fuel_filter ? [{ category: "Filter Bensin" as const, name: "Filter Bensin/Solar", part_number: filters.fuel_filter }] : []),
            ...(filters?.spark_plug ? [{ category: "Busi" as const, name: "Busi", part_number: filters.spark_plug }] : []),
        ];
    }

    if (displayParts.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Wrench className="w-5 h-5 text-gray-500" />
                    <CardTitle className="text-lg">Data Suku Cadang</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-4">Data belum tersedia</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Wrench className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Data Suku Cadang</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left font-medium py-3 text-muted-foreground w-1/3">Nama Part</th>
                                <th className="text-right font-medium py-3 text-muted-foreground w-1/3">Kode / Spesifikasi</th>
                                <th className="text-right font-medium py-3 text-muted-foreground w-1/3">Rekomendasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {displayParts.map((part, idx) => (
                                <tr key={idx} className="hover:bg-muted/50">
                                    <td className="py-3 font-medium">{part.category}</td>
                                    <td className="py-3 text-right font-mono text-primary">{part.part_number || part.value || "-"}</td>
                                    <td className="py-3 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            {part.replacement_interval_km && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap mb-1">
                                                    {part.replacement_interval_km.toLocaleString()} KM
                                                </span>
                                            )}
                                            {part.compatible_brands && part.compatible_brands.length > 0 ? (
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    {part.compatible_brands.map((brand, bIdx) => (
                                                        <span key={bIdx} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                                                            {brand}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                !part.replacement_interval_km && <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper for Legacy support where 'value' property was used instead of 'part_number'
// We handle it by checking part.part_number || part.value
