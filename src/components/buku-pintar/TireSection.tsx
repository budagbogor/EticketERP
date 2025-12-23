import { TireSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

interface TireSectionProps {
    tire?: {
        front_size?: string;
        rear_size?: string;
        front_pressure?: string;
        rear_pressure?: string;
        load_speed_index?: string;
        recommended_brands?: string[];
    };
    tires?: TireSpec[]; // Legacy support
}

// Helper function to extract brand from tire size string
function extractBrandFromSize(sizeString: string): { size: string; brand?: string } {
    if (!sizeString) return { size: "" };

    // Match pattern like "175/65 R14 (Dunlop)" or "185/65 R15 (Bridgestone)"
    const match = sizeString.match(/^(.+?)\s*\(([^)]+)\)\s*$/);

    if (match) {
        return {
            size: match[1].trim(),
            brand: match[2].trim()
        };
    }

    return { size: sizeString };
}

export function TireSection({ tire, tires }: TireSectionProps) {
    // Legacy array support
    if (tires && tires.length > 0) {
        return (
            <div className="space-y-4">
                {tires.map((t, idx) => {
                    const { size, brand } = extractBrandFromSize(t.size || "");
                    const allBrands = [...(t.recommended_brands || [])];
                    if (brand && !allBrands.includes(brand)) {
                        allBrands.unshift(brand);
                    }

                    return (
                        <Card key={idx}>
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <CircleDot className="w-5 h-5 text-green-600" />
                                <CardTitle className="text-lg">Ban: {t.location}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Ukuran Ban</span>
                                        <span className="font-bold text-lg">{size}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Tekanan Depan</span>
                                        <span className="font-medium">{t.pressure_psi_front} PSI</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Tekanan Belakang</span>
                                        <span className="font-medium">{t.pressure_psi_rear} PSI</span>
                                    </div>
                                    {t.load_speed_index && (
                                        <div>
                                            <span className="text-muted-foreground block">Load Index</span>
                                            <span className="font-medium">{t.load_speed_index}</span>
                                        </div>
                                    )}
                                </div>
                                {allBrands.length > 0 && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {allBrands.map((brand, bIdx) => (
                                                <span key={bIdx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-100">
                                                    {brand}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    }

    if (!tire) return null;

    // New object format support
    // Extract brands from tire sizes
    const frontExtracted = extractBrandFromSize(tire.front_size || "");
    const rearExtracted = extractBrandFromSize(tire.rear_size || "");

    // Merge all brands (from size fields and recommended_brands)
    const allBrands = [...(tire.recommended_brands || [])];
    if (frontExtracted.brand && !allBrands.includes(frontExtracted.brand)) {
        allBrands.unshift(frontExtracted.brand);
    }
    if (rearExtracted.brand && !allBrands.includes(rearExtracted.brand) && rearExtracted.brand !== frontExtracted.brand) {
        allBrands.push(rearExtracted.brand);
    }

    return (
        <div className="space-y-4">
            {/* Front Tire */}
            {(tire.front_size || tire.front_pressure) && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <CircleDot className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">Ban Depan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Ukuran Ban</span>
                                <span className="font-bold text-lg">{frontExtracted.size || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin</span>
                                <span className="font-medium">{tire.front_pressure || "-"}</span>
                            </div>
                            {tire.load_speed_index && (
                                <div>
                                    <span className="text-muted-foreground block">Load & Speed Index</span>
                                    <span className="font-medium">{tire.load_speed_index}</span>
                                </div>
                            )}
                        </div>
                        {allBrands.length > 0 && (
                            <div className="pt-2 border-t mt-2">
                                <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                                <div className="flex flex-wrap gap-2">
                                    {allBrands.map((brand, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-100">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Rear Tire */}
            {(tire.rear_size || tire.rear_pressure) && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <CircleDot className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">Ban Belakang</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Ukuran Ban</span>
                                <span className="font-bold text-lg">{rearExtracted.size || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin</span>
                                <span className="font-medium">{tire.rear_pressure || "-"}</span>
                            </div>
                            {tire.load_speed_index && (
                                <div>
                                    <span className="text-muted-foreground block">Load & Speed Index</span>
                                    <span className="font-medium">{tire.load_speed_index}</span>
                                </div>
                            )}
                        </div>
                        {allBrands.length > 0 && (
                            <div className="pt-2 border-t mt-2">
                                <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                                <div className="flex flex-wrap gap-2">
                                    {allBrands.map((brand, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-100">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {!tire.front_size && !tire.rear_size && !tire.front_pressure && !tire.rear_pressure && (
                <div className="text-center text-muted-foreground py-4">Data belum tersedia</div>
            )}
        </div>
    );
}
