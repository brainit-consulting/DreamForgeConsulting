"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HelpCircle, ArrowLeftToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { helpContent, type HelpSection } from "@/lib/help-content";
import { StandaloneHelpContent } from "@/components/shared/help-standalone";

function HelpPageInner() {
  const searchParams = useSearchParams();
  const sectionKey = searchParams.get("section") ?? "adminGuide";
  const section: HelpSection = helpContent[sectionKey] ?? {
    title: "Help",
    content: "No help content available.",
  };

  function popIn() {
    const channel = new BroadcastChannel("dreamforge-help");
    channel.postMessage({ type: "pop-in", sectionKey });
    channel.close();
    window.close();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 flex h-12 items-center gap-2.5 border-b border-border bg-card px-5">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h1 className="font-display text-lg">{section.title}</h1>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={popIn} className="gap-2 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeftToLine className="h-3.5 w-3.5" />
            Pop in
          </Button>
        </div>
      </div>
      <div className="p-6">
        <StandaloneHelpContent sectionKey={sectionKey} section={section} />
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading...</div>}>
      <HelpPageInner />
    </Suspense>
  );
}
