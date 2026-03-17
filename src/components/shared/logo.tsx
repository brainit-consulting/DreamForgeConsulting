import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <Link
      href="https://dreamforgeconsulting.vercel.app"
      className={cn("flex items-center gap-2.5", className)}
    >
      <Image
        src="/DreamForgeConsultingLogo.png"
        alt="DreamForge Consulting"
        width={64}
        height={64}
        className="rounded-lg forge-glow"
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display text-xl leading-tight tracking-tight">
            <span className="text-primary">Dream</span>Forge
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Consulting
          </span>
        </div>
      )}
    </Link>
  );
}
