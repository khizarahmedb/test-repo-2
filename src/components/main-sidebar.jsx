"use client";

import * as React from "react";
import {
  BarChart3,
  Box,
  CreditCard,
  LogOut,
  Package,
  Tag,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/userContext";

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = React.useState(() => {
    const path = pathname?.split("/")[1] || "dashboard";
    return path;
  });
  const { user, setUser } = useUser();

  const adminName = "Andrew Smith";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      href: "/dashboard/products",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: CreditCard,
      href: "/dashboard/invoices",
    },
    { id: "coupons", label: "Coupons", icon: Tag, href: "/dashboard/coupons" },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      href: "/dashboard/tickets",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Box,
      href: "/dashboard/inventory",
    },
  ];

  const handleNavigation = (id, href) => {
    setSelectedItem(id);
    router.push(href);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    console.log("Logging out...");
    router.push("/");
  };

  return (
    <div className="w-[280px] rounded-3xl m-6 bg-gradient-to-b from-purple-500 to-purple-700 flex flex-col">
      {/* Header with admin profile */}
      <div className="pt-6 pb-2">
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 overflow-hidden">
            {/* <Image
              src="/placeholder.svg?height=48&width=48"
              alt="Admin avatar"
              width={48}
              height={48}
              className="rounded-full"
            /> */}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/70">Admin</span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = selectedItem === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id, item.href)}
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-white text-purple-700"
                        : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  <item.icon
                    className={`
                    h-5 w-5
                    ${isActive ? "text-purple-700" : "text-white"}
                  `}
                  />
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with logout button */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
