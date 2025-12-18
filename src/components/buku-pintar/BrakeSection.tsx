import { BrakeSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc } from "lucide-react";

interface BrakeSectionProps {
    brakes?: {
        front_pad?: string;
        rear_pad?: string;
        front_disc?: string;
        rear_disc?: string;
        // properties matching VehicleVariant.specifications.brake_parts
        [key: string]: any;
    };
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

                        {brakes.front_pad && (
                            <div className="flex justify-between">
                                <span>Kampas Rem Depan</span>
                                <span className="font-mono text-sm">{brakes.front_pad}</span>
                            </div>
                        )}

                        {brakes.front_disc && (
                            <div className="flex justify-between">
                                <span>Piringan Cakram Depan</span>
                                <span className="font-mono text-sm">{brakes.front_disc}</span>
                            </div>
                        )}

                        {!brakes.front_pad && !brakes.front_disc && (
                            <div className="text-muted-foreground text-sm italic">Data depan belum tersedia</div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Belakang</h4>

                        {brakes.rear_pad && (
                            <div className="flex justify-between">
                                <span>Kampas Rem Belakang</span>
                                <span className="font-mono text-sm">{brakes.rear_pad}</span>
                            </div>
                        )}

                        {brakes.rear_disc && (
                            <div className="flex justify-between">
                                <span>Piringan/Tromol Belakang</span>
                                <span className="font-mono text-sm">{brakes.rear_disc}</span>
                            </div>
                        )}

                        {!brakes.rear_pad && !brakes.rear_disc && (
                            <div className="text-muted-foreground text-sm italic">Data belakang belum tersedia</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
