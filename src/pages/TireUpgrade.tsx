import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TireSizeInput } from "@/components/tire-upgrade/TireSizeInput";
import { DrivingConditionSelector } from "@/components/tire-upgrade/DrivingConditionSelector";
import { RecommendationCard } from "@/components/tire-upgrade/RecommendationCard";
import {
    parseTireSize,
    generateRecommendations,
    calculateOverallDiameter,
    TireSize,
    TireRecommendation,
} from "@/lib/tireCalculations";
import { Calculator as CalculatorIcon, RotateCcw, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { tireService } from "@/services/tireService";

export default function TireUpgrade() {
    const { toast } = useToast();
    const [tireSize, setTireSize] = useState("");
    const [carModel, setCarModel] = useState("");
    const [conditions, setConditions] = useState<string[]>([]);
    const [error, setError] = useState("");

    // Fetch Data from Supabase
    const { data: products = [] } = useQuery({
        queryKey: ['tire-products'],
        queryFn: tireService.getProducts,
    });

    const [results, setResults] = useState<{
        original: TireSize;
        originalDiameter: number;
        recommendations: TireRecommendation[];
    } | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = async () => {
        setError("");

        if (!tireSize.trim()) {
            setError("Masukkan ukuran ban terlebih dahulu");
            return;
        }

        const parsed = parseTireSize(tireSize);
        if (!parsed) {
            setError("Format ukuran ban tidak valid. Contoh: 205/55R16");
            return;
        }

        setIsCalculating(true);

        // Simulate calculation delay for UX
        await new Promise((resolve) => setTimeout(resolve, 800));

        const originalDiameter = calculateOverallDiameter(parsed);
        const recommendations = generateRecommendations(parsed, conditions);

        setResults({
            original: parsed,
            originalDiameter,
            recommendations,
        });

        setIsCalculating(false);

        if (recommendations.length === 0) {
            toast({
                title: "Tidak ada rekomendasi",
                description: "Ukuran ban Anda sudah optimal atau tidak ada upgrade yang aman.",
                variant: "destructive",
            });
        }
    };

    const handleReset = () => {
        setTireSize("");
        setCarModel("");
        setConditions([]);
        setError("");
        setResults(null);
    };

    const handleShare = async () => {
        if (!results) return;

        const text = `Rekomendasi Upgrade Ban dari ${tireSize}:\n${results.recommendations
            .slice(0, 3)
            .map((r) => `• ${r.size} (${r.type})`)
            .join("\n")}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Rekomendasi Upgrade Ban",
                    text,
                });
            } catch {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(text);
            toast({
                title: "Disalin!",
                description: "Hasil rekomendasi telah disalin ke clipboard.",
            });
        }
    };

    return (
        <div className="flex flex-col space-y-8">
            {/* Page Header */}
            <div className="text-center">
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                    KALKULATOR <span className="text-primary">UPGRADE BAN</span>
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Masukkan ukuran ban original Anda untuk mendapatkan rekomendasi
                    upgrade yang aman dan optimal.
                </p>
            </div>

            {/* Calculator Form */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="rounded-2xl border border-border p-6 md:p-8 shadow-sm bg-card">
                    <div className="space-y-6">
                        <TireSizeInput
                            value={tireSize}
                            onChange={setTireSize}
                            error={error}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="car-model" className="text-base font-semibold">
                                Model Mobil (Opsional)
                            </Label>
                            <Input
                                id="car-model"
                                placeholder="Contoh: Toyota Avanza 2022"
                                value={carModel}
                                onChange={(e) => setCarModel(e.target.value)}
                                className="h-12 bg-secondary border-border"
                            />
                        </div>

                        <DrivingConditionSelector
                            selected={conditions}
                            onChange={setConditions}
                        />

                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleCalculate}
                            disabled={isCalculating}
                        >
                            {isCalculating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                                    Menghitung...
                                </>
                            ) : (
                                <>
                                    <CalculatorIcon className="mr-2 h-4 w-4" />
                                    Hitung Rekomendasi
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {results && results.recommendations.length > 0 && (
                <div className="animate-fade-in w-full">
                    {/* Results Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="font-display text-2xl md:text-3xl text-foreground">
                                REKOMENDASI UNTUK{" "}
                                <span className="text-primary">{tireSize}</span>
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Diameter original: {results.originalDiameter.toFixed(1)}mm •{" "}
                                {results.recommendations.length} opsi ditemukan
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleReset}>
                                <RotateCcw size={16} className="mr-2" />
                                Hitung Ulang
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 size={16} className="mr-2" />
                                Bagikan
                            </Button>
                        </div>
                    </div>

                    {/* Recommendation Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.recommendations.map((rec, index) => (
                            <RecommendationCard
                                key={rec.size}
                                recommendation={rec}
                                originalSize={results.original}
                                originalDiameter={results.originalDiameter}
                                index={index}
                                products={products}
                            />
                        ))}
                    </div>

                    {/* Safety Notice */}
                    <div className="mt-8 p-4 rounded-lg bg-yellow-100 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30 text-center">
                        <p className="text-sm text-yellow-800 dark:text-yellow-500">
                            ⚠️ Selalu konsultasikan dengan mekanik profesional sebelum
                            melakukan upgrade ban. Pastikan ban baru tidak bergesekan dengan
                            fender atau suspensi.
                        </p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {results && results.recommendations.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Tidak ada rekomendasi upgrade yang aman untuk ukuran ban ini.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={handleReset}>
                        <RotateCcw size={16} className="mr-2" />
                        Coba Ukuran Lain
                    </Button>
                </div>
            )}
        </div>
    );
}
