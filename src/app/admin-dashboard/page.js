"use client";

import { useEffect } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const { setRoute } = useNavigationStore();
  const { user } = useUserStore();

  useEffect(() => {
    setRoute("/admin-dashboard");
    console.log("User:", user);
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your admin dashboard</p>
    </div>
  );
}
