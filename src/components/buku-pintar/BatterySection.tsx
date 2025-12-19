import { BatterySpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";

interface BatterySectionProps {
    battery?: BatterySpec;
}

export function BatterySection({ battery }: BatterySectionProps) {
    if (!battery) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">Spesifikasi Aki (Battery)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <span className="text-muted-foreground text-sm block">Tipe Aki</span>
                            <span className="font-semibold text-lg">{battery.type}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm block">Model</span>
                            <span className="font-bold text-3xl text-green-600 dark:text-green-400">{battery.model}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-muted-foreground text-sm block">Kapasitas / Tegangan</span>
                            <span className="font-semibold text-lg">{battery.ampere} Ah / {battery.voltage} V</span>
                        </div>
                        {battery.dimensions && (
                            <div>
                                <span className="text-muted-foreground text-sm block">Dimensi</span>
                                <span className="text-sm">{battery.dimensions}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
