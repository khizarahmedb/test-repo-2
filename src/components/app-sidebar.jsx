"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useUserStore, useNavigationStore } from "@/lib/store";
import { getNavItemsByRole } from "@/lib/navigation";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const router = useRouter();
  const { user, clearUser, isLoading } = useUserStore();
  const { currentRoute, setRoute } = useNavigationStore();

  // Get navigation items based on user role
  const navItems = React.useMemo(() => {
    // Default to admin if no role is set
    return getNavItemsByRole("admin");
  }, []);

  // Update the handleNavigation function to ensure it works correctly
  const handleNavigation = (href) => {
    setRoute(href);
    router.push(href);
  };

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="w-[280px] rounded-3xl m-6 bg-gradient-to-b from-purple-500 to-purple-700 flex flex-col">
      {/* Header with user profile */}
      <SidebarHeader className="pt-6 pb-2">
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 overflow-hidden">
            {/* Avatar placeholder */}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-white">
              {user?.name || "User"}
            </span>
            <span className="text-xs text-white/70">
              {user?.role || "Role"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Menu items */}
      <SidebarContent className="flex-1 px-4 py-6">
        <SidebarMenu className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              currentRoute === item.href ||
              (item.href !== "/admin-dashboard" &&
                currentRoute?.startsWith(item.href)) ||
              (item.href === "/admin-dashboard" &&
                currentRoute === "/admin-dashboard");
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.href)}
                  isActive={isActive}
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-white text-purple-700"
                        : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  {item.icon && (
                    <span
                      className={`
                        h-5 w-5
                        ${isActive ? "text-purple-700" : "text-white"}
                      `}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer with logout button */}
      <SidebarFooter className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </SidebarFooter>
    </div>
  );
}
