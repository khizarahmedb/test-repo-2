"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function TicketsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/tickets");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Tickets</h1>
      <p className="text-muted-foreground">Manage your tickets here</p>
    </div>
  );
}
