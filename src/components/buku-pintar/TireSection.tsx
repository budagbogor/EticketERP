import { TireSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

interface TireSectionProps {
    tire?: {
        front_size?: string;
        rear_size?: string;
        front_pressure?: string;
        rear_pressure?: string;
    };
    tires?: TireSpec[]; // Legacy support
}

export function TireSection({ tire, tires }: TireSectionProps) {
    // Legacy array support
    if (tires && tires.length > 0) {
        return (
            <div className="space-y-4">
                {tires.map((t, idx) => (
                    <Card key={idx}>
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <CircleDot className="w-5 h-5 text-green-600" />
                            <CardTitle className="text-lg">Ban: {t.location}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Ukuran Ban</span>
                                    <span className="font-bold text-lg">{t.size}</span>
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
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!tire) return null;

    // New object format support
    return (
        <div className="space-y-4">
            {/* Front Tire */}
            {(tire.front_size || tire.front_pressure) && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <CircleDot className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">Ban Depan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Ukuran Ban</span>
                                <span className="font-bold text-lg">{tire.front_size || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin</span>
                                <span className="font-medium">{tire.front_pressure || "-"}</span>
                            </div>
                        </div>
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
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Ukuran Ban</span>
                                <span className="font-bold text-lg">{tire.rear_size || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Tekanan Angin</span>
                                <span className="font-medium">{tire.rear_pressure || "-"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!tire.front_size && !tire.rear_size && !tire.front_pressure && !tire.rear_pressure && (
                <div className="text-center text-muted-foreground py-4">Data belum tersedia</div>
            )}
        </div>
    );
}
