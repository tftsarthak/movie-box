import { Outlet } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-[#ff5757]/30 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
