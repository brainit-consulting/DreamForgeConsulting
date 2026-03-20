"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { helpContent, type HelpSection } from "@/lib/help-content";
import { StandaloneHelpContent, PORTAL_SECTION_KEYS } from "@/components/shared/help-standalone";
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

export function HelpProvider({ children, isPortal }: { children: ReactNode; isPortal?: boolean }) {
  const [state, setState] = useState<HelpModalState>({
    isOpen: false,
    sectionKey: "dashboard",
  });

  const openHelp = useCallback((sectionKey: string) => {
    if (isPortal && !PORTAL_SECTION_KEYS.has(sectionKey)) return;
    setState({ isOpen: true, sectionKey });
  }, [isPortal]);
  const closeHelp = useCallback(() =>
    setState((prev) => ({ ...prev, isOpen: false })), []);

  // Listen for pop-in messages from the external help window
  useEffect(() => {
    const channel = new BroadcastChannel("dreamforge-help");
    channel.onmessage = (e) => {
      if (e.data?.type === "pop-in" && e.data.sectionKey) {
        openHelp(e.data.sectionKey); // openHelp already enforces portal allowlist
      }
    };
    return () => channel.close();
  }, [openHelp]);

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

  function popOut() {
    const w = 1100;
    const h = 750;
    const left = (screen.width - w) / 2;
    const top = (screen.height - h) / 2;
    window.open(
      `/help?section=${state.sectionKey}`,
      "dreamforge-help",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    closeHelp();
  }

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
          <div className="flex items-center gap-1">
            <ActionTooltip label="Pop out to separate window">
              <Button
                variant="ghost"
                size="icon"
                onClick={popOut}
                className="h-8 w-8"
                aria-label="Pop out"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </ActionTooltip>
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
        </div>

        {/* Content — uses shared component */}
        <ScrollArea className="h-[calc(100%-3.5rem)]">
          <div className="p-6">
            <StandaloneHelpContent sectionKey={state.sectionKey} section={section} />
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
