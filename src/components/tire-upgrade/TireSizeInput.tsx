import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TireSizeInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function TireSizeInput({ value, onChange, error }: TireSizeInputProps) {
    const [focused, setFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase();
        // Allow only valid tire size characters
        if (/^[0-9/R]*$/i.test(newValue) && newValue.length <= 10) {
            onChange(newValue);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="tire-size" className="text-base font-semibold">
                    Ukuran Ban Original
                </Label>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                            <HelpCircle size={18} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground">
                        <p className="text-sm">
                            <strong>Format:</strong> Lebar/Profile R Diameter Velg
                            <br />
                            <strong>Contoh:</strong> 205/55R16
                            <br />
                            <span className="text-muted-foreground">
                                Cek di sisi ban atau buku manual mobil Anda
                            </span>
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <div className="relative">
                <Input
                    id="tire-size"
                    type="text"
                    placeholder="205/55R16"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        "h-14 text-xl font-mono text-center bg-secondary border-2 transition-all duration-300",
                        focused && "border-primary ring-2 ring-primary/20",
                        error && "border-destructive",
                        !error && !focused && "border-border"
                    )}
                />
                {focused && !value && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <span className="text-muted-foreground/50 text-xl font-mono">
                            ___/__ R__
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
            )}

            <p className="text-xs text-muted-foreground">
                📝 Contoh: 195/65R15, 205/55R16, 225/45R17
            </p>
        </div>
    );
}
