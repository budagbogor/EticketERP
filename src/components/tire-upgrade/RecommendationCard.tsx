import { TireRecommendation, TireSize, getSpeedometerImpact } from "@/lib/tireCalculations";
import { findMatchingProducts, TireProduct, TireBrand } from "@/lib/tireBrands";
import { TireTypeIcon } from "./TireIcon";
import { BrandProductCard } from "./BrandProductCard";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface RecommendationCardProps {
    recommendation: TireRecommendation;
    originalSize: TireSize;
    originalDiameter: number;
    index: number;
    products: Array<TireProduct & { brand: TireBrand }>;
}

export function RecommendationCard({
    recommendation,
    originalSize,
    originalDiameter,
    index,
    products,
}: RecommendationCardProps) {
    const [showBrands, setShowBrands] = useState(false);

    const matchingProducts = findMatchingProducts(
        recommendation.size,
        recommendation.type,
        products
    );

    const safetyColors = {
        safe: "border-success/50 bg-success/5",
        moderate: "border-warning/50 bg-warning/5",
        caution: "border-destructive/50 bg-destructive/5",
    };

    const safetyLabels = {
        safe: { text: "Aman", icon: Check, color: "text-success" },
        moderate: { text: "Moderat", icon: AlertTriangle, color: "text-warning" },
        caution: { text: "Hati-hati", icon: AlertTriangle, color: "text-destructive" },
    };

    const SafetyIcon = safetyLabels[recommendation.safetyLevel].icon;

    return (
        <div
            className={cn(
                "rounded-xl border-2 p-6 gradient-card card-shadow animate-slide-up",
                safetyColors[recommendation.safetyLevel]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <TireTypeIcon typeId={recommendation.typeId} size={40} />
                    <div>
                        <h3 className="font-display text-3xl text-foreground">
                            {recommendation.size}
                        </h3>
                        <p className="text-sm text-muted-foreground">{recommendation.type}</p>
                    </div>
                </div>
                <div
                    className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                        safetyLabels[recommendation.safetyLevel].color,
                        "bg-current/10"
                    )}
                >
                    <SafetyIcon size={16} />
                    {safetyLabels[recommendation.safetyLevel].text}
                </div>
            </div>

            {/* Diameter Info */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Perbedaan Diameter</span>
                    <span
                        className={cn(
                            "font-semibold",
                            Math.abs(recommendation.diameterDiff) <= 1.5
                                ? "text-success"
                                : Math.abs(recommendation.diameterDiff) <= 3
                                    ? "text-warning"
                                    : "text-destructive"
                        )}
                    >
                        {recommendation.diameterDiff > 0 ? "+" : ""}
                        {recommendation.diameterDiff.toFixed(1)}%
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Speedometer: {getSpeedometerImpact(recommendation.diameterDiff)}
                </p>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <h4 className="text-xs font-semibold text-success mb-2 uppercase tracking-wide">
                        Kelebihan
                    </h4>
                    <ul className="space-y-1">
                        {recommendation.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                <Check size={14} className="text-success mt-0.5 shrink-0" />
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-destructive mb-2 uppercase tracking-wide">
                        Pertimbangan
                    </h4>
                    <ul className="space-y-1">
                        {recommendation.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <X size={14} className="text-destructive mt-0.5 shrink-0" />
                                <span>{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="border-t border-border pt-4 mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Perbandingan
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="text-muted-foreground"></div>
                    <div className="font-medium text-muted-foreground">Lebar</div>
                    <div className="font-medium text-muted-foreground">Profil</div>
                    <div className="font-medium text-muted-foreground">Velg</div>

                    <div className="text-left text-muted-foreground">Original</div>
                    <div className="text-foreground">{originalSize.width}mm</div>
                    <div className="text-foreground">{originalSize.aspectRatio}%</div>
                    <div className="text-foreground">R{originalSize.rimDiameter}</div>

                    <div className="text-left text-primary font-medium">Baru</div>
                    <div className="text-primary font-medium">{recommendation.width}mm</div>
                    <div className="text-primary font-medium">{recommendation.aspectRatio}%</div>
                    <div className="text-primary font-medium">R{recommendation.rimDiameter}</div>
                </div>
            </div>

            {/* Brand Recommendations */}
            {matchingProducts.length > 0 && (
                <div className="border-t border-border pt-4">
                    <button
                        onClick={() => setShowBrands(!showBrands)}
                        className="flex items-center justify-between w-full text-left group"
                    >
                        <div>
                            <h4 className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">
                                Rekomendasi Merek
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {matchingProducts.length} produk tersedia
                            </p>
                        </div>
                        <div className="text-primary group-hover:scale-110 transition-transform">
                            {showBrands ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>

                    {showBrands && (
                        <div className="mt-4 grid gap-3 animate-fade-in">
                            {matchingProducts.map((product, i) => (
                                <BrandProductCard
                                    key={product.id}
                                    product={product}
                                    index={i}
                                    size={recommendation.size}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
