"use client";

import { usePathname } from "next/navigation";
import { LogOut, BookOpen } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { HelpButton } from "@/components/shared/help-modal";

// Ordered most-specific first so detail pages match before list pages
const pathToHelpKey: [string, string][] = [
  ["/portal/projects", "portal"],
  ["/portal/invoices", "portal"],
  ["/portal/tickets", "portal"],
  ["/portal", "portal"],
  ["/settings", "settings"],
  ["/outreach", "outreach"],
  ["/tickets", "tickets"],
  ["/invoices", "invoices"],
  ["/projects/", "projectDetail"],
  ["/projects", "projects"],
  ["/clients/", "clientDetail"],
  ["/clients", "clients"],
  ["/leads", "leads"],
  ["/dashboard", "dashboard"],
];

export function TopBar() {
  const pathname = usePathname();
  const isAdmin = !pathname.startsWith("/portal");
  const helpKey =
    pathToHelpKey.find(([path]) =>
      pathname === path || pathname.startsWith(path)
    )?.[1] ?? "dashboard";

  return (
    <div className="flex h-12 items-center justify-end gap-1 border-b border-border px-6">
      <span className="mr-auto font-display text-xs text-emerald-400/70">v0.2.0</span>
      {isAdmin && (
        <HelpButton sectionKey="adminGuide" icon={<BookOpen className="h-4 w-4" />} label="Admin Guide" />
      )}
      <ActionTooltip label="Sign out">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => signOut().then(() => window.location.href = "/login")}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </ActionTooltip>
      <ThemeToggle />
      <HelpButton sectionKey={helpKey} />
    </div>
  );
}
