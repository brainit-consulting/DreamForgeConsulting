import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 forge-glow">
        <Flame className="h-5 w-5 text-primary" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display text-lg leading-tight tracking-tight">
            DreamForge
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Consulting
          </span>
        </div>
      )}
    </div>
  );
}
