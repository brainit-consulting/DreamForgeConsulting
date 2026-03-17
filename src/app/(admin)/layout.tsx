import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { HelpProvider } from "@/components/shared/help-modal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HelpProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
        </main>
      </div>
    </HelpProvider>
  );
}
