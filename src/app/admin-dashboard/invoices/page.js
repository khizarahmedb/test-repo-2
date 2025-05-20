"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function InvoicesPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/invoices");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Invoices</h1>
      <p className="text-muted-foreground">Manage your invoices here</p>
    </div>
  );
}
