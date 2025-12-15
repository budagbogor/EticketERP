import { BrakeSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc } from "lucide-react";

interface BrakeSectionProps {
    brakes?: BrakeSpec;
}

export function BrakeSection({ brakes }: BrakeSectionProps) {
    if (!brakes) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Disc className="w-5 h-5 text-red-500" />
                <CardTitle className="text-lg">Sistem Pengereman</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border-r border-border pr-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Depan</h4>
                        <div className="flex justify-between">
                            <span>Tipe</span>
                            <span className="font-medium">{brakes.front_type}</span>
                        </div>
                        {brakes.pad_part_number_front && (
                            <div className="flex justify-between">
                                <span>Part Number Kampas</span>
                                <span className="font-mono text-sm">{brakes.pad_part_number_front}</span>
                            </div>
                        )}
                        {brakes.recommended_brands_front && brakes.recommended_brands_front.length > 0 && (
                            <div className="flex justify-between">
                                <span>Rekomendasi Merek</span>
                                <span className="font-medium text-primary text-right">{brakes.recommended_brands_front.join(", ")}</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Belakang</h4>
                        <div className="flex justify-between">
                            <span>Tipe</span>
                            <span className="font-medium">{brakes.rear_type}</span>
                        </div>
                        {brakes.shoe_part_number_rear && (
                            <div className="flex justify-between">
                                <span>Part Number Kampas/Shoe</span>
                                <span className="font-mono text-sm">{brakes.shoe_part_number_rear}</span>
                            </div>
                        )}
                        {brakes.recommended_brands_rear && brakes.recommended_brands_rear.length > 0 && (
                            <div className="flex justify-between">
                                <span>Rekomendasi Merek</span>
                                <span className="font-medium text-primary text-right">{brakes.recommended_brands_rear.join(", ")}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center bg-muted/20 p-2 rounded">
                    <span className="text-sm font-medium">Minyak Rem Rekomendasi</span>
                    <span className="font-bold text-primary">{brakes.fluid_type}</span>
                </div>
            </CardContent>
        </Card>
    );
}
