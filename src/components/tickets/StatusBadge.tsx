import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || "status-new";

  return (
    <span className={cn("status-badge", colorClass, className)}>
      {label}
    </span>
  );
}
