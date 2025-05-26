"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/protected-route";
import { use, useEffect } from "react";

export default function AdminDashboardLayout({ children }) {
  useEffect(() => {
    console.log("AdminDashboardLayout mounted");
  }, []);
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <SidebarProvider>
        <div className="flex min-h-screen w-[100vw]">
          <AppSidebar />
          <main className="flex w-[80vw] p-6">{children}</main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
