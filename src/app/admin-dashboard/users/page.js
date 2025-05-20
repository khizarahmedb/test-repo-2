"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function UsersPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/users");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="text-muted-foreground">Manage your users here</p>
    </div>
  );
}
