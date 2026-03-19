"use client";

import { useState, type ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HelpSection } from "@/lib/help-content";

/** Highlight keywords in admin guide tips */
function highlightKeywords(text: string): ReactNode {
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

/** Price Guidance table */
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

/** Admin guide two-column layout */
function AdminGuideLayout({ tips }: { tips: string[] }) {
  const chapterNames = [
    "Client Onboarding",
    "Outreach & Communication",
    "Projects & Proposals",
    "Invoicing & Payments",
    "Support & Maintenance",
    "System Administration",
    "Price Guidance",
  ];
  const chapters: Record<string, string[]> = Object.fromEntries(chapterNames.map((n) => [n, []]));

  for (const tip of tips) {
    if (tip.includes("PRICE GUIDANCE")) chapters["Price Guidance"].push(tip);
    else if (tip.includes("ONBOARD") || tip.includes("CLIENT APPROVAL") || tip.includes("HANDLE CLIENT") || tip.includes("ADD A LEAD") || tip.includes("WORK A LEAD") || tip.includes("PROMOTE") || tip.includes("RESEND") || tip.includes("MANAGE CLIENT")) chapters["Client Onboarding"].push(tip);
    else if (tip.includes("PROJECT") || tip.includes("PROPOSAL") || tip.includes("WORKFLOW") || tip.includes("SUBMIT FOR")) chapters["Projects & Proposals"].push(tip);
    else if (tip.includes("INVOICE") || tip.includes("PAYMENT") || tip.includes("REFUND") || tip.includes("DISPUTE")) chapters["Invoicing & Payments"].push(tip);
    else if (tip.includes("SUPPORT") || tip.includes("LOG")) chapters["Support & Maintenance"].push(tip);
    else if (tip.includes("OUTREACH") || tip.includes("COMPOSE")) chapters["Outreach & Communication"].push(tip);
    else chapters["System Administration"].push(tip);
  }

  const [active, setActive] = useState(chapterNames[0]);
  const activeItems = chapters[active] ?? [];
  const nonEmpty = chapterNames.filter((n) => chapters[n].length > 0);

  return (
    <div className="flex gap-0 rounded-lg border border-border/40 overflow-hidden min-h-[340px]">
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
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="font-display text-lg text-primary mb-4">{active}</h3>
        {active === "Price Guidance" ? (
          <PriceGuidanceContent items={activeItems} />
        ) : (
          <div className="space-y-4">
            {activeItems.map((tip, i) => (
              <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
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

/** Portal guide with collapsible sections */
function PortalGuideLayout({ tips }: { tips: string[] }) {
  const chapterNames = ["Your Projects", "Invoices & Payments", "Support Tickets", "Your Account"];
  const chapters: Record<string, string[]> = Object.fromEntries(chapterNames.map((n) => [n, []]));

  for (const tip of tips) {
    if (tip.toLowerCase().includes("project") || tip.toLowerCase().includes("workflow") || tip.toLowerCase().includes("approval") || tip.toLowerCase().includes("stage")) chapters["Your Projects"].push(tip);
    else if (tip.toLowerCase().includes("invoice") || tip.toLowerCase().includes("pay") || tip.toLowerCase().includes("stripe")) chapters["Invoices & Payments"].push(tip);
    else if (tip.toLowerCase().includes("ticket") || tip.toLowerCase().includes("support request")) chapters["Support Tickets"].push(tip);
    else chapters["Your Account"].push(tip);
  }

  const [active, setActive] = useState(chapterNames[0]);
  const activeItems = chapters[active] ?? [];
  const nonEmpty = chapterNames.filter((n) => chapters[n].length > 0);

  return (
    <div className="flex gap-0 rounded-lg border border-border/40 overflow-hidden min-h-[280px]">
      <nav className="w-48 shrink-0 border-r border-border/30 bg-muted/20">
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
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="font-display text-lg text-primary mb-4">{active}</h3>
        <div className="space-y-3">
          {activeItems.map((tip, i) => (
            <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-sm leading-relaxed text-foreground/80 font-sans">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PORTAL_SECTION_KEYS = new Set(["portal", "projectDetail"]);

/** Shared help content renderer — used in both modal and standalone pop-out page */
export function StandaloneHelpContent({ sectionKey, section }: { sectionKey: string; section: HelpSection }) {
  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed text-foreground/90">{section.content}</p>

      {section.tips && section.tips.length > 0 && (
        sectionKey === "adminGuide" ? (
          <AdminGuideLayout tips={section.tips} />
        ) : PORTAL_SECTION_KEYS.has(sectionKey) ? (
          <PortalGuideLayout tips={section.tips} />
        ) : (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="font-display text-lg text-primary">Tips</span>
            </div>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
