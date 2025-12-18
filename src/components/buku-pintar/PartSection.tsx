import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface PartSectionProps {
    wiper?: {
        driver?: string;
        passenger?: string;
        rear?: string;
    };
    filters?: {
        spark_plug?: string;
        air_filter?: string;
        cabin_filter?: string;
        fuel_filter?: string;
        oil_filter?: string;
    };
}

export function PartSection({ wiper, filters }: PartSectionProps) {
    if (!wiper && !filters) return null;

    const partItems = [
        // Wiper
        ...(wiper?.driver ? [{ category: "Wiper", name: "Wiper Depan (Driver)", value: wiper.driver }] : []),
        ...(wiper?.passenger ? [{ category: "Wiper", name: "Wiper Depan (Penumpang)", value: wiper.passenger }] : []),
        ...(wiper?.rear ? [{ category: "Wiper", name: "Wiper Belakang", value: wiper.rear }] : []),

        // Filters
        ...(filters?.oil_filter ? [{ category: "Filter", name: "Filter Oli", value: filters.oil_filter }] : []),
        ...(filters?.air_filter ? [{ category: "Filter", name: "Filter Udara", value: filters.air_filter }] : []),
        ...(filters?.cabin_filter ? [{ category: "Filter", name: "Filter Kabin (AC)", value: filters.cabin_filter }] : []),
        ...(filters?.fuel_filter ? [{ category: "Filter", name: "Filter Bensin/Solar", value: filters.fuel_filter }] : []),
        ...(filters?.spark_plug ? [{ category: "Busi", name: "Busi", value: filters.spark_plug }] : []),
    ];

    if (partItems.length === 0) {
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
                                <th className="text-left font-medium py-3 text-muted-foreground">Kategori</th>
                                <th className="text-left font-medium py-3 text-muted-foreground">Nama Part</th>
                                <th className="text-right font-medium py-3 text-muted-foreground">Spesifikasi / Kode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {partItems.map((part, idx) => (
                                <tr key={idx} className="hover:bg-muted/50">
                                    <td className="py-3 font-medium">{part.category}</td>
                                    <td className="py-3">{part.name}</td>
                                    <td className="py-3 text-right font-mono text-primary">{part.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
