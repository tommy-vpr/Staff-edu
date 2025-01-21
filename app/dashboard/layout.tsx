import DashboardHeader from "./(components)/DashboardHeader";
import DashboardSideBar from "./(components)/DashboardSideBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div className="hidden md:block w-[240px] lg:w-[300px] fixed top-0">
        <DashboardSideBar />
      </div>

      {/* Main Content */}
      <div className="w-full md:ml-[240px] lg:ml-[300px] flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex flex-col gap-4 lg:gap-6 min-h-[calc(100vh-60px)] h-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
