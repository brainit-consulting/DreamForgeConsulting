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
        width={80}
        height={80}
        className="rounded-lg forge-glow"
      />
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
    </Link>
  );
}
