"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FolderPlus,
  Calendar,
  Receipt,
  TicketCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const portalNav = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Projects", href: "/portal/projects", icon: FolderKanban },
  { label: "Request a Project", href: "/portal/request-project", icon: FolderPlus },
  { label: "Book a Call", href: "https://cal.com/emile-du-toit-lhb4qv/discovery-call", icon: Calendar, external: true },
  { label: "Invoices", href: "/portal/invoices", icon: Receipt },
  { label: "Tickets", href: "/portal/tickets", icon: TicketCheck },
  { label: "Settings", href: "/portal/settings", icon: Settings },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-20 items-center px-4">
        <Logo />
      </div>

      {/* Portal badge */}
      <div className="mx-4 mb-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <p className="text-xs font-medium text-primary">Client Portal</p>
        <p className="text-[10px] text-muted-foreground">
          Welcome back
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {portalNav.map((item) => {
          if ("external" in item && item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-base font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          }
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-base font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <p className="text-center text-[10px] text-muted-foreground">Client Portal</p>
        <p className="mt-1 text-center text-[10px] text-muted-foreground/50">v0.1.0</p>
      </div>
    </aside>
  );
}
