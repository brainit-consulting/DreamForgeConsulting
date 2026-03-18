"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { HelpCircle, X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { helpContent, type HelpSection } from "@/lib/help-content";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { cn } from "@/lib/utils";

interface HelpModalState {
  isOpen: boolean;
  sectionKey: string;
}

interface HelpContextValue {
  openHelp: (sectionKey: string) => void;
  closeHelp: () => void;
  state: HelpModalState;
}

const HelpContext = createContext<HelpContextValue | null>(null);

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp must be used within HelpProvider");
  return ctx;
}

export function HelpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HelpModalState>({
    isOpen: false,
    sectionKey: "dashboard",
  });

  const openHelp = (sectionKey: string) =>
    setState({ isOpen: true, sectionKey });
  const closeHelp = () => setState((prev) => ({ ...prev, isOpen: false }));

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp, state }}>
      {children}
      {state.isOpen && <HelpModalPanel />}
    </HelpContext.Provider>
  );
}

function HelpModalPanel() {
  const { closeHelp, state } = useHelp();
  const section: HelpSection = helpContent[state.sectionKey] ?? {
    title: "Help",
    content: "No help content available for this section.",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <Rnd
        default={{
          x: Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 1200) * 0.1),
          y: Math.max(0, (typeof window !== "undefined" ? window.innerHeight : 800) * 0.1),
          width: typeof window !== "undefined" ? window.innerWidth * 0.8 : 960,
          height: typeof window !== "undefined" ? window.innerHeight * 0.8 : 640,
        }}
        minWidth={400}
        minHeight={300}
        bounds="window"
        dragHandleClassName="help-drag-handle"
        className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header — drag handle */}
        <div className="help-drag-handle flex h-14 cursor-move items-center justify-between border-b border-border bg-muted/50 px-5">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">{section.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeHelp}
            className="h-8 w-8"
            aria-label="Close help"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-3.5rem)]">
          <div className="p-6 space-y-6">
            <p className="text-base leading-relaxed text-foreground/90">
              {section.content}
            </p>

            {section.tips && section.tips.length > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-display text-lg text-primary">
                    Tips
                  </span>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </Rnd>
    </div>
  );
}

export function HelpButton({
  sectionKey,
  className,
  icon,
  label,
}: {
  sectionKey: string;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
}) {
  const { openHelp } = useHelp();

  return (
    <ActionTooltip label={label ?? "Help & tips"}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => openHelp(sectionKey)}
        className={cn("h-8 w-8 text-muted-foreground hover:text-primary", className)}
        aria-label={label ?? `Help for ${sectionKey}`}
      >
        {icon ?? <HelpCircle className="h-4 w-4" />}
      </Button>
    </ActionTooltip>
  );
}
