"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function ReviewsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/reviews");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Reviews</h1>
      <p className="text-muted-foreground">Manage your reviews here</p>
    </div>
  );
}
