"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const { user, clearUser } = useUserStore();
  const { currentRoute, setRoute } = useNavigationStore();

  const navItems = React.useMemo(() => {
    return getNavItemsByRole("admin");
  }, []);

  React.useEffect(() => {
    if (
      pathname &&
      pathname.startsWith("/admin-dashboard") &&
      pathname !== currentRoute
    ) {
      setRoute(pathname);
    }
  }, [pathname, currentRoute, setRoute]);

  const handleNavigation = (href) => {
    setRoute(href);
    router.push(href);
  };

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="w-[280px] rounded-3xl m-6 btn-gradient-paint flex flex-col">
      <SidebarHeader className="pt-6 pb-4">
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 overflow-hidden"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/70">Admin</span>
            <span className="text-sm font-medium text-white">
              {user?.name || "Andrew Smith"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 px-4 py-2">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin-dashboard" &&
                pathname?.startsWith(item.href)) ||
              (item.href === "/admin-dashboard" &&
                pathname === "/admin-dashboard");

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.href)}
                  isActive={isActive}
                  size="lg"
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-4 py-4 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-white !text-purple-700 hover:text-purple-700"
                        : "text-white hover:bg-white/10 hover:text-white"
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
