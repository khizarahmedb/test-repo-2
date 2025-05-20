"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function InventoryPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/inventory");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Inventory</h1>
      <p className="text-muted-foreground">Manage your inventory here</p>
    </div>
  );
}
