"use client";

import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const stages: { key: LeadStatus; label: string; color: string }[] = [
  { key: "NEW", label: "New", color: "bg-blue-500" },
  { key: "CONTACTED", label: "Contacted", color: "bg-indigo-500" },
  { key: "QUALIFIED", label: "Qualified", color: "bg-primary" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-amber-500" },
  { key: "CONVERTED", label: "Converted", color: "bg-emerald-500" },
  { key: "LOST", label: "Lost", color: "bg-red-500" },
];

interface LeadPipelineProps {
  counts: Record<LeadStatus, number>;
}

export function LeadPipeline({ counts }: LeadPipelineProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-4">
      {stages.map((stage) => {
        const count = counts[stage.key] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div
            key={stage.key}
            className="flex flex-col items-center gap-1.5 flex-1"
          >
            <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", stage.color)}
                style={{ width: `${Math.max(pct > 0 ? 20 : 0, pct)}%` }}
              />
            </div>
            <span className="text-xs font-medium">{count}</span>
            <span className="text-[10px] text-muted-foreground">
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
