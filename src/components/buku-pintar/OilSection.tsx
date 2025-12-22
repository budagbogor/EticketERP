import { EngineOilSpec, FluidSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Droplet } from "lucide-react";

interface OilSectionProps {
    engineOil: EngineOilSpec;
    transmissionOil: FluidSpec;
    differentialOil?: FluidSpec;
}

export function OilSection({ engineOil, transmissionOil, differentialOil, powerSteeringOil, brakeOil, radiatorCoolant, acFreon }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engine Oil */}
            {engineOil && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-amber-500" />
                        <CardTitle className="text-lg">Oli Mesin</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {engineOil.viscosity_options && (
                                <>
                                    <span className="text-muted-foreground">Viskositas:</span>
                                    <span className="font-medium">{Array.isArray(engineOil.viscosity_options) ? engineOil.viscosity_options.join(" / ") : engineOil.viscosity_options}</span>
                                </>
                            )}

                            {engineOil.capacity_liter && (
                                <>
                                    <span className="text-muted-foreground">Kapasitas (Tanpa Filter):</span>
                                    <span className="font-medium">{engineOil.capacity_liter} Liter</span>
                                </>
                            )}

                            {engineOil.capacity && (
                                <>
                                    <span className="text-muted-foreground">Kapasitas:</span>
                                    <span className="font-medium">{engineOil.capacity}</span>
                                </>
                            )}

                            {engineOil.capacity_with_filter_liter && (
                                <>
                                    <span className="text-muted-foreground">Kapasitas (Ganti Filter):</span>
                                    <span className="font-medium">{engineOil.capacity_with_filter_liter} Liter</span>
                                </>
                            )}

                            {engineOil.quality_standard && (
                                <>
                                    <span className="text-muted-foreground">Standar Kualitas:</span>
                                    <span className="font-medium">{engineOil.quality_standard}</span>
                                </>
                            )}

                            {engineOil.type && (
                                <>
                                    <span className="text-muted-foreground">Tipe:</span>
                                    <span className="font-medium">{engineOil.type}</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                    {engineOil.recommended_brands && (
                        <CardFooter className="flex flex-col items-start pt-4 border-t mx-6 px-0 mt-auto">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {engineOil.recommended_brands.map((brand: string, idx: number) => (
                                    <span key={idx} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full dark:bg-amber-900 dark:text-amber-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Transmission Oil */}
            {transmissionOil && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-lg">Oli Transmisi</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{transmissionOil.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">{transmissionOil.capacity || transmissionOil.capacity_liter ? `${transmissionOil.capacity || transmissionOil.capacity_liter} ${transmissionOil.capacity_liter ? 'Liter' : ''}` : "-"}</span>

                            {transmissionOil.replacement_interval_km && (
                                <>
                                    <span className="text-muted-foreground">Interval Ganti:</span>
                                    <span className="font-medium">{transmissionOil.replacement_interval_km.toLocaleString()} KM</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                    {transmissionOil.recommended_brands && (
                        <CardFooter className="flex flex-col items-start pt-4 border-t mx-6 px-0 mt-auto">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {transmissionOil.recommended_brands.map((brand: string, idx: number) => (
                                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Differential / Gardan Oil */}
            {differentialOil && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-emerald-500" />
                        <CardTitle className="text-lg">Oli Gardan</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{differentialOil.type}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">{differentialOil.capacity || differentialOil.capacity_liter ? `${differentialOil.capacity || differentialOil.capacity_liter} ${differentialOil.capacity_liter ? 'Liter' : ''}` : "-"}</span>
                        </div>
                    </CardContent>
                    {differentialOil.recommended_brands && (
                        <CardFooter className="flex flex-col items-start pt-4 border-t mx-6 px-0 mt-auto">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {differentialOil.recommended_brands.map((brand: string, idx: number) => (
                                    <span key={idx} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full dark:bg-emerald-900 dark:text-emerald-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Power Steering Oil */}
            {powerSteeringOil && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-purple-500" />
                        <CardTitle className="text-lg">Oli Power Steering</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{powerSteeringOil.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">{powerSteeringOil.capacity || powerSteeringOil.capacity_liter ? `${powerSteeringOil.capacity || powerSteeringOil.capacity_liter} ${powerSteeringOil.capacity_liter ? 'Liter' : ''}` : "-"}</span>
                        </div>
                    </CardContent>
                    {powerSteeringOil.recommended_brands && (
                        <CardFooter className="flex flex-col items-start pt-4 border-t mx-6 px-0 mt-auto">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {powerSteeringOil.recommended_brands.map((brand: string, idx: number) => (
                                    <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full dark:bg-purple-900 dark:text-purple-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Brake Oil */}
            {brakeOil && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        <CardTitle className="text-lg">Minyak Rem</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{brakeOil.type || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Radiator Coolant */}
            {radiatorCoolant && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-cyan-500" />
                        <CardTitle className="text-lg">Air Radiator</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{radiatorCoolant.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">{radiatorCoolant.capacity || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* AC Freon */}
            {acFreon && (
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-sky-500" />
                        <CardTitle className="text-lg">Freon AC</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{acFreon.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas / Volume:</span>
                            <span className="font-medium">{acFreon.capacity || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
