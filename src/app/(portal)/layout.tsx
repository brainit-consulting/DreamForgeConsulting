import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { HelpProvider } from "@/components/shared/help-modal";
import { AthenaChat } from "@/components/shared/athena-chat";
import { TopBar } from "@/components/shared/top-bar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HelpProvider>
      <div className="flex h-screen overflow-hidden">
        <PortalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
      <AthenaChat />
    </HelpProvider>
  );
}
