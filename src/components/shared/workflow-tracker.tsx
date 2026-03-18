"use client";

import { cn } from "@/lib/utils";
import {
  Search,
  Palette,
  FileText,
  CheckCircle,
  Code,
  TestTubeDiagonal,
  Rocket,
  Star,
  Headphones,
} from "lucide-react";
import {
  WORKFLOW_STAGES,
  canTransitionTo,
  stageIndex as getStageIndex,
  type ProjectStatus,
} from "@/types";

const stageIcons: Record<ProjectStatus, React.ElementType> = {
  DISCOVERY: Search,
  DESIGN: Palette,
  PROPOSAL: FileText,
  APPROVAL: CheckCircle,
  DEVELOPMENT: Code,
  TESTING: TestTubeDiagonal,
  DEPLOYMENT: Rocket,
  LAUNCHED: Star,
  SUPPORT: Headphones,
};

interface WorkflowTrackerProps {
  currentStatus: ProjectStatus;
  progress: number;
  compact?: boolean;
  onStageClick?: (stage: ProjectStatus) => void;
}

export function WorkflowTracker({
  currentStatus,
  progress,
  compact = false,
  onStageClick,
}: WorkflowTrackerProps) {
  const activeIdx = getStageIndex(currentStatus);

  return (
    <div className={cn("flex items-center", compact ? "gap-1" : "gap-2")}>
      {WORKFLOW_STAGES.map((stage, idx) => {
        const Icon = stageIcons[stage.key];
        const isActive = idx === activeIdx;
        const isCompleted = idx < activeIdx;
        const isFuture = idx > activeIdx;
        const canClick =
          onStageClick && canTransitionTo(currentStatus, stage.key);

        return (
          <div
            key={stage.key}
            className={cn(
              "flex items-center",
              idx < WORKFLOW_STAGES.length - 1 && "flex-1"
            )}
          >
            {/* Stage node */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onStageClick?.(stage.key)}
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all",
                  compact ? "h-8 w-8" : "h-12 w-12",
                  isActive && "border-primary bg-primary/15 ember-pulse",
                  isCompleted && "border-emerald-500 bg-emerald-500/15",
                  isFuture && "border-border bg-muted",
                  canClick &&
                    "cursor-pointer hover:ring-2 hover:ring-primary/40 hover:scale-110",
                  !canClick && !isActive && !isCompleted && "cursor-default"
                )}
                title={
                  canClick
                    ? `Move to ${stage.label}`
                    : isActive
                      ? `Current stage`
                      : undefined
                }
              >
                <Icon
                  className={cn(
                    compact ? "h-3.5 w-3.5" : "h-5 w-5",
                    isActive && "text-primary",
                    isCompleted && "text-emerald-500",
                    isFuture && "text-muted-foreground"
                  )}
                />
              </button>
              {!compact && (
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      isActive && "text-primary",
                      isCompleted && "text-emerald-500",
                      isFuture && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-[10px] text-primary/70">
                      {progress}%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector line */}
            {idx < WORKFLOW_STAGES.length - 1 && (
              <div
                className={cn(
                  "flex-1 mx-1",
                  compact ? "h-0.5" : "h-0.5 mb-8",
                  isCompleted ? "bg-emerald-500" : "bg-border",
                  isActive && "bg-gradient-to-r from-primary to-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
