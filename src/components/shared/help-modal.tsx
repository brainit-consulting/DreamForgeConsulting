"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { HelpCircle, X, Lightbulb, ChevronDown } from "lucide-react";
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

/** Highlight keywords in admin guide tips */
function highlightKeywords(text: string): ReactNode {
  // Bold the "HOW TO..." prefix and highlight key terms
  const parts = text.split(/(HOW TO [A-Z ]+:|→|Settings|Stripe|DRAFT|PAID|SENT|OVERDUE|REFUNDED|CANCELLED)/g);
  return parts.map((part, i) => {
    if (part.match(/^HOW TO [A-Z ]+:/)) {
      return <span key={i} className="font-display text-primary">{part}</span>;
    }
    if (part === "→") {
      return <span key={i} className="text-emerald-400 mx-0.5">{part}</span>;
    }
    if (["Settings", "Stripe"].includes(part)) {
      return <span key={i} className="text-emerald-400 font-medium">{part}</span>;
    }
    if (["DRAFT", "PAID", "SENT", "OVERDUE", "REFUNDED", "CANCELLED"].includes(part)) {
      return <span key={i} className="text-emerald-400 font-mono text-xs">{part}</span>;
    }
    return part;
  });
}

/** Collapsible section for admin guide */
function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-display text-base text-primary">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

/** Price Guidance table renderer */
function PriceGuidanceContent({ items }: { items: string[] }) {
  const rows = items
    .filter((t) => t.startsWith("PRICE GUIDANCE — "))
    .map((t) => {
      const after = t.replace("PRICE GUIDANCE — ", "");
      const colonIdx = after.indexOf(":");
      if (colonIdx === -1) return { service: after, rate: "", note: "" };
      const service = after.slice(0, colonIdx).trim();
      const rest = after.slice(colonIdx + 1).trim();
      const parenIdx = rest.indexOf("(");
      if (parenIdx === -1) return { service, rate: rest, note: "" };
      return {
        service,
        rate: rest.slice(0, parenIdx).trim(),
        note: rest.slice(parenIdx + 1).replace(/\)$/, "").trim(),
      };
    });
  const marketNote = items.find((t) => t.includes("below-market rates"));

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border/30">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-left py-2.5 px-4 font-display text-primary text-sm">Service</th>
              <th className="text-left py-2.5 px-4 font-display text-primary text-sm">Our Rate</th>
              <th className="text-left py-2.5 px-4 font-display text-primary text-sm">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border/20 hover:bg-muted/10 transition-colors">
                <td className="py-2.5 px-4 font-sans text-foreground/90 whitespace-nowrap">{row.service}</td>
                <td className="py-2.5 px-4 font-mono text-emerald-400 whitespace-nowrap">{row.rate}</td>
                <td className="py-2.5 px-4 font-sans text-foreground/60 text-xs">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {marketNote && (
        <p className="mt-3 text-xs text-foreground/40 font-sans italic">
          {marketNote.replace("PRICE GUIDANCE — ", "")}
        </p>
      )}
    </div>
  );
}

/** Admin guide — two-column layout with sidebar nav + content pane */
function AdminGuideTips({ tips }: { tips: string[] }) {
  const chapterNames = [
    "Client Onboarding",
    "Projects & Proposals",
    "Invoicing & Payments",
    "Support & Maintenance",
    "Outreach & Communication",
    "Price Guidance",
    "System Administration",
  ];
  const chapters: Record<string, string[]> = Object.fromEntries(chapterNames.map((n) => [n, []]));

  for (const tip of tips) {
    if (tip.includes("PRICE GUIDANCE")) {
      chapters["Price Guidance"].push(tip);
    } else if (tip.includes("ONBOARD") || tip.includes("CLIENT APPROVAL") || tip.includes("HANDLE CLIENT")) {
      chapters["Client Onboarding"].push(tip);
    } else if (tip.includes("PROJECT") || tip.includes("PROPOSAL")) {
      chapters["Projects & Proposals"].push(tip);
    } else if (tip.includes("INVOICE") || tip.includes("PAYMENT") || tip.includes("REFUND") || tip.includes("DISPUTE")) {
      chapters["Invoicing & Payments"].push(tip);
    } else if (tip.includes("SUPPORT") || tip.includes("LOG")) {
      chapters["Support & Maintenance"].push(tip);
    } else if (tip.includes("OUTREACH") || tip.includes("SEND")) {
      chapters["Outreach & Communication"].push(tip);
    } else {
      chapters["System Administration"].push(tip);
    }
  }

  const [active, setActive] = useState(chapterNames[0]);
  const activeItems = chapters[active] ?? [];
  const nonEmpty = chapterNames.filter((n) => chapters[n].length > 0);

  return (
    <div className="flex gap-0 rounded-lg border border-border/40 overflow-hidden min-h-[340px]">
      {/* Sidebar nav */}
      <nav className="w-52 shrink-0 border-r border-border/30 bg-muted/20">
        {nonEmpty.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive(name)}
            className={cn(
              "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-sans transition-colors border-b border-border/10",
              active === name
                ? "bg-primary/10 text-primary font-medium border-l-2 border-l-primary"
                : "text-foreground/60 hover:bg-muted/40 hover:text-foreground/80 border-l-2 border-l-transparent"
            )}
          >
            <span className="truncate">{name}</span>
            <span className="ml-auto text-xs text-foreground/30">{chapters[name].length}</span>
          </button>
        ))}
      </nav>

      {/* Content pane */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="font-display text-lg text-primary mb-4">{active}</h3>

        {active === "Price Guidance" ? (
          <PriceGuidanceContent items={activeItems} />
        ) : (
          <div className="space-y-4">
            {activeItems.map((tip, i) => (
              <div key={i} className="rounded-lg bg-muted/10 border border-border/20 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground/80 font-sans">
                  {highlightKeywords(tip)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Portal help with collapsible sections — client-facing equivalent of AdminGuideTips */
function PortalGuideTips({ tips }: { tips: string[] }) {
  const chapters: Record<string, string[]> = {
    "Your Projects": [],
    "Invoices & Payments": [],
    "Support Tickets": [],
    "Your Account": [],
  };

  for (const tip of tips) {
    if (tip.toLowerCase().includes("project") || tip.toLowerCase().includes("workflow") || tip.toLowerCase().includes("approval") || tip.toLowerCase().includes("stage")) {
      chapters["Your Projects"].push(tip);
    } else if (tip.toLowerCase().includes("invoice") || tip.toLowerCase().includes("pay") || tip.toLowerCase().includes("stripe")) {
      chapters["Invoices & Payments"].push(tip);
    } else if (tip.toLowerCase().includes("ticket") || tip.toLowerCase().includes("support request")) {
      chapters["Support Tickets"].push(tip);
    } else {
      chapters["Your Account"].push(tip);
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(chapters).map(([chapter, items]) =>
        items.length > 0 ? (
          <GuideSection key={chapter} title={chapter}>
            {items.map((tip, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80 font-sans">
                {tip}
              </p>
            ))}
          </GuideSection>
        ) : null
      )}
    </div>
  );
}

const PORTAL_SECTION_KEYS = new Set(["portal", "projectDetail"]);

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
              state.sectionKey === "adminGuide" ? (
                <AdminGuideTips tips={section.tips} />
              ) : PORTAL_SECTION_KEYS.has(state.sectionKey) ? (
                <PortalGuideTips tips={section.tips} />
              ) : (
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
              )
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
