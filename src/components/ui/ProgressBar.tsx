import { cn, getStatusColors } from "@/lib/utils";
import { OKRStatus } from "@/types";

interface ProgressBarProps {
  percent: number;
  status?: OKRStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function ProgressBar({
  percent,
  status = "on_track",
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const colors = getStatusColors(status);
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex-1 bg-gray-100 rounded-full overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-gray-600 w-9 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}
