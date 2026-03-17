"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FolderKanban,
  Receipt,
  TicketCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockActivities } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  project_update: FolderKanban,
  invoice_paid: Receipt,
  ticket_created: TicketCheck,
  lead_created: UserPlus,
  client_converted: Users,
};

const colorMap: Record<string, string> = {
  project_update: "text-blue-500 bg-blue-500/10",
  invoice_paid: "text-emerald-500 bg-emerald-500/10",
  ticket_created: "text-amber-500 bg-amber-500/10",
  lead_created: "text-purple-500 bg-purple-500/10",
  client_converted: "text-primary bg-primary/10",
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-0">
            {mockActivities.map((activity) => {
              const Icon = iconMap[activity.type] ?? FolderKanban;
              const color = colorMap[activity.type] ?? "text-muted-foreground bg-muted";
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-border/50 px-6 py-3 last:border-0"
                >
                  <div className={cn("mt-0.5 rounded-md p-1.5", color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
