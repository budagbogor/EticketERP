import { cn } from "@/lib/utils";

interface TireIconProps {
    className?: string;
    size?: number;
}

export function TireIcon({ className, size = 24 }: TireIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-current", className)}
        >
            <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
            />
            <circle
                cx="32"
                cy="32"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8 4"
            />
            <circle
                cx="32"
                cy="32"
                r="10"
                fill="currentColor"
                opacity="0.3"
            />
            <circle
                cx="32"
                cy="32"
                r="6"
                fill="currentColor"
            />
        </svg>
    );
}

interface TireTypeIconProps {
    typeId: string;
    className?: string;
    size?: number;
}

export function TireTypeIcon({ typeId, className, size = 32 }: TireTypeIconProps) {
    const iconMap: Record<string, string> = {
        'all-season': '☀️',
        'performance': '🏎️',
        'touring': '🛣️',
        'all-terrain': '🏔️',
        'rain': '🌧️',
    };

    return (
        <span className={cn("text-2xl", className)} style={{ fontSize: size }}>
            {iconMap[typeId] || '🔧'}
        </span>
    );
}
