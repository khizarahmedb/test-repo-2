"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function ProductsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/products");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Products</h1>
      <p className="text-muted-foreground">Manage your products here</p>
    </div>
  );
}
