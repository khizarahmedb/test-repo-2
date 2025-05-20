"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/store";

export default function SettingsPage() {
  const { setRoute } = useNavigationStore();

  useEffect(() => {
    setRoute("/admin-dashboard/settings");
  }, [setRoute]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Manage your settings here</p>
    </div>
  );
}
