import { SuspensionSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface SuspensionSectionProps {
    suspension?: SuspensionSpec;
}

export function SuspensionSection({ suspension }: SuspensionSectionProps) {
    if (!suspension) return null;

    const parts = [
        { label: "Rack End", value: suspension.rack_end },
        { label: "Tie Rod End", value: suspension.tie_rod_end },
        { label: "Link Stabilizer", value: suspension.link_stabilizer },
        { label: "Lower Arm", value: suspension.lower_arm },
        { label: "Upper Arm", value: suspension.upper_arm },
        { label: "Upper Support", value: suspension.upper_support },
        { label: "Shock Absorber Depan", value: suspension.shock_absorber_front },
        { label: "Shock Absorber Belakang", value: suspension.shock_absorber_rear },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">Data Kaki-Kaki (Suspension)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parts.map((part, idx) => (
                        part.value ? (
                            <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                <span className="text-muted-foreground text-sm">{part.label}</span>
                                <span className="font-medium text-right">{part.value}</span>
                            </div>
                        ) : null
                    ))}
                    {parts.every(p => !p.value) && (
                        <div className="col-span-2 text-center text-muted-foreground py-4">Data belum tersedia</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
