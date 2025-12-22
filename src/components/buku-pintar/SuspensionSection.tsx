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
                    {[
                        { label: "Rack End", value: suspension.rack_end, brands: suspension.rack_end_brands },
                        { label: "Tie Rod End", value: suspension.tie_rod_end, brands: suspension.tie_rod_end_brands },
                        { label: "Link Stabilizer", value: suspension.link_stabilizer, brands: suspension.link_stabilizer_brands },
                        { label: "Lower Arm", value: suspension.lower_arm, brands: suspension.lower_arm_brands },
                        { label: "Upper Arm", value: suspension.upper_arm, brands: suspension.upper_arm_brands },
                        { label: "Upper Support", value: suspension.upper_support, brands: suspension.upper_support_brands },
                        { label: "Shock Absorber Depan", value: suspension.shock_absorber_front, brands: suspension.shock_absorber_front_brands },
                        { label: "Shock Absorber Belakang", value: suspension.shock_absorber_rear, brands: suspension.shock_absorber_rear_brands },
                    ].map((part, idx) => {
                        // Helper to parse legacy format "PartNo | Brand" from brands array
                        // If brands contains something like "Part-001 | KYB", we move Part-001 to value
                        let displayValue = part.value;
                        let displayBrands = part.brands || [];

                        if ((!displayValue || displayValue === "-") && displayBrands.length > 0) {
                            const firstBrand = displayBrands[0];
                            if (firstBrand.includes("|")) {
                                const [partNo, brandName] = firstBrand.split("|").map(s => s.trim());
                                displayValue = partNo;
                                // Replace the combined string with just the brand name
                                displayBrands = [brandName, ...displayBrands.slice(1)];
                            }
                        }

                        return (displayValue || (displayBrands && displayBrands.length > 0)) ? (
                            <div key={idx} className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">{part.label}</span>
                                    <span className="font-medium text-right font-mono">{displayValue || "-"}</span>
                                </div>
                                {displayBrands && displayBrands.length > 0 && (
                                    <div className="flex justify-between items-center text-xs pt-1 border-t border-muted-foreground/20 mt-1">
                                        <span className="text-muted-foreground">Rekomendasi</span>
                                        <span className="text-primary font-medium text-right">{displayBrands.join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        ) : null;
                    })}
                    {Object.values(suspension).every(v => !v || (Array.isArray(v) && v.length === 0)) && (
                        <div className="col-span-2 text-center text-muted-foreground py-4">Data belum tersedia</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
