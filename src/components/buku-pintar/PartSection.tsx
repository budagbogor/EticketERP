import { RecommendedPart } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface PartSectionProps {
    parts: RecommendedPart[];
}

export function PartSection({ parts }: PartSectionProps) {
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
                                <th className="text-left font-medium py-3 text-muted-foreground">Kategori</th>
                                <th className="text-left font-medium py-3 text-muted-foreground">Nama Part</th>
                                <th className="text-left font-medium py-3 text-muted-foreground">Nomor Part / Kode</th>
                                <th className="text-left font-medium py-3 text-muted-foreground">Rekomendasi Merek</th>
                                <th className="text-right font-medium py-3 text-muted-foreground">Interval Ganti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {parts.map((part, idx) => (
                                <tr key={idx} className="hover:bg-muted/50">
                                    <td className="py-3 font-medium">{part.category}</td>
                                    <td className="py-3">{part.name}</td>
                                    <td className="py-3 font-mono text-primary">{part.part_number}</td>
                                    <td className="py-3">
                                        {part.compatible_brands && part.compatible_brands.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {part.compatible_brands.map((brand, bIdx) => (
                                                    <span key={bIdx} className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                                        {brand}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right">
                                        {part.replacement_interval_km
                                            ? <span className="text-xs">{part.replacement_interval_km.toLocaleString()} KM</span>
                                            : <span className="text-muted-foreground text-xs">-</span>}
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
