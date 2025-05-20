"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function ReportsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/reports");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">View your reports here</p>
    </div>
  );
}
