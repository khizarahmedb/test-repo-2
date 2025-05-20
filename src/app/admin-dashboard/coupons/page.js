"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function CouponsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/coupons");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Coupons</h1>
      <p className="text-muted-foreground">Manage your coupons here</p>
    </div>
  );
}
