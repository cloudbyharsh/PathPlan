import { cn } from "@/lib/utils";
import { OKRStatus } from "@/types";
import { getStatusColors, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: OKRStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = getStatusColors(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      {getStatusLabel(status)}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gray" | "indigo" | "green" | "amber" | "red";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  const variants = {
    gray: "bg-gray-100 text-gray-700",
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
