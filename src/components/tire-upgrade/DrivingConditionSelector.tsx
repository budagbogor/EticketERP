import { drivingConditions } from "@/lib/tireCalculations";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DrivingConditionSelectorProps {
    selected: string[];
    onChange: (selected: string[]) => void;
}

export function DrivingConditionSelector({
    selected,
    onChange,
}: DrivingConditionSelectorProps) {
    const toggleCondition = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((s) => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold">
                Kondisi Berkendara (Opsional)
            </Label>
            <div className="flex flex-wrap gap-2">
                {drivingConditions.map((condition) => (
                    <button
                        key={condition.id}
                        type="button"
                        onClick={() => toggleCondition(condition.id)}
                        className={cn(
                            "px-4 py-2 rounded-full border-2 transition-all duration-200 flex items-center gap-2",
                            selected.includes(condition.id)
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-secondary border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                    >
                        <span>{condition.icon}</span>
                        <span className="text-sm font-medium">{condition.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
