"use client";

import * as React from "react";
import {
  LogOut,
  Home as HomeIcon /* Assuming you have icons */,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { useUserStore, useNavigationStore } from "@/lib/store"; // Assuming these exist
import { getNavItemsByRole } from "@/lib/navigation"; // Assuming this exists
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Assuming these exist

// Helper function to determine active state (can be outside the component or memoized inside)
const checkIsActive = (itemHref, currentPathname, exactOnly = false) => {
  const normalizedItemHref =
    itemHref === "/" ? "/" : itemHref.replace(/\/$/, "");
  const normalizedPathname =
    currentPathname === "/" ? "/" : currentPathname.replace(/\/$/, "");

  if (normalizedPathname === normalizedItemHref) {
    return true;
  }
  if (exactOnly) {
    return false;
  }
  if (
    normalizedItemHref !== "/" &&
    normalizedPathname.startsWith(normalizedItemHref + "/")
  ) {
    return true;
  }
  return false;
};

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Crucial for active state
  const { user, clearUser } = useUserStore();
  const { currentRoute, setRoute } = useNavigationStore();

  const navItems = React.useMemo(() => {
    // Ensure getNavItemsByRole populates 'exactMatchOnly' where needed
    return getNavItemsByRole(user?.role_name);
  }, [user]);

  React.useEffect(() => {
    if (pathname && pathname !== currentRoute) {
      setRoute(pathname);
    }
  }, [pathname, currentRoute, setRoute]);

  const handleNavigation = (href) => {
    setRoute(href);
    router.push(href);
  };

  const handleLogout = () => {
    clearUser();
    router.push("/"); // Or your designated logout redirect path
  };

  return (
    <div className="w-[280px] rounded-3xl m-6 btn-gradient-paint flex flex-col">
      {" "}
      {/* Your styles */}
      <SidebarHeader className="pt-6 pb-4">
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 overflow-hidden">
            {/* User avatar or placeholder */}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/70">
              {user?.role_name || "Role"}
            </span>
            <span className="text-sm font-medium text-white">
              {user?.name || "User Name"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 px-4 py-2">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            // Use the new helper function. Pass item.exactMatchOnly (defaults to false if undefined)
            const isActive = checkIsActive(
              item.href,
              pathname,
              !!item.exactMatchOnly
            );

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.href)}
                  isActive={isActive}
                  size="lg" // Your defined size
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-4 py-4 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-white !text-purple-700 hover:text-purple-700" // Active styles
                        : "text-white hover:bg-white/10 hover:text-white" // Inactive styles
                    }
                  `}
                >
                  {item.icon && (
                    <span
                      className={`
                        h-5 w-5
                        ${isActive ? "!text-purple-700" : "text-white"}
                      `}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className={isActive ? "!text-purple-700" : ""}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-sm font-medium text-purple-700 hover:bg-white/90 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </SidebarFooter>
    </div>
  );
}
