"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck } from "lucide-react";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { toast } from "sonner";

export function InviteButton({ clientId, hasPortal }: { clientId: string; hasPortal: boolean }) {
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(hasPortal);

  if (invited) {
    return (
      <ActionTooltip label="Client has portal access">
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-500">
          <ShieldCheck className="h-4 w-4" />
          Portal Active
        </div>
      </ActionTooltip>
    );
  }

  async function handleInvite() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setInvited(true);
      } else {
        toast.error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionTooltip label="Send portal invite email">
      <Button variant="outline" size="sm" onClick={handleInvite} disabled={loading}>
        <Mail className="mr-2 h-3.5 w-3.5" />
        {loading ? "Sending..." : "Send Invite"}
      </Button>
    </ActionTooltip>
  );
}
