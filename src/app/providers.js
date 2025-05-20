// app/providers.jsx
"use client"; // This directive makes it a Client Component

import { useEffect } from "react";
import { useUserStore } from "@/lib/store"; // Adjust the path if necessary

export function Providers({ children }) {
  const setHasHydrated = useUserStore((state) => state.setHasHydrated);

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  return <>{children}</>;
}
