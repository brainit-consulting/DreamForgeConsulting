import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "ember";

const variantStyles: Record<StatusVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  destructive: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  ember: "bg-primary/15 text-primary border-primary/20",
};

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  label,
  variant = "default",
  className,
  dot = false,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium text-xs",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-muted-foreground": variant === "default",
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-red-500": variant === "destructive",
            "bg-blue-500": variant === "info",
            "bg-primary": variant === "ember",
          })}
        />
      )}
      {label}
    </Badge>
  );
}
