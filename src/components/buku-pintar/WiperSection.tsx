import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind } from "lucide-react";

interface WiperSectionProps {
    wiper?: {
        driver?: string;
        passenger?: string;
        rear?: string;
    };
}

export function WiperSection({ wiper }: WiperSectionProps) {
    if (!wiper || (!wiper.driver && !wiper.passenger && !wiper.rear)) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Wind className="w-5 h-5 text-sky-500" />
                    <CardTitle className="text-lg">Data Wiper</CardTitle>
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
                <Wind className="w-5 h-5 text-sky-500" />
                <CardTitle className="text-lg">Data Wiper</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wiper.driver && (
                        <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground text-sm">Wiper Depan Kanan (Driver)</span>
                            <span className="font-medium text-lg">{wiper.driver}</span>
                        </div>
                    )}

                    {wiper.passenger && (
                        <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground text-sm">Wiper Depan Kiri (Passenger)</span>
                            <span className="font-medium text-lg">{wiper.passenger}</span>
                        </div>
                    )}

                    {wiper.rear && (
                        <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground text-sm">Wiper Belakang</span>
                            <span className="font-medium text-lg">{wiper.rear}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
