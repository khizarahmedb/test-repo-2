"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store"; // Assuming this path is correct

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isLoading, _hasHydrated } = useUserStore(); // Destructure _hasHydrated
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isChecking, setIsChecking] = useState(true); // Still starts as true
  const pathname = usePathname();

  useEffect(() => {
    // We are "checking" until the store has hydrated AND is no longer loading.
    // This is the core change: isChecking depends on _hasHydrated
    if (!_hasHydrated || isLoading) {
      return; // Still in a loading/hydration state
    }

    // At this point, _hasHydrated is true and isLoading is false (meaning initial load is done)
    setIsChecking(false); // Now we can stop showing the "checking" overlay

    if (!user) {
      router.push("/");
      return;
    }

    const hasRequiredRole =
      allowedRoles.length === 0 || allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect if the user does NOT have the required role
      // Ensure user.role_name matches your actual role names
      switch (user.role_name) {
        case "Admin":
          router.push("/admin-dashboard");
          console.log(user.role_name, " path ", pathname);

          break;
        case "superadmin": // Add other roles if needed
          router.push("/superadmin-dashboard");
          break;
        case "agent": // Add other roles if needed
          router.push("/agent-dashboard");
          break;
        default:
          router.push("/");
      }
      return;
    }

    // If user exists AND has the required role
    setIsAuthorized(true);
  }, [user, allowedRoles, router, isLoading, _hasHydrated]); // Add _hasHydrated to dependencies

  // Render loading if we are still hydrating OR actively loading
  if (isLoading || isChecking) {
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
