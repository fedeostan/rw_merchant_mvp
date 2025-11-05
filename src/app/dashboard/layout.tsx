import { Sidebar } from "@/components/navigation/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-[277px] p-2">
        <main className="h-full bg-white rounded-xl shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
