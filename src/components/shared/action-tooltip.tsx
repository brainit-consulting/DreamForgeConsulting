"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function ActionTooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function ActionTooltip({
  label,
  children,
  side = "top",
}: ActionTooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          style={{
            zIndex: 9999,
            backgroundColor: "oklch(0.18 0.015 270)",
            color: "oklch(0.92 0.01 80)",
            border: "1px solid oklch(1 0 0 / 10%)",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: 1,
            boxShadow: "0 4px 12px oklch(0 0 0 / 40%)",
            userSelect: "none",
            animationDuration: "150ms",
            animationTimingFunction: "ease-out",
          }}
        >
          {label}
          <RadixTooltip.Arrow
            style={{ fill: "oklch(0.18 0.015 270)" }}
          />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
