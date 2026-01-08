import DashboardFooter from "@/components/DashboardFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-stone-950">
      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* --- GLOBAL FOOTER --- */}
      <DashboardFooter />
    </div>
  );
}
