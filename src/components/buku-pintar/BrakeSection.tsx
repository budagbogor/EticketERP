import { BrakeSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc } from "lucide-react";

interface BrakeSectionProps {
    brakes?: BrakeSpec & {
        // Legacy support
        front_pad?: string;
        rear_pad?: string;
        front_disc?: string;
        rear_disc?: string;
    };
}

export function BrakeSection({ brakes }: BrakeSectionProps) {
    if (!brakes) return null;

    // Helper to get value preferring new spec then legacy
    const frontPad = brakes.pad_part_number_front || brakes.front_pad;
    const rearPad = brakes.shoe_part_number_rear || brakes.rear_pad;
    const frontDisc = brakes.front_type || brakes.front_disc; // Note: type vs disc mapping might vary, assuming equivalent
    const rearDisc = brakes.rear_type || brakes.rear_disc;

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

                        {frontPad && (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span>Kampas Rem Depan</span>
                                    <span className="font-mono text-sm">{frontPad}</span>
                                </div>
                                {brakes.recommended_brands_front && brakes.recommended_brands_front.length > 0 && (
                                    <div className="flex justify-end gap-1 mt-1">
                                        {brakes.recommended_brands_front.map((brand, idx) => (
                                            <span key={idx} className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                {brand}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {frontDisc && (
                            <div className="flex justify-between">
                                <span>Piringan Cakram Depan</span>
                                <span className="font-mono text-sm">{frontDisc}</span>
                            </div>
                        )}

                        {!frontPad && !frontDisc && (
                            <div className="text-muted-foreground text-sm italic">Data depan belum tersedia</div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Belakang</h4>

                        {rearPad && (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span>Kampas Rem Belakang</span>
                                    <span className="font-mono text-sm">{rearPad}</span>
                                </div>
                                {brakes.recommended_brands_rear && brakes.recommended_brands_rear.length > 0 && (
                                    <div className="flex justify-end gap-1 mt-1">
                                        {brakes.recommended_brands_rear.map((brand, idx) => (
                                            <span key={idx} className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                {brand}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {rearDisc && (
                            <div className="flex justify-between">
                                <span>Piringan/Tromol Belakang</span>
                                <span className="font-mono text-sm">{rearDisc}</span>
                            </div>
                        )}

                        {!rearPad && !rearDisc && (
                            <div className="text-muted-foreground text-sm italic">Data belakang belum tersedia</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
