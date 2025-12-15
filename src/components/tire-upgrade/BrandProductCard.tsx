import { TireProduct, TireBrand, formatPrice } from "@/lib/tireBrands";
import { cn } from "@/lib/utils";
import { Star, Shield, Tag } from "lucide-react";

interface BrandProductCardProps {
    product: TireProduct & { brand: TireBrand };
    index: number;
    size: string;
}

export function BrandProductCard({ product, index, size }: BrandProductCardProps) {
    const tierColors = {
        premium: "border-primary/50 bg-primary/5",
        mid: "border-info/50 bg-info/5",
        budget: "border-success/50 bg-success/5",
    };

    const tierLabels = {
        premium: { text: "Premium", color: "text-primary" },
        mid: { text: "Mid-Range", color: "text-info" },
        budget: { text: "Budget", color: "text-success" },
    };

    const handleCheckPrice = () => {
        const query = `harga ban ${product.brand.name} ${product.name} ${size}`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`, '_blank');
    };

    return (
        <div
            className={cn(
                "rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] animate-slide-up bg-card",
                tierColors[product.brand.tier]
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{product.brand.logo}</span>
                    <div>
                        <h4 className="font-semibold text-foreground text-sm">
                            {product.brand.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{product.name}</p>
                    </div>
                </div>
                <span
                    className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full bg-current/10",
                        tierLabels[product.brand.tier].color
                    )}
                >
                    {tierLabels[product.brand.tier].text}
                </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={cn(
                            i < Math.floor(product.rating)
                                ? "fill-warning text-warning"
                                : "text-muted-foreground/30"
                        )}
                    />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                    {product.rating.toFixed(1)}
                </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                        {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                    </span>
                </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-3">
                {product.features.slice(0, 2).map((feature, i) => (
                    <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                    >
                        {feature}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield size={12} />
                    <span>Garansi {product.warranty}</span>
                </div>

                <button
                    onClick={handleCheckPrice}
                    className="text-xs font-medium text-primary hover:text-primary/80 hover:underline flex items-center gap-1 transition-colors"
                >
                    Cek Harga Terbaru -&gt;
                </button>
            </div>
        </div>
    );
}
