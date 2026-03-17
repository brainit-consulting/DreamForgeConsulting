"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderKanban,
  Receipt,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const NavLink = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary forge-glow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={<span />}>
                  {NavLink}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return NavLink;
        })}
      </nav>

      {/* Footer — user info + sign out */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                {session?.user?.name?.charAt(0) ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium">{session?.user?.name ?? "Admin"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{session?.user?.email ?? ""}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => signOut().then(() => window.location.href = "/login")}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-muted-foreground"
            onClick={() => signOut().then(() => window.location.href = "/login")}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
