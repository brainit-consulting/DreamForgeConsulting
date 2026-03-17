"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { HelpButton } from "@/components/shared/help-modal";

// Ordered most-specific first so detail pages match before list pages
const pathToHelpKey: [string, string][] = [
  ["/portal/projects", "portal"],
  ["/portal/invoices", "portal"],
  ["/portal/tickets", "portal"],
  ["/portal", "portal"],
  ["/settings", "settings"],
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
  const helpKey =
    pathToHelpKey.find(([path]) =>
      pathname === path || pathname.startsWith(path)
    )?.[1] ?? "dashboard";

  return (
    <div className="flex h-12 items-center justify-end gap-1 border-b border-border px-6">
      <ThemeToggle />
      <HelpButton sectionKey={helpKey} />
    </div>
  );
}
