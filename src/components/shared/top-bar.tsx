"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { HelpButton } from "@/components/shared/help-modal";

const pathToHelpKey: Record<string, string> = {
  "/dashboard": "dashboard",
  "/leads": "leads",
  "/clients": "clients",
  "/projects": "projects",
  "/invoices": "invoices",
  "/settings": "settings",
  "/portal": "portal",
  "/portal/projects": "portal",
  "/portal/invoices": "portal",
  "/portal/tickets": "portal",
};

export function TopBar() {
  const pathname = usePathname();
  const helpKey =
    Object.entries(pathToHelpKey).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    )?.[1] ?? "dashboard";

  return (
    <div className="flex h-12 items-center justify-end gap-1 border-b border-border px-6">
      <ThemeToggle />
      <HelpButton sectionKey={helpKey} />
    </div>
  );
}
