import { TireSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

interface TireSectionProps {
    tires: TireSpec[];
}

export function TireSection({ tires }: TireSectionProps) {
    return (
        <div className="space-y-4">
            {tires.map((tire, idx) => (
                <Card key={idx}>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <CircleDot className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">Ban: {tire.location}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Ukuran Ban</span>
                                <span className="font-bold text-lg">{tire.size}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin Depan</span>
                                <span className="font-medium">{tire.pressure_psi_front} PSI</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin Belakang</span>
                                <span className="font-medium">{tire.pressure_psi_rear} PSI</span>
                            </div>
                            {tire.load_speed_index && (
                                <div>
                                    <span className="text-muted-foreground block">Load & Speed Index</span>
                                    <span className="font-medium">{tire.load_speed_index}</span>
                                </div>
                            )}
                        </div>

                        {tire.recommended_brands && (
                            <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                                <div className="flex flex-wrap gap-2">
                                    {tire.recommended_brands.map((brand, bIdx) => (
                                        <span key={bIdx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-100">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
