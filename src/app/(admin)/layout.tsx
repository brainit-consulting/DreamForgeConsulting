import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { HelpProvider } from "@/components/shared/help-modal";
import { AthenaChat } from "@/components/shared/athena-chat";
import { TopBar } from "@/components/shared/top-bar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HelpProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
      <AthenaChat />
    </HelpProvider>
  );
}
