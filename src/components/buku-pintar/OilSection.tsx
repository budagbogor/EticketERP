import { EngineOilSpec, FluidSpec } from "@/types/buku-pintar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Thermometer } from "lucide-react";

interface OilSectionProps {
    engineOil: EngineOilSpec;
    transmissionOil: FluidSpec;
    differentialOil?: FluidSpec;
    brakeOil?: FluidSpec;
    radiatorCoolant?: FluidSpec;
    acFreon?: FluidSpec;
}

export function OilSection({
    engineOil,
    transmissionOil,
    differentialOil,
    brakeOil,
    radiatorCoolant,
    acFreon
}: OilSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Droplet className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg">Oli Mesin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Viskositas:</span>
                        <span className="font-medium">{engineOil.viscosity_options?.join(" / ") || "-"}</span>

                        <span className="text-muted-foreground">Kapasitas (Tanpa Filter):</span>
                        <span className="font-medium">
                            {engineOil.capacity || (engineOil.capacity_liter ? `${engineOil.capacity_liter} Liter` : "-")}
                        </span>

                        <span className="text-muted-foreground">Kapasitas (Ganti Filter):</span>
                        <span className="font-medium">
                            {engineOil.capacity_with_filter_liter ? `${engineOil.capacity_with_filter_liter} Liter` : "-"}
                        </span>

                        <span className="text-muted-foreground">Standar Kualitas:</span>
                        <span className="font-medium">{engineOil.quality_standard || "-"}</span>

                        {engineOil.replacement_interval_km && (
                            <>
                                <span className="text-muted-foreground">Interval Ganti:</span>
                                <span className="font-medium">{engineOil.replacement_interval_km.toLocaleString()} KM</span>
                            </>
                        )}
                    </div>

                    {engineOil.recommended_brands && engineOil.recommended_brands.length > 0 && (
                        <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {engineOil.recommended_brands.map((brand, idx) => (
                                    <span key={idx} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full dark:bg-amber-900 dark:text-amber-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">Oli Transmisi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                        <span className="font-medium">{transmissionOil?.type || "-"}</span>

                        <span className="text-muted-foreground">Kapasitas:</span>
                        <span className="font-medium">
                            {transmissionOil?.capacity || (transmissionOil?.capacity_liter ? `${transmissionOil.capacity_liter} Liter` : "-")}
                        </span>

                        {transmissionOil?.replacement_interval_km && (
                            <>
                                <span className="text-muted-foreground">Interval Ganti:</span>
                                <span className="font-medium">{transmissionOil.replacement_interval_km.toLocaleString()} KM</span>
                            </>
                        )}
                    </div>

                    {transmissionOil?.recommended_brands && transmissionOil.recommended_brands.length > 0 && (
                        <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                            <div className="flex flex-wrap gap-2">
                                {transmissionOil.recommended_brands.map((brand, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-100">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {differentialOil && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-emerald-500" />
                        <CardTitle className="text-lg">Oli Gardan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{differentialOil.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">
                                {differentialOil.capacity || (differentialOil.capacity_liter ? `${differentialOil.capacity_liter} Liter` : "-")}
                            </span>

                            {differentialOil.replacement_interval_km && (
                                <>
                                    <span className="text-muted-foreground">Interval Ganti:</span>
                                    <span className="font-medium">{differentialOil.replacement_interval_km.toLocaleString()} KM</span>
                                </>
                            )}
                        </div>

                        {differentialOil.recommended_brands && differentialOil.recommended_brands.length > 0 && (
                            <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground block mb-2">Rekomendasi Merek:</span>
                                <div className="flex flex-wrap gap-2">
                                    {differentialOil.recommended_brands.map((brand, idx) => (
                                        <span key={idx} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full dark:bg-emerald-900 dark:text-emerald-100">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}



            {brakeOil && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-yellow-500" />
                        <CardTitle className="text-lg">Minyak Rem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{brakeOil.type || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {radiatorCoolant && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Droplet className="w-5 h-5 text-cyan-500" />
                        <CardTitle className="text-lg">Radiator Coolant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{radiatorCoolant.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">
                                {radiatorCoolant.capacity || (radiatorCoolant.capacity_liter ? `${radiatorCoolant.capacity_liter} Liter` : "-")}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {acFreon && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Thermometer className="w-5 h-5 text-sky-500" />
                        <CardTitle className="text-lg">AC Freon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Tipe / Spesifikasi:</span>
                            <span className="font-medium">{acFreon.type || "-"}</span>

                            <span className="text-muted-foreground">Kapasitas:</span>
                            <span className="font-medium">
                                {acFreon.capacity || (acFreon.capacity_liter ? `${acFreon.capacity_liter} Liter` : "-")}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
