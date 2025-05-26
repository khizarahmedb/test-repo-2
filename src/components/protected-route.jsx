"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isLoading, _hasHydrated } = useUserStore();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated || isLoading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    if (!user) {
      router.push("/");
      return;
    }

    // **MODIFICATION HERE:**
    // Use user.role_name for checking against allowedRoles,
    // assuming allowedRoles contains strings like "Admin".
    const userRoleForCheck = user.role_name;
    const hasRequiredRole =
      allowedRoles.length === 0 || allowedRoles.includes(userRoleForCheck);

    if (!hasRequiredRole) {
      // This block is entered if the user's role_name does not match allowedRoles
      // for the current path.
      // It then redirects them to their default dashboard based on their role_name.
      switch (user.role_name) {
        case "Admin":
          router.push("/admin-dashboard");
          break;
        case "superadmin":
          router.push("/superadmin-dashboard");
          break;
        case "agent":
          router.push("/agent-dashboard");
          break;
        default:
          router.push("/");
      }
      return;
    }

    // If we reach here, the user has the required role for the current path.
    setIsAuthorized(true);
  }, [user, allowedRoles, router, isLoading, _hasHydrated, pathname]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">
            Please wait while we verify your access.
          </p>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}
